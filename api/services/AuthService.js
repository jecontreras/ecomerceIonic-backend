// api/services/AuthService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {

  generateToken(user) {
    const payload = {
      id: user.id,
      role: user.role,
    };
    return jwt.sign(
      payload,
      sails.config.custom.jwtSecret,
      { expiresIn: sails.config.custom.jwtExpiresIn }
    );
  },

  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  },

};
