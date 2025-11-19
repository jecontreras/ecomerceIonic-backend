/**
 * AuthControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// api/controllers/AuthController.js
module.exports = {

  // POST /api/v1/auth/register
  register: async function (req, res) {
    try {
      const { fullName, phone, email, password, role } = req.body;

      if (!['customer', 'vendor'].includes(role)) {
        return res.badRequest({ message: 'Rol no permitido para registro público' });
      }

      const passwordHash = await AuthService.hashPassword(password);

      const newUser = await User.create({
        fullName,
        phone,
        email,
        password: passwordHash,
        role,
      }).fetch();

      // Crear perfil según rol
      if (role === 'customer') {
        await CustomerProfile.create({ user: newUser.id });
      } else if (role === 'vendor') {
        const storeSlug = `v-${newUser.id}`;
        await VendorProfile.create({ user: newUser.id, storeSlug });
      }

      const token = AuthService.generateToken(newUser);

      return res.json({
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          role: newUser.role,
        },
        token,
      });

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error en registro' });
    }
  },

  // POST /api/v1/auth/login
  login: async function (req, res) {
    try {
      const { phone, password } = req.body;

      const user = await User.findOne({ phone });
      if (!user) {
        return res.badRequest({ message: 'Usuario o contraseña inválidos' });
      }

      const isValid = await AuthService.comparePassword(password, user.password);
      if (!isValid) {
        return res.badRequest({ message: 'Usuario o contraseña inválidos' });
      }

      const token = AuthService.generateToken(user);

      await User.updateOne({ id: user.id }).set({ lastLoginAt: new Date() });

      return res.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
        },
        token,
      });

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error en login' });
    }
  },

  registerCompany: async function (req, res) {
    try {
      if (req.me.role !== 'admin') {
        return res.forbidden({ message: 'No autorizado' });
      }

      const { fullName, phone, email, password, companyName } = req.body;

      const hashed = await AuthService.hashPassword(password);

      const user = await User.create({
        fullName,
        phone,
        email,
        password: hashed,
        role: 'company_owner'
      }).fetch();

      const slug = companyName.toLowerCase().replace(/ /g, '-');

      await Company.create({
        user: user.id,
        name: companyName,
        slug
      });

      const token = AuthService.generateToken(user);

      return res.ok({ user, token });

    } catch (error) {
      sails.log.error(error);
      return res.serverError({ message: 'Error al crear empresa' });
    }
  },
  // POST /api/v1/auth/register-vendor
  // POST /api/v1/auth/register-vendor
  registerVendor: async function (req, res) {
    try {
      req.file('logo').upload({
        dirname: require('path').resolve(sails.config.appPath, 'assets/uploads/vendors'),
        maxBytes: 5_000_000
      }, async (err, uploadedFiles) => {

        if (err) return res.serverError(err);

        const {
          fullName,
          phone,
          email,
          password,
          referredBy
        } = req.body;

        const role = 'vendor';

        if (!fullName || !phone || !password) {
          return res.badRequest({ message: 'Faltan datos del vendedor' });
        }

        // Verificar duplicado
        const exist = await User.findOne({ phone });
        if (exist) {
          return res.badRequest({ message: 'El teléfono ya está registrado' });
        }

        // Hash del password
        const passwordHash = await AuthService.hashPassword(password);

        // Crear usuario
        const newUser = await User.create({
          fullName,
          phone,
          email,
          password: passwordHash,
          role
        }).fetch();

        // Procesar logo
        let logoUrl = null;
        if (uploadedFiles.length > 0) {
          const filename = uploadedFiles[0].fd.split('/').pop();
          logoUrl = `/uploads/vendors/${filename}`;
        }

        // Slug generado automáticamente
        const storeSlug = `${fullName.toLowerCase().replace(/\s+/g, '-')}-${newUser.id}`;

        // Crear VendorProfile usando TUS CAMPOS ORIGINALES
        const vendorProfile = await VendorProfile.create({
          user: newUser.id,
          storeSlug,
          theme: {},
          facebookPixel: null,
          referredBy: referredBy || null,
          logo: logoUrl
        }).fetch();

        const token = AuthService.generateToken(newUser);

        return res.ok({
          user: {
            id: newUser.id,
            fullName: newUser.fullName,
            phone: newUser.phone,
            role: newUser.role
          },
          vendorProfile,
          token
        });

      });

    } catch (error) {
      sails.log.error(error);
      return res.serverError({ message: 'Error al registrar vendedor' });
    }
  },



};
