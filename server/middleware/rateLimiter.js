const rateLimit = require('express-rate-limit');

// Strict limiter for authentication endpoints (prevent brute-force password guessing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this network. Please wait 15 minutes before trying again.',
  },
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down your requests.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
