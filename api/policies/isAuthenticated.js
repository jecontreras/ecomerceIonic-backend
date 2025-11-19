// api/policies/isAuthenticated.js
const jwt = require('jsonwebtoken');

module.exports = async function (req, res, proceed) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.forbidden({ message: 'No autorizado' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.forbidden({ message: 'Formato de token inválido' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, sails.config.custom.jwtSecret);
    const user = await User.findOne({ id: decoded.id });
    if (!user || !user.isActive) {
      return res.forbidden({ message: 'Usuario no válido' });
    }

    req.me = user;
    return proceed();

  } catch (err) {
    sails.log.error(err);
    return res.forbidden({ message: 'Token inválido o expirado' });
  }
};
