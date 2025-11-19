/**
 * HomeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  summary: async function (req, res) {
    try {
      // --------------------------
      // CATEGORÍAS ACTIVAS
      // --------------------------
      const categories = await Category.find({
        isActive: true
      }).select(['id', 'name', 'slug']);

      // --------------------------
      // PRODUCTOS EN TENDENCIA
      // (los más visitados o aleatorios)
      // --------------------------
      const trendingProducts = await Product.find({
        isActive: true
      })
        .limit(6)
        .sort('createdAt DESC')
        .select(['id', 'titulo', 'image', 'precioBase', 'precioOferta']);

      // --------------------------
      // LOS MÁS VENDIDOS (simulado)
      // --------------------------
      const topSellers = await Product.find({
        isActive: true
      })
        .limit(6)
        .sort('id DESC')
        .select(['id', 'titulo', 'image']);

      // --------------------------
      // LOS MÁS NUEVOS
      // --------------------------
      const newProducts = await Product.find({
        isActive: true
      })
        .limit(6)
        .sort('createdAt DESC')
        .select(['id', 'titulo', 'image', 'precioBase', 'precioOferta']);

      return res.ok({
        categories,
        trendingProducts: trendingProducts.map(p => ({
          ...p,
          precioVenta: p.precioOferta > 0 ? p.precioOferta : p.precioBase
        })),
        topSellers,
        newProducts: newProducts.map(p => ({
          ...p,
          precioVenta: p.precioOferta > 0 ? p.precioOferta : p.precioBase
        }))
      });

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error cargando datos del home' });
    }
  }
};
