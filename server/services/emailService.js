const nodemailer = require('nodemailer');

const getClientOrigin = (customOrigin) => {
  if (customOrigin) return customOrigin.trim().replace(/\/+$/, '');
  const envOrigin = process.env.CLIENT_ORIGIN;
  if (envOrigin) {
    const firstOrigin = envOrigin.split(',')[0].trim().replace(/\/+$/, '');
    if (firstOrigin) return firstOrigin;
  }
  return 'http://localhost:5173';
};

const EMAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@startup.ph';

// Create Nodemailer Transporter
const createTransporter = () => {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
  const pass = rawPass.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  // If using Gmail or Google Workspace (@gmail.com, @phinmaed.com, etc.), use the specialized 'gmail' service
  const host = (process.env.SMTP_HOST || '').toLowerCase();
  const isGmail = host === 'smtp.gmail.com' || user.endsWith('@gmail.com') || user.endsWith('@phinmaed.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  // Generic custom SMTP
  const isSecure = process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
};

// HTTP-based Email API Dispatcher (Runs over Port 443 HTTPS, bypassing Render SMTP port blocks)
const sendViaHttpApi = async ({ to, subject, html, text }) => {
  // Option 1: Resend HTTP API (Port 443 HTTPS)
  if (process.env.RESEND_API_KEY) {
    try {
      const from = process.env.RESEND_FROM || 'StartUp <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Resend error HTTP ${res.status}`);
      }
      console.log(`📧 [RESEND HTTP API] Verification email sent to ${to} (ID: ${data.id})`);
      return { success: true };
    } catch (err) {
      console.error(`❌ [RESEND HTTP ERROR] Failed to send email to ${to}:`, err.message);
      return { success: false, error: `Resend HTTP Error: ${err.message}` };
    }
  }

  // Option 2: Brevo HTTP API (Port 443 HTTPS)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.SMTP_USER || process.env.BREVO_SENDER || 'roven.yulo@gmail.com';
      const senderName = 'StartUp';
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Brevo error HTTP ${res.status}`);
      }
      console.log(`📧 [BREVO HTTP API] Verification email sent to ${to} (ID: ${data.messageId})`);
      return { success: true };
    } catch (err) {
      console.error(`❌ [BREVO HTTP ERROR] Failed to send email to ${to}:`, err.message);
      return { success: false, error: `Brevo HTTP Error: ${err.message}` };
    }
  }

  return null; // Fall back to SMTP
};

/**
 * Send Account Activation / Email Verification Link
 */
const sendVerificationEmail = async ({ to, name, token, origin }) => {
  const clientOrigin = getClientOrigin(origin);
  const verificationUrl = `${clientOrigin}/verify-email#token=${token}`;

  const textContent = `Confirm your StartUp registration using this link (expires in 30 minutes):
${verificationUrl}
If you did not request this account, do not open the link.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #222;">
      <p>Confirm your StartUp registration using this link (expires in 30 minutes):<br>
      <a href="${verificationUrl}" style="color: #1a73e8; text-decoration: underline;">${verificationUrl}</a></p>
      <p>If you did not request this account, do not open the link.</p>
    </div>
  `;

  // 1. Try HTTP API (Bypasses Render port blocks)
  const httpResult = await sendViaHttpApi({
    to,
    subject: 'Verify your StartUp email',
    html: htmlContent,
    text: textContent,
  });

  if (httpResult) {
    return httpResult;
  }

  // 2. Fall back to SMTP transporter
  const transporter = createTransporter();
  if (!transporter) {
    console.error(`[EMAIL SERVICE ERROR] Cannot send email to ${to}: No email service (RESEND_API_KEY, BREVO_API_KEY, or SMTP_USER/PASS) configured.`);
    return { success: false, error: 'Email service credentials not configured on server. Please add RESEND_API_KEY to Render Environment Variables.' };
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: 'Verify your StartUp email',
      text: textContent,
      html: htmlContent,
    });
    console.log(`[EMAIL SERVICE] Verification email dispatched to ${to}`);
    return { success: true, verificationUrl };
  } catch (err) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message, verificationUrl };
  }
};

/**
 * Send Password Reset Link
 */
const sendPasswordResetEmail = async ({ to, name, token, origin }) => {
  const clientOrigin = getClientOrigin(origin);
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #F8F5EE; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #E8E1D3; border-radius: 12px; padding: 28px;">
          <h2 style="color: #252820; margin-top: 0;">Reset Your Password</h2>
          <p>Hello ${name || 'User'}, we received a request to reset your password for your StartUp account.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #5A733B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #666;">This single-use reset link expires in 30 minutes.</p>
        </div>
      </body>
    </html>
  `;

  // 1. Try HTTP API (Bypasses Render port blocks)
  const httpResult = await sendViaHttpApi({
    to,
    subject: 'Reset Your StartUp Password',
    html: htmlContent,
    text: `Reset your StartUp password using this link: ${resetUrl}`,
  });

  if (httpResult) {
    return httpResult;
  }

  // 2. Fall back to SMTP
  const transporter = createTransporter();
  if (!transporter) {
    console.error(`[EMAIL SERVICE ERROR] Cannot send password reset email to ${to}: SMTP_USER or SMTP_PASS not configured.`);
    return { success: false, error: 'SMTP email credentials not configured on server.' };
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: 'Reset Your StartUp Password',
      html: htmlContent,
    });
    return { success: true };
  } catch (err) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send reset email:`, err.message);
    return { success: false, error: err.message, resetUrl };
  }
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
