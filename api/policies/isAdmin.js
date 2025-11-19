// api/policies/isAdmin.js
module.exports = async function (req, res, proceed) {
  if (!req.me) {
    return res.forbidden({ message: 'No autenticado' });
  }

  if (req.me.role !== 'admin') {
    return res.forbidden({ message: 'Solo administradores' });
  }

  return proceed();
};
