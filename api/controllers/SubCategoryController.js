/**
 * SubCategoryControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// api/controllers/SubCategoryController.js

module.exports = {

  // GET /api/v1/subcategories/public
  // ?categoryId=ID
  publicList: async function (req, res) {
    try {
      const { categoryId } = req.query;
      if (!categoryId) {
        return res.badRequest({ message: 'categoryId es requerido' });
      }

      // Productos activos en la categoría y con subcategoría
      const activeProducts = await Product.find({
        isActive: true,
        category: categoryId,
        subcategory: { '!=': null }
      }).select(['id', 'subcategory']);

      const subcatIds = [...new Set(activeProducts.map(p => p.subcategory))];

      if (subcatIds.length === 0) {
        return res.ok([]);
      }

      const subcategories = await SubCategory.find({
        id: subcatIds
      }).sort('name ASC');

      return res.ok(subcategories);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al listar subcategorías públicas' });
    }
  },

  // GET /api/v1/subcategories/admin?categoryId=...
  adminList: async function (req, res) {
    try {
      const { categoryId } = req.query;

      const where = {};
      if (categoryId) where.category = categoryId;

      const subcategories = await SubCategory.find(where)
        .populate('category')
        .sort('name ASC');

      return res.ok(subcategories);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al listar subcategorías' });
    }
  },

  // POST /api/v1/subcategories
  create: async function (req, res) {
    try {
      const { name, slug, categoryId } = req.body;

      if (!name || !categoryId) {
        return res.badRequest({ message: 'name y categoryId son requeridos' });
      }

      const category = await Category.findOne({ id: categoryId });
      if (!category) {
        return res.badRequest({ message: 'Categoría no válida' });
      }

      const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

      const exists = await SubCategory.findOne({ slug: finalSlug });
      if (exists) {
        return res.badRequest({ message: 'El slug ya existe' });
      }

      const subcategory = await SubCategory.create({
        name,
        slug: finalSlug,
        category: categoryId
      }).fetch();

      return res.ok(subcategory);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al crear subcategoría' });
    }
  },

  // PUT /api/v1/subcategories/:id
  update: async function (req, res) {
    try {
      const id = req.params.id;
      const { name, slug, categoryId } = req.body;

      const dataToUpdate = {};
      if (name) dataToUpdate.name = name;
      if (slug) dataToUpdate.slug = slug;
      if (categoryId) dataToUpdate.category = categoryId;

      const updated = await SubCategory.updateOne({ id }).set(dataToUpdate);

      if (!updated) {
        return res.notFound({ message: 'Subcategoría no encontrada' });
      }

      return res.ok(updated);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al actualizar subcategoría' });
    }
  },

  // DELETE /api/v1/subcategories/:id
  delete: async function (req, res) {
    try {
      const id = req.params.id;

      const deleted = await SubCategory.destroyOne({ id });

      if (!deleted) {
        return res.notFound({ message: 'Subcategoría no encontrada' });
      }

      return res.ok({ message: 'Subcategoría eliminada' });

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error al eliminar subcategoría' });
    }
  },

};
