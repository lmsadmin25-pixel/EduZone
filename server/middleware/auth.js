const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Educator = require('../models/Educator');
const Admin = require('../models/Admin');

// Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user based on role stored in token
    let user;
    switch (decoded.role) {
      case 'student':
        user = await Student.findById(decoded.id).select('-password');
        break;
      case 'educator':
        user = await Educator.findById(decoded.id).select('-password');
        break;
      case 'admin':
        user = await Admin.findById(decoded.id).select('-password');
        break;
      default:
        return res.status(401).json({ message: 'Invalid role in token' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact admin.' });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = protect;
