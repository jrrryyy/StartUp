const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  resendVerificationSchema,
} = require('../validators/authValidators');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Email verification routes
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/verify-email/:token', authController.verifyEmail);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendVerificationSchema), authController.resendVerification);

// Google OAuth authentication route
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleAuth);

module.exports = router;
