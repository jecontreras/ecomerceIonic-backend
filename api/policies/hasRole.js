// api/policies/hasRole.js
module.exports = function (requiredRoles) {
  return async function (req, res, proceed) {
    if (!req.me) {
      return res.forbidden({ message: 'No autenticado' });
    }

    if (!requiredRoles.includes(req.me.role)) {
      return res.forbidden({ message: 'No tienes permisos' });
    }

    return proceed();
  };
};
