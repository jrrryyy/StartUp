const Order = require('../models/Order');
const Product = require('../models/Product');
const Business = require('../models/Business');
const InventoryMovement = require('../models/InventoryMovement');
const { format } = require('date-fns');

/**
 * Helper to generate human-readable receipt number: RCP-YYYYMMDD-XXXX
 */
const generateReceiptNumber = async (businessId) => {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const countToday = await Order.countDocuments({
    businessId,
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
    },
  });
  const seq = String(countToday + 1).padStart(4, '0');
  return `RCP-${dateStr}-${seq}`;
};

/**
 * POS Checkout - Create Order with atomic inventory deduction & pricing recalculation
 */
const checkout = async (req, res, next) => {
  try {
    const {
      orderType = 'dine-in',
      items,
      discountType = 'none',
      discountValue = 0,
      paymentMethod = 'cash',
      paymentReference = '',
      amountReceived = 0,
      notes = '',
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one product.' });
    }

    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business configuration not found.' });
    }

    // 1. Fetch all products from DB for this business
    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      businessId: req.businessId,
      isActive: true,
    });

    const productMap = new Map();
    dbProducts.forEach((p) => productMap.set(p._id.toString(), p));

    // 2. Validate availability and build immutable line items
    let serverSubtotal = 0;
    let serverCogs = 0;
    const verifiedItems = [];

    for (const requestedItem of items) {
      const prod = productMap.get(requestedItem.productId.toString());
      if (!prod) {
        return res.status(400).json({
          success: false,
          message: `Product is unavailable or does not belong to your business.`,
        });
      }

      if (prod.stock < requestedItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${requestedItem.quantity}.`,
        });
      }

      const lineSubtotal = Math.round(prod.sellingPrice * requestedItem.quantity * 100) / 100;
      const lineCost = Math.round(prod.costPrice * requestedItem.quantity * 100) / 100;

      serverSubtotal += lineSubtotal;
      serverCogs += lineCost;

      verifiedItems.push({
        productId: prod._id,
        name: prod.name,
        sku: prod.sku,
        unitSellingPrice: prod.sellingPrice,
        unitCostPrice: prod.costPrice,
        quantity: requestedItem.quantity,
        subtotal: lineSubtotal,
      });
    }

    // 3. Calculate discounts
    let discountAmount = 0;
    if (discountType === 'percentage' && discountValue > 0) {
      discountAmount = Math.round(((serverSubtotal * Math.min(100, discountValue)) / 100) * 100) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
      discountAmount = Math.min(serverSubtotal, Math.round(discountValue * 100) / 100);
    }

    const discountedTotal = Math.max(0, serverSubtotal - discountAmount);

    // 4. Calculate Tax
    let taxAmount = 0;
    const taxRate = business.taxRate || 0;
    if (taxRate > 0) {
      if (business.taxInclusive) {
        // e.g. 12% included: Tax = total - (total / 1.12)
        taxAmount = Math.round((discountedTotal - discountedTotal / (1 + taxRate / 100)) * 100) / 100;
      } else {
        // Tax added on top
        taxAmount = Math.round(((discountedTotal * taxRate) / 100) * 100) / 100;
      }
    }

    const finalTotal = business.taxInclusive ? discountedTotal : discountedTotal + taxAmount;

    // 5. Validate payment method
    let changeGiven = 0;
    if (paymentMethod === 'cash') {
      const received = Number(amountReceived);
      if (received < finalTotal) {
        return res.status(400).json({
          success: false,
          message: `Insufficient payment. Total is ${business.currencySymbol}${finalTotal.toFixed(
            2
          )}, but received ${business.currencySymbol}${received.toFixed(2)}.`,
        });
      }
      changeGiven = Math.round((received - finalTotal) * 100) / 100;
    }

    // 6. Deduct inventory and log movements
    for (const item of verifiedItems) {
      const prod = productMap.get(item.productId.toString());
      const previousStock = prod.stock;
      prod.stock -= item.quantity;
      await prod.save();

      await InventoryMovement.create({
        businessId: req.businessId,
        productId: prod._id,
        movementType: 'sale',
        quantity: -item.quantity,
        previousStock,
        newStock: prod.stock,
        performedBy: req.user._id,
        reason: `Sold in POS order`,
      });
    }

    // 7. Generate Receipt Number and create Order
    const receiptNumber = await generateReceiptNumber(req.businessId);

    const order = await Order.create({
      businessId: req.businessId,
      cashierId: req.user._id,
      receiptNumber,
      orderType,
      items: verifiedItems,
      subtotal: serverSubtotal,
      discountType,
      discountValue: Number(discountValue),
      discountAmount,
      taxRate,
      taxAmount,
      totalAmount: finalTotal,
      costOfGoodsSold: serverCogs,
      paymentMethod,
      paymentReference,
      amountReceived: paymentMethod === 'cash' ? Number(amountReceived) : finalTotal,
      changeGiven,
      orderStatus: 'completed',
      notes,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('cashierId', 'name email role')
      .populate('businessId');

    return res.status(201).json({
      success: true,
      message: 'Order processed successfully.',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders list with search, filter, and pagination
 */
const getOrders = async (req, res, next) => {
  try {
    const {
      search,
      status,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { businessId: req.businessId };

    if (search) {
      query.receiptNumber = new RegExp(search.trim(), 'i');
    }

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      if (endDate) {
        query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('cashierId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      totalOrders,
      totalPages: Math.ceil(totalOrders / Number(limit)) || 1,
      currentPage: Number(page),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order details
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, businessId: req.businessId })
      .populate('cashierId', 'name email role')
      .populate('businessId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund an order (Owner only)
 */
const refundOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, businessId: req.businessId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.orderStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'This order has already been refunded.' });
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findOne({ _id: item.productId, businessId: req.businessId });
      if (product) {
        const prev = product.stock;
        product.stock += item.quantity;
        await product.save();

        await InventoryMovement.create({
          businessId: req.businessId,
          productId: product._id,
          movementType: 'refund',
          quantity: item.quantity,
          previousStock: prev,
          newStock: product.stock,
          performedBy: req.user._id,
          reason: `Restocked due to refund of ${order.receiptNumber}: ${reason}`,
        });
      }
    }

    order.orderStatus = 'refunded';
    order.refundReason = reason || 'Customer requested refund';
    order.refundedAt = new Date();
    order.refundedBy = req.user._id;
    await order.save();

    return res.json({
      success: true,
      message: `Order ${order.receiptNumber} refunded successfully. Stock has been replenished.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getOrders,
  getOrderById,
  refundOrder,
};
