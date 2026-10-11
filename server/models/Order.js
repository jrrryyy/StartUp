const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      default: '',
    },
    unitSellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unitCostPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: ['dine-in', 'takeout'],
      default: 'dine-in',
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['none', 'percentage', 'fixed'],
      default: 'none',
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    costOfGoodsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'gcash', 'maya', 'other'],
      default: 'cash',
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true,
    },
    amountReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    changeGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderStatus: {
      type: String,
      enum: ['completed', 'refunded', 'cancelled'],
      default: 'completed',
      index: true,
    },
    refundReason: {
      type: String,
      default: '',
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ businessId: 1, createdAt: -1 });
orderSchema.index({ businessId: 1, receiptNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
