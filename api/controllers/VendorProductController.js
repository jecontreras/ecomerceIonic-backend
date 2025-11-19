module.exports = {

    addProduct: async function (req, res) {
        try {
            const { productId } = req.body;

            if (req.me.role !== 'vendor') {
            return res.forbidden('Solo vendedores');
            }

            const product = await Product.findOne({ id: productId });
            if (!product) return res.notFound();

            const exists = await VendorProduct.findOne({
            vendedor: req.me.id,
            product: productId
            });

            if (exists) return res.ok(exists);

            const vp = await VendorProduct.create({
            vendedor: req.me.id,
            product: productId
            }).fetch();

            return res.ok(vp);

        } catch (err) {
            sails.log.error(err);
            return res.serverError({ message: 'Error agregando producto al vendedor' });
        }
    },
    myProducts: async function (req, res) {
        try {
            if (req.me.role !== 'vendor') {
            return res.forbidden('Solo vendedores');
            }

            const list = await VendorProduct.find({
            vendedor: req.me.id,
            isActive: true
            }).populate('product');

            return res.ok(list);

        } catch (err) {
            sails.log.error(err);
            return res.serverError({ message: 'Error listando productos del vendedor' });
        }
    },
    update: async function (req, res) {
        try {
            const id = req.params.id;

            const vp = await VendorProduct.findOne({ id });
            if (!vp) return res.notFound();

            if (req.me.id !== vp.vendedor) {
            return res.forbidden('No autorizado');
            }

            const updated = await VendorProduct.updateOne({ id }).set(req.body);

            return res.ok(updated);

        } catch (err) {
            sails.log.error(err);
            return res.serverError({ message: 'Error actualizando producto del vendedor' });
        }
    },
    



}