const { z } = require('zod');

const checkoutSchema = z.object({
  body: z.object({
    orderType: z.enum(['dine-in', 'takeout']).default('dine-in'),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'Product ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must contain at least one item'),
    discountType: z.enum(['none', 'percentage', 'fixed']).default('none'),
    discountValue: z.number().min(0).default(0),
    paymentMethod: z.enum(['cash', 'gcash', 'maya', 'other']).default('cash'),
    paymentReference: z.string().optional().default(''),
    amountReceived: z.number().min(0).default(0),
    notes: z.string().max(250).optional().default(''),
  }),
});

const refundOrderSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(3, 'Refund reason is required').max(200),
  }),
});

module.exports = {
  checkoutSchema,
  refundOrderSchema,
};
