require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const demoRoutes = require('./routes/demoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS allowlist configuration
const parseAllowedOrigins = () => {
  const defaults = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
  const envOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return Array.from(new Set([...defaults, ...envOrigins]));
};

const allowedOrigins = parseAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');
      let isVercelDomain = false;
      try {
        const parsedUrl = new URL(origin);
        isVercelDomain = parsedUrl.hostname.endsWith('.vercel.app');
      } catch (e) {
        // invalid URL
      }

      if (
        allowedOrigins.includes(cleanOrigin) ||
        isVercelDomain ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsing & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'startup_cookie_secret_2026'));

// Request Logger in dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global API rate limit
app.use('/api', apiLimiter);

// Health Check (supports both /api/health and /health)
const handleHealthCheck = (req, res) => {
  res.json({
    status: 'online',
    system: 'StartUp API Engine',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};
app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// API Routes (mounted under both /api and root paths for maximum compatibility)
const apiRoutes = [
  ['/auth', authRoutes],
  ['/business', businessRoutes],
  ['/products', productRoutes],
  ['/inventory', inventoryRoutes],
  ['/orders', orderRoutes],
  ['/expenses', expenseRoutes],
  ['/analytics', analyticsRoutes],
  ['/reports', reportRoutes],
  ['/employees', employeeRoutes],
  ['/demo', demoRoutes],
];

apiRoutes.forEach(([path, router]) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
});

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 StartUp API Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);

    // Verify Email Delivery service status
    if (process.env.RESEND_API_KEY) {
      console.log('📧 [Email Service]: Active via Resend HTTPS API (Port 443 — Render Firewall Safe)');
    } else if (process.env.BREVO_API_KEY) {
      console.log('📧 [Email Service]: Active via Brevo HTTPS API (Port 443 — Render Firewall Safe)');
    } else {
      const { createTransporter } = require('./services/emailService');
      const transporter = createTransporter();
      if (transporter) {
        transporter.verify((err) => {
          if (err) {
            console.warn('⚠️ [SMTP Email Warning]:', err.message);
          } else {
            console.log('📧 [SMTP Email Service]: Verified and ready to dispatch live emails.');
          }
        });
      } else {
        console.warn('ℹ️ [Email Service]: Add RESEND_API_KEY to Render Environment Variables for live delivery.');
      }
    }
  });
};

startServer();

module.exports = app;
// SMTP Email Delivery initialized
