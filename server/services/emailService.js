const nodemailer = require('nodemailer');

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const EMAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@startup.ph';

// Create Nodemailer Transporter
const createTransporter = () => {
  // Option A: Custom SMTP (Gmail SMTP, Brevo, SendGrid, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isSecure = process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Option B: Direct Gmail Service
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Option C: No SMTP configured (Dev / Fallback)
  return null;
};

/**
 * Send Account Activation / Email Verification Link
 */
const sendVerificationEmail = async ({ to, name, token }) => {
  const verificationUrl = `${CLIENT_ORIGIN}/verify-email#token=${token}`;
  const transporter = createTransporter();

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

  if (!transporter) {
    console.log('\n============================================================');
    console.log(`[EMAIL SERVICE] (No SMTP configured - Running in Local Mode)`);
    console.log(`To: ${to}`);
    console.log(`Subject: Verify your StartUp email`);
    console.log(`\n${textContent}`);
    console.log('============================================================\n');
    return { success: true, localMode: true, verificationUrl };
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
const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${CLIENT_ORIGIN}/reset-password?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n============================================================');
    console.log(`[EMAIL SERVICE] (No SMTP configured - Running in Local Mode)`);
    console.log(`Password Reset Link for ${to}: ${resetUrl}`);
    console.log('============================================================\n');
    return { success: true, localMode: true, resetUrl };
  }

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
  sendVerificationEmail,
  sendPasswordResetEmail,
};
