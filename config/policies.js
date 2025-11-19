/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

const hasRole = require('../api/policies/hasRole');

module.exports.policies = {

  // Por defecto todo bloqueado
  '*': false,

  AuthController: {
    'login': true,
    'register': true,
    registerCompany: [ 'isAuthenticated', hasRole(['admin']) ]
  },

  ProductController: {
    publicList: true,
    detail: true,
    create: ['isAuthenticated'],
    update: ['isAuthenticated']
  },

  VendorProductController: {
    addProduct: ['isAuthenticated'],
    myProducts: ['isAuthenticated'],
    update: ['isAuthenticated']
  },

  OrderController: {
    create: ['isAuthenticated'],          // cualquier usuario logueado (cliente) puede crear
    listForCustomer: ['isAuthenticated'],
    listForVendor: ['isAuthenticated'],   // y rol vendor si quieres más estricto
    listForCompany: ['isAuthenticated'],
    listForAdmin: ['isAuthenticated', 'isAdmin'],
    detail: ['isAuthenticated'],
    changeStatus: ['isAuthenticated'],    // y validamos rol dentro del controller
  },

  CategoryController: {
    publicList: true,

    adminList: ['isAuthenticated', 'isAdmin'],
    create: ['isAuthenticated', 'isAdmin'],
    update: ['isAuthenticated', 'isAdmin'],
    delete: ['isAuthenticated', 'isAdmin'],
  },

  SubCategoryController: {
    publicList: true,

    adminList: ['isAuthenticated', 'isAdmin'],
    create: ['isAuthenticated', 'isAdmin'],
    update: ['isAuthenticated', 'isAdmin'],
    delete: ['isAuthenticated', 'isAdmin'],
  },

  NotificationController: {
    list: ['isAuthenticated'],
    markAsRead: ['isAuthenticated'],
    delete: ['isAuthenticated']
  },
  ChatController: {
    myRooms: ['isAuthenticated'],
    messages: ['isAuthenticated'],
    send: ['isAuthenticated'],
    read: ['isAuthenticated']
  },

  HomeController: {
    summary: true   // 🔓 acceso público
  },

  SeedController: {
    run: true
  }



  // ... y así con cada controlador
};
