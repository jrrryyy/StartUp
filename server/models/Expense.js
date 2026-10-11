const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: [
        'Rent',
        'Utilities',
        'Salaries',
        'Supplies',
        'Equipment',
        'Marketing',
        'Maintenance',
        'Miscellaneous',
      ],
      default: 'Supplies',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ businessId: 1, expenseDate: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
