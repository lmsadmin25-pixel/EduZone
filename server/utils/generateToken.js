const jwt = require('jsonwebtoken');

// Generate JWT token with user id and role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = generateToken;
