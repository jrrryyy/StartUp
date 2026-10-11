const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters'],
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      enum: ['Coffee Shop', 'Restaurant', 'Retail', 'Food Stall', 'Other'],
      default: 'Coffee Shop',
    },
    logo: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    contactNumber: {
      type: String,
      default: '',
      trim: true,
    },
    currency: {
      type: String,
      default: 'PHP',
    },
    currencySymbol: {
      type: String,
      default: '₱',
    },
    taxRate: {
      type: Number,
      default: 0, // e.g. 12 for 12% VAT
      min: 0,
      max: 100,
    },
    taxInclusive: {
      type: Boolean,
      default: true,
    },
    receiptHeader: {
      type: String,
      default: 'Thank you for your patronage!',
      trim: true,
    },
    receiptFooter: {
      type: String,
      default: 'Please come again! Keep this receipt for reference.',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Manila',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Business', businessSchema);
