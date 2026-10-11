const { z } = require('zod');

// Strong Password: 8 min, 24 max, lowercase, uppercase, number, special char
const strongPassword = z
  .string()
  .min(8, 'Password must be between 8 and 24 characters')
  .max(24, 'Password must between 8 and 24 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character (!@#$%^&*)');

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Owner name must be at least 2 characters').max(100),
      businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(100),
      email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
      password: strongPassword,
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      businessType: z.enum(['Coffee Shop', 'Restaurant', 'Retail', 'Food Stall', 'Other']).optional(),
      businessAddress: z.string().max(250).optional(),
      contactNumber: z.string().max(30).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
  }),
});

const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, 'Reset token is required'),
      password: strongPassword,
      confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string().optional(),
    googleUser: z
      .object({
        email: z.string().email(),
        name: z.string().optional(),
        picture: z.string().optional(),
        sub: z.string().optional(),
      })
      .optional(),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  resendVerificationSchema,
};
