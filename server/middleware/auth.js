const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'startup_access_secret_super_secure_key_2026_xyz987';

/**
 * Middleware to authenticate requests via Cookie or Bearer header
 */
const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // Check HttpOnly cookie first
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // Check Authorization header fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    // Retrieve user and ensure still active
    const user = await User.findById(decoded.userId).populate('businessId');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session has expired.',
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your business owner.',
      });
    }

    // Attach user and tenant context to request
    req.user = user;
    req.business = user.businessId;
    req.businessId = user.businessId._id || user.businessId;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};

/**
 * Middleware to restrict access to Business Owners only
 */
const requireOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: This action requires Business Owner privileges.',
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireOwner,
};
