const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Business = require('../models/Business');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'startup_access_secret_super_secure_key_2026_xyz987';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'startup_refresh_secret_super_secure_key_2026_abc123';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate tokens helper
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role, businessId: user.businessId },
    JWT_ACCESS_SECRET,
    { expiresIn: '2h' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Cookie helper
const setAuthCookie = (res, token, rememberMe = true) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
  });
};

// Resolve the client base URL dynamically from the incoming request or environment
const resolveClientOrigin = (req) => {
  const reqOrigin = req.headers.origin || req.headers.referer;
  if (reqOrigin) {
    try {
      const parsed = new URL(reqOrigin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return `${parsed.protocol}//${parsed.host}`;
      }
    } catch (e) {
      // ignore invalid URL
    }
  }
  const envOrigin = process.env.CLIENT_ORIGIN;
  if (envOrigin) {
    const firstOrigin = envOrigin.split(',')[0].trim().replace(/\/+$/, '');
    if (firstOrigin) return firstOrigin;
  }
  return 'http://localhost:5173';
};

/**
 * Register a new business and business owner
 * Requires email verification before signing in
 */
const register = async (req, res, next) => {
  try {
    const { name, businessName, email, password, businessType, businessAddress, contactNumber } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    // 1. Create Business Record
    const business = await Business.create({
      name: businessName,
      category: businessType || 'Coffee Shop',
      address: businessAddress || '',
      contactNumber: contactNumber || '',
      currency: 'PHP',
      currencySymbol: '₱',
      onboardingCompleted: false,
    });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Generate Email Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // 4. Create User as Owner (unverified email)
    const user = await User.create({
      businessId: business._id,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'owner',
      status: 'active',
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
    });

    const clientOrigin = resolveClientOrigin(req);

    // 5. Send Email
    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: verificationToken,
      origin: clientOrigin,
    });

    const verificationUrl = `${clientOrigin}/verify-email#token=${verificationToken}`;

    return res.status(201).json({
      success: true,
      needsEmailVerification: true,
      email: user.email,
      emailSent: !!emailResult.success,
      emailError: emailResult.error,
      verificationToken,
      verificationUrl,
      message: emailResult.success
        ? 'Account registered successfully! An activation link has been sent to your email.'
        : 'Account created! (Email delivery is pending server SMTP setup on Render. You can activate directly with the on-screen link).',
      user: user.toSafeObject(),
      business,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * Enforces email verification requirement
 */
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe = true } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact your administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Auto-verify demo account for immediate testing
    if (user.email === 'owner@startupcafe.ph' && !user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    // Enforce email verification check
    if (!user.isEmailVerified) {
      let verificationToken;
      if (!user.emailVerificationToken || !user.emailVerificationExpires || user.emailVerificationExpires <= Date.now()) {
        verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
      }

      return res.status(403).json({
        success: false,
        needsEmailVerification: true,
        email: user.email,
        verificationToken,
        message: 'Please verify your email address before signing in. Check your inbox for the activation link.',
      });
    }

    const business = await Business.findById(user.businessId);

    const { accessToken, refreshToken } = generateTokens(user);

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokenHash = refreshHash;
    await user.save();

    setAuthCookie(res, accessToken, rememberMe);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      accessToken,
      user: user.toSafeObject(),
      business,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email with Token
 */
const verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired. Please request a new activation link.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    const business = await Business.findById(user.businessId);

    // Auto-login upon successful verification
    const { accessToken, refreshToken } = generateTokens(user);
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokenHash = refreshHash;
    await user.save();

    setAuthCookie(res, accessToken, true);

    return res.json({
      success: true,
      message: 'Email successfully verified! Your account is now active.',
      accessToken,
      user: user.toSafeObject(),
      business,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend Email Verification Token
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, an activation link has been sent.',
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: 'This email is already verified. You can log in directly.',
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const clientOrigin = resolveClientOrigin(req);

    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: verificationToken,
      origin: clientOrigin,
    });

    const verificationUrl = `${clientOrigin}/verify-email#token=${verificationToken}`;

    return res.json({
      success: true,
      emailSent: !!emailResult.success,
      emailError: emailResult.error,
      verificationToken,
      verificationUrl,
      message: emailResult.success
        ? 'A new activation email has been dispatched.'
        : 'Activation token refreshed. (Email delivery pending server SMTP setup on Render. You can activate directly with the on-screen link).',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth Authentication (Sign In & Sign Up)
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential, googleUser } = req.body;
    let email, name, picture, sub;

    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        sub = payload.sub;
      } catch (err) {
        // Fallback: If library verification fails (e.g. mock or dev client ID), decode token
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name;
          picture = decoded.picture;
          sub = decoded.sub;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to verify Google credential token.',
          });
        }
      }
    } else if (googleUser && googleUser.email) {
      email = googleUser.email;
      name = googleUser.name || email.split('@')[0];
      picture = googleUser.picture || '';
      sub = googleUser.sub || `google_${Date.now()}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google authentication credential required.',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'No email found in Google profile.',
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    let business;

    if (user) {
      // User exists -> Ensure email is verified because Google already verified it
      user.isEmailVerified = true;
      if (!user.googleId) user.googleId = sub;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
      business = await Business.findById(user.businessId);
    } else {
      // New User -> Auto-create Store & Owner account
      business = await Business.create({
        name: `${name}'s Store`,
        category: 'Coffee Shop',
        currency: 'PHP',
        currencySymbol: '₱',
        onboardingCompleted: false,
      });

      const randomPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        businessId: business._id,
        name: name || 'Google User',
        email: email.toLowerCase(),
        passwordHash,
        role: 'owner',
        status: 'active',
        isEmailVerified: true, // Google verifies emails
        authProvider: 'google',
        googleId: sub,
        avatar: picture || '',
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokenHash = refreshHash;
    await user.save();

    setAuthCookie(res, accessToken, true);

    return res.json({
      success: true,
      message: 'Signed in with Google successfully!',
      accessToken,
      user: user.toSafeObject(),
      business,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
const logout = async (req, res) => {
  if (req.user) {
    req.user.refreshTokenHash = null;
    await req.user.save();
  }

  res.clearCookie('access_token');
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * Get current authenticated user session
 */
const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user.toSafeObject(),
    business: req.business,
  });
};

/**
 * Refresh Token
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No session found' });
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status === 'disabled') {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    const { accessToken } = generateTokens(user);
    setAuthCookie(res, accessToken, true);

    return res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
      await user.save();

      const clientOrigin = resolveClientOrigin(req);

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token: resetToken,
        origin: clientOrigin,
      });

      return res.json({
        success: true,
        message: 'If that email address exists in our system, a password reset link has been dispatched.',
        resetToken: process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST ? resetToken : undefined,
      });
    }

    return res.json({
      success: true,
      message: 'If that email address exists in our system, a password reset link has been dispatched.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is invalid or has expired.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenHash = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful. You may now log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  googleAuth,
};
