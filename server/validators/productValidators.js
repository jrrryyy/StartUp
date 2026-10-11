const { z } = require('zod');

const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(120),
    sku: z.string().trim().min(1, 'Product code or SKU is required').max(50),
    category: z.string().trim().min(1, 'Category is required'),
    description: z.string().max(500).optional().default(''),
    sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
    costPrice: z.number().min(0, 'Cost price cannot be negative').optional().default(0),
    stock: z.number().int().min(0, 'Initial stock cannot be negative').default(0),
    lowStockThreshold: z.number().int().min(0).optional().default(10),
    image: z.string().optional().default(''),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    sku: z.string().trim().min(1).max(50).optional(),
    category: z.string().trim().min(1).optional(),
    description: z.string().max(500).optional(),
    sellingPrice: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
