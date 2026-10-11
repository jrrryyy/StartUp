const { z } = require('zod');

const expenseSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100),
    category: z.enum([
      'Rent',
      'Utilities',
      'Salaries',
      'Supplies',
      'Equipment',
      'Marketing',
      'Maintenance',
      'Miscellaneous',
    ]),
    amount: z.number().min(0.01, 'Amount must be greater than zero'),
    expenseDate: z.string().optional(),
    description: z.string().max(300).optional().default(''),
  }),
});

module.exports = {
  expenseSchema,
};
