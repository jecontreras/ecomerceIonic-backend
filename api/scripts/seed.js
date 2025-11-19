/**
 * api/scripts/seed.js
 * Script completo para llenar datos por defecto en la base de datos.
 */

module.exports = {

  friendlyName: 'Seed database',

  description: 'Crea datos iniciales: admin, empresas, vendedores, categorías, tallas y 10 productos demo.',

  fn: async function () {

    sails.log("🌱 Iniciando SEED mejorado...");

    // pequeña función helper local para no repetir
    async function hashPassword(plain) {
      // Usa tu servicio global de Sails
      return await AuthService.hashPassword(plain);
    }

    // ───────────────────────────────────────────────
    // 1. ADMIN
    // ───────────────────────────────────────────────
    let admin = await User.findOne({ email: 'admin@demo.com' });

    if (!admin) {
      admin = await User.create({
        fullName: 'Administrador General',
        phone: '3000000000',
        email: 'admin@demo.com',
        password: await hashPassword('123456'),
        role: 'admin'
      }).fetch();
      sails.log("👑 Admin creado");
    }


    // ───────────────────────────────────────────────
    // 2. CREAR 6 EMPRESAS (1 demo + 5 extra)
    // ───────────────────────────────────────────────

    const empresasData = [
      { name: 'Empresa Demo', slug: 'empresa-demo', email: 'empresa@demo.com' },
      { name: 'Moda Latina', slug: 'moda-latina', email: 'moda@demo.com' },
      { name: 'Zapatería Central', slug: 'zapateria-central', email: 'zapatos@demo.com' },
      { name: 'Accesorios VIP', slug: 'accesorios-vip', email: 'accvip@demo.com' },
      { name: 'Ropa Express', slug: 'ropa-express', email: 'ropaexpress@demo.com' },
      { name: 'ColFashion', slug: 'colfashion', email: 'colfashion@demo.com' }
    ];

    const empresas = [];

    for (const e of empresasData) {

      // usuario empresa
      let user = await User.findOne({ email: e.email });

      if (!user) {
        user = await User.create({
          fullName: e.name,
          phone: String(Math.floor(Math.random() * 9000000000 + 3000000000)),
          email: e.email,
          password: await hashPassword('123456'),
          role: 'company_owner'
        }).fetch();
      }

      // empresa
      let empresa = await Company.findOne({ slug: e.slug });

      if (!empresa) {
        empresa = await Company.create({
          user: user.id,
          name: e.name,
          slug: e.slug,
          logo: null
        }).fetch();
      }

      empresas.push(empresa);
    }

    sails.log("🏢 Empresas creadas:", empresas.length);


    // ───────────────────────────────────────────────
    // 3. CREAR 5 VENDEDORES
    // ───────────────────────────────────────────────

    const vendedoresData = [
      { name: 'Vendedor 1', email: 'v1@demo.com', slug: 'tienda-v1' },
      { name: 'Vendedor 2', email: 'v2@demo.com', slug: 'tienda-v2' },
      { name: 'Vendedor 3', email: 'v3@demo.com', slug: 'tienda-v3' },
      { name: 'Vendedor 4', email: 'v4@demo.com', slug: 'tienda-v4' },
      { name: 'Vendedor 5', email: 'v5@demo.com', slug: 'tienda-v5' }
    ];

    const vendedores = [];

    for (const v of vendedoresData) {

      let user = await User.findOne({ email: v.email });

      if (!user) {
        user = await User.create({
          fullName: v.name,
          phone: String(Math.floor(Math.random() * 9000000000 + 3000000000)),
          email: v.email,
          password: await hashPassword('123456'),
          role: 'vendor'
        }).fetch();
      }

      let profile = await VendorProfile.findOne({ user: user.id });

      if (!profile) {
        profile = await VendorProfile.create({
          user: user.id,
          storeSlug: v.slug,
          theme: {},
          logo: null
        }).fetch();
      }

      vendedores.push(profile);
    }

    sails.log("🧑‍💼 Vendedores creados:", vendedores.length);


    // ───────────────────────────────────────────────
    // 4. CATEGORÍAS
    // ───────────────────────────────────────────────
    const categoriasBase = [
      { name: "Ropa Hombre", slug: "ropa-hombre" },
      { name: "Ropa Mujer", slug: "ropa-mujer" },
      { name: "Zapatos", slug: "zapatos" },
      { name: "Accesorios", slug: "accesorios" }
    ];

    const categorias = [];

    for (const c of categoriasBase) {
      let exists = await Category.findOne({ slug: c.slug });
      if (!exists) exists = await Category.create(c).fetch();
      categorias.push(exists);
    }

    sails.log("📂 Categorías creadas:", categorias.length);


    // ───────────────────────────────────────────────
    // 5. MEDIDAS (TALLAS)
    // ───────────────────────────────────────────────
    let typeRopa = await MeasurementType.findOne({ name: "Tallas Ropa" });

    if (!typeRopa) {
      typeRopa = await MeasurementType.create({ name: "Tallas Ropa" }).fetch();

      const tallasRopa = ["XS", "S", "M", "L", "XL"];
      for (const t of tallasRopa) {
        await MeasurementValue.create({ type: typeRopa.id, value: t });
      }
    }

    sails.log("📏 Tallas creadas");


    // ───────────────────────────────────────────────
    // 6. 10 PRODUCTOS DEMO
    // ───────────────────────────────────────────────

    const productosData = [];

    for (let i = 1; i <= 10; i++) {
      productosData.push({
        titulo: `Producto Demo ${i}`,
        slug: `producto-demo-${i}`,
        descripcion: "Producto de prueba para la tienda.",
        precioBase: Math.floor(Math.random() * 80000) + 20000,
        precioOferta: 0,
        image: `https://picsum.photos/600/600?random=${i}`,
        company: empresas[Math.floor(Math.random() * empresas.length)].id,
        category: categorias[Math.floor(Math.random() * categorias.length)].id,
        colores: ["Negro", "Blanco", "Azul"],
        tallas: ["S", "M", "L"],
        isActive: true
      });
    }

    const productos = [];

    for (const p of productosData) {
      let exists = await Product.findOne({ slug: p.slug });
      if (!exists) {
        exists = await Product.create(p).fetch();
      }
      productos.push(exists);
    }

    sails.log("🛒 Productos creados:", productos.length);


    // ───────────────────────────────────────────────
    // 7. Asignar algunos productos a vendedores
    // ───────────────────────────────────────────────
    for (const v of vendedores) {
      const randProduct = productos[Math.floor(Math.random() * productos.length)];
      await VendorProduct.findOrCreate(
        { vendedor: v.user, product: randProduct.id },
        { vendedor: v.user, product: randProduct.id, precioPersonalizado: 0 }
      );
    }

    sails.log("🛍 Productos asignados a vendedores");


    sails.log("🌱 SEED COMPLETADO ✔");
  }

};
