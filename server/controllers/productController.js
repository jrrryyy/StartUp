const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

/**
 * Get all products for the tenant business
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, search, includeInactive, sort = 'name', order = 'asc' } = req.query;

    const query = { businessId: req.businessId };

    if (!includeInactive || includeInactive === 'false') {
      query.isActive = true;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { sku: searchRegex }, { category: searchRegex }];
    }

    const sortDirection = order === 'desc' ? -1 : 1;
    const sortField = ['name', 'sellingPrice', 'stock', 'createdAt'].includes(sort) ? sort : 'name';

    const products = await Product.find(query).sort({ [sortField]: sortDirection });

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get distinct categories for the business
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { businessId: req.businessId, isActive: true });
    return res.json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product (Owner only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, description, sellingPrice, costPrice, stock, lowStockThreshold, image } = req.body;

    // Check SKU uniqueness in this business
    const existingSku = await Product.findOne({
      businessId: req.businessId,
      sku: sku.toUpperCase().trim(),
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `Product SKU "${sku.toUpperCase()}" already exists in your inventory.`,
      });
    }

    const product = await Product.create({
      businessId: req.businessId,
      name,
      sku: sku.toUpperCase().trim(),
      category,
      description: description || '',
      sellingPrice: Number(sellingPrice),
      costPrice: Number(costPrice || 0),
      stock: Number(stock || 0),
      lowStockThreshold: Number(lowStockThreshold || 10),
      image: image || '',
      isActive: true,
    });

    // If initial stock was provided, log an initial inventory movement
    if (stock > 0) {
      await InventoryMovement.create({
        businessId: req.businessId,
        productId: product._id,
        movementType: 'restock',
        quantity: stock,
        previousStock: 0,
        newStock: stock,
        performedBy: req.user._id,
        reason: 'Initial stock intake upon product registration',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { name, sku, category, description, sellingPrice, costPrice, stock, lowStockThreshold, image, isActive } =
      req.body;

    // Check SKU collision if SKU changed
    if (sku && sku.toUpperCase().trim() !== product.sku) {
      const existingSku = await Product.findOne({
        businessId: req.businessId,
        sku: sku.toUpperCase().trim(),
        _id: { $ne: product._id },
      });
      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: `Product SKU "${sku.toUpperCase()}" is already assigned to another product.`,
        });
      }
      product.sku = sku.toUpperCase().trim();
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (image !== undefined) product.image = image;
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    // If stock changed directly from edit form, record adjustment
    if (stock !== undefined && Number(stock) !== product.stock) {
      const diff = Number(stock) - product.stock;
      const prev = product.stock;
      product.stock = Number(stock);

      await InventoryMovement.create({
        businessId: req.businessId,
        productId: product._id,
        movementType: 'adjustment',
        quantity: diff,
        previousStock: prev,
        newStock: product.stock,
        performedBy: req.user._id,
        reason: 'Stock updated via Product Management form',
      });
    }

    await product.save();

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete (archive) product
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.isActive = false;
    await product.save();

    return res.json({
      success: true,
      message: 'Product archived successfully. Historical transactions will remain intact.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
