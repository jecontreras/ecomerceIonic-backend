/**
 * CategoryControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// api/controllers/CategoryController.js

module.exports = {

  // GET /api/v1/categories/public
  // Devuelve solo categorías activas que tienen al menos 1 producto activo
  publicList: async function (req, res) {
    try {
      // 1. Buscar productos activos
      const activeProducts = await Product.find({
        isActive: true
      }).select(['id', 'category']);

      const categoryIds = [...new Set(activeProducts.map(p => p.category))];

      if (categoryIds.length === 0) {
        return res.ok([]);
      }

      // 2. Traer categorías activas que tengan productos
      const categories = await Category.find({
        id: categoryIds,
        isActive: true
      }).sort('name ASC');

      return res.ok(categories);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al listar categorías públicas' });
    }
  },

  // GET /api/v1/categories/admin
  // Lista completa para admin, con opción de filtro rápido
  adminList: async function (req, res) {
    try {
      const { search } = req.query;

      const where = {};
      if (search) {
        where.name = { contains: search };
      }

      const categories = await Category.find(where).sort('name ASC');

      return res.ok(categories);
    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al listar categorías' });
    }
  },

  // POST /api/v1/categories
  // Crear categoría (solo admin)
  create: async function (req, res) {
    try {
      const { name, slug, image, isActive } = req.body;

      if (!name) {
        return res.badRequest({ message: 'El nombre es obligatorio' });
      }

      const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

      const exists = await Category.findOne({ slug: finalSlug });
      if (exists) {
        return res.badRequest({ message: 'El slug ya existe' });
      }

      const category = await Category.create({
        name,
        slug: finalSlug,
        image,
        isActive: isActive !== undefined ? isActive : true
      }).fetch();

      return res.ok(category);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al crear categoría' });
    }
  },

  // PUT /api/v1/categories/:id
  update: async function (req, res) {
    try {
      const id = req.params.id;
      const { name, slug, image, isActive } = req.body;

      const dataToUpdate = {};
      if (name) dataToUpdate.name = name;
      if (slug) dataToUpdate.slug = slug;
      if (image !== undefined) dataToUpdate.image = image;
      if (typeof isActive === 'boolean') dataToUpdate.isActive = isActive;

      const updated = await Category.updateOne({ id }).set(dataToUpdate);

      if (!updated) {
        return res.notFound({ message: 'Categoría no encontrada' });
      }

      return res.ok(updated);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al actualizar categoría' });
    }
  },

  // DELETE /api/v1/categories/:id
  // Recomendado marcar inactiva en vez de borrar duro
  delete: async function (req, res) {
    try {
      const id = req.params.id;

      const updated = await Category.updateOne({ id }).set({ isActive: false });

      if (!updated) {
        return res.notFound({ message: 'Categoría no encontrada' });
      }

      return res.ok({ message: 'Categoría desactivada' });

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al eliminar categoría' });
    }
  },

};
