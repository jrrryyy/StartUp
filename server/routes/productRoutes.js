const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth, requireOwner } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidators');

router.use(requireAuth);

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.post('/', requireOwner, validate(createProductSchema), productController.createProduct);
router.patch('/:id', requireOwner, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', requireOwner, productController.deleteProduct);

module.exports = router;
