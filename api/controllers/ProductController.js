/**
 * ProductControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    publicList: async function (req, res) {
        try {
            const { categoryId, subcategoryId, search } = req.query;

            const where = { isActive: true };

            if (categoryId) where.category = categoryId;
            if (subcategoryId) where.subcategory = subcategoryId;
            if (search) where.titulo = { contains: search };

            const products = await Product.find(where)
            .sort('createdAt DESC')
            .limit(50);

            return res.ok(products);
        } catch (err) {
            sails.log.error(err);
            return res.serverError({ message: 'Error listando productos' });
        }
    },
    create: async function (req, res) {
        try {
            if (req.me.role !== 'company') {
            return res.forbidden('Solo empresas');
            }

            const data = req.body;

            data.company = req.me.companyId;

            data.slug = data.slug ||
            data.titulo.toLowerCase().replace(/\s+/g, '-') +
            '-' +
            Math.random().toString(36).substring(2, 7);

            const product = await Product.create(data).fetch();

            return res.ok(product);

        } catch (err) {
            sails.log.error(err);
            return res.serverError({ message: 'Error creando producto' });
        }
    },
    update: async function (req, res) {
        try {
            const productId = req.params.id;

            const product = await Product.findOne({ id: productId });
            if (!product) return res.notFound();

            if (req.me.role !== 'admin' && product.company !== req.me.companyId) {
            return res.forbidden('No autorizado');
            }

            const data = req.body;

            const updated = await Product.updateOne({ id: productId }).set(data);

            return res.ok(updated);

        } catch (err) {
            sails.log.error(err);
            return res.serverError({ message: 'Error editando producto' });
        }
    },
    detail: async function (req, res) {
        try {
            const id = req.params.id;

            const product = await Product.findOne({ id })
            .populate('company');

            if (!product) return res.notFound();

            return res.ok(product);

        } catch (err) {
            sails.log.error(err);
            return res.serverError({ message: 'Error al obtener producto' });
        }
    },
    




};

