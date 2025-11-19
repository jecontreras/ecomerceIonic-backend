/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  // Auth
  'POST /api/v1/auth/register': 'AuthController.register',
  'POST /auth/register-vendor': 'AuthController.registerVendor',
  'POST /api/v1/auth/login': 'AuthController.login',

  // Registro empresa
  'POST /api/v1/auth/register-company': 'AuthController.registerCompany',

    // ==== CATEGORIES ====
  'GET /api/v1/categories/public': 'CategoryController.publicList',

  // Admin
  'GET /api/v1/categories/admin': 'CategoryController.adminList',
  'POST /api/v1/categories': 'CategoryController.create',
  'PUT /api/v1/categories/:id': 'CategoryController.update',
  'DELETE /api/v1/categories/:id': 'CategoryController.delete',

  // ==== SUBCATEGORIES ====
  'GET /api/v1/subcategories/public': 'SubCategoryController.publicList',

  // Admin
  'GET /api/v1/subcategories/admin': 'SubCategoryController.adminList',
  'POST /api/v1/subcategories': 'SubCategoryController.create',
  'PUT /api/v1/subcategories/:id': 'SubCategoryController.update',
  'DELETE /api/v1/subcategories/:id': 'SubCategoryController.delete',

   // PRODUCTOS
  'GET    /api/v1/products'          : 'ProductController.publicList',
  'GET    /api/v1/products/:id'      : 'ProductController.detail',

  // Empresa
  'POST   /api/v1/products'          : 'ProductController.create',
  'PUT    /api/v1/products/:id'      : 'ProductController.update',

  // VENDEDOR
  'POST   /api/v1/vendor/products'        : 'VendorProductController.addProduct',
  'GET    /api/v1/vendor/products'        : 'VendorProductController.myProducts',
  'PUT    /api/v1/vendor/products/:id'    : 'VendorProductController.update',


  // ÓRDENES
  'POST /api/v1/orders'                : 'OrderController.create',

  'GET  /api/v1/orders/my'             : 'OrderController.listForCustomer',
  'GET  /api/v1/orders/vendor'         : 'OrderController.listForVendor',
  'GET  /api/v1/orders/company'        : 'OrderController.listForCompany',
  'GET  /api/v1/orders/admin'          : 'OrderController.listForAdmin',

  'GET  /api/v1/orders/:id'            : 'OrderController.detail',
  'PUT  /api/v1/orders/:id/status'     : 'OrderController.changeStatus',

  'POST /api/v1/orders/:id/add-note': 'OrderController.addNote',

  'POST /api/v1/orders/:id/attachments': 'OrderController.uploadAttachment',



  // NOTIFICACIONES INTERNAS
'GET    /api/v1/notifications'           : 'NotificationController.list',
'PUT    /api/v1/notifications/:id/read'  : 'NotificationController.markAsRead',
'DELETE /api/v1/notifications/:id'       : 'NotificationController.delete',

//HOME INICIAL
'GET /api/v1/home/summary': 'HomeController.summary',

//CARGA DEFECTO
'POST /api/v1/utils/seed': 'SeedController.run',







};