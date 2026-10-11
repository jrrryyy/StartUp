const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

/**
 * Get overall inventory health and product stock statuses
 */
const getInventory = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const query = { businessId: req.businessId, isActive: true };
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { sku: searchRegex }, { category: searchRegex }];
    }

    const products = await Product.find(query).sort({ stock: 1 });

    // Calculate inventory statistics
    let totalItems = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;

    const items = products.map((prod) => {
      totalItems += prod.stock;
      totalCostValuation += prod.stock * prod.costPrice;
      totalRetailValuation += prod.stock * prod.sellingPrice;

      let stockStatus = 'in_stock';
      if (prod.stock <= 0) {
        stockStatus = 'out_of_stock';
        outOfStockCount++;
      } else if (prod.stock <= prod.lowStockThreshold) {
        stockStatus = 'low_stock';
        lowStockCount++;
      }

      return {
        ...prod.toObject(),
        stockStatus,
        costValuation: prod.stock * prod.costPrice,
        retailValuation: prod.stock * prod.sellingPrice,
      };
    });

    // Filter by stock status if requested
    const filteredItems = status ? items.filter((item) => item.stockStatus === status) : items;

    return res.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalItems,
        lowStockCount,
        outOfStockCount,
        totalCostValuation,
        totalRetailValuation,
      },
      items: filteredItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust stock or record restock
 */
const adjustStock = async (req, res, next) => {
  try {
    const { productId, adjustmentType, quantity, reason } = req.body;
    const qty = Number(quantity);

    if (isNaN(qty) || qty === 0) {
      return res.status(400).json({ success: false, message: 'Valid non-zero quantity is required.' });
    }

    const product = await Product.findOne({ _id: productId, businessId: req.businessId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prevStock = product.stock;
    let newStock = prevStock;

    if (adjustmentType === 'restock') {
      newStock = prevStock + Math.abs(qty);
    } else if (adjustmentType === 'damage' || adjustmentType === 'loss') {
      newStock = Math.max(0, prevStock - Math.abs(qty));
    } else {
      // Direct adjustment: either delta or new absolute target
      newStock = Math.max(0, prevStock + qty);
    }

    product.stock = newStock;
    await product.save();

    const movement = await InventoryMovement.create({
      businessId: req.businessId,
      productId: product._id,
      movementType: adjustmentType === 'restock' ? 'restock' : 'adjustment',
      quantity: newStock - prevStock,
      previousStock: prevStock,
      newStock,
      performedBy: req.user._id,
      reason: reason || `Manual adjustment: ${adjustmentType}`,
    });

    return res.json({
      success: true,
      message: 'Stock adjusted successfully.',
      product,
      movement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory movement logs
 */
const getMovements = async (req, res, next) => {
  try {
    const { productId, limit = 50 } = req.query;
    const query = { businessId: req.businessId };

    if (productId) {
      query.productId = productId;
    }

    const movements = await InventoryMovement.find(query)
      .populate('productId', 'name sku category')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({
      success: true,
      count: movements.length,
      movements,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  adjustStock,
  getMovements,
};
