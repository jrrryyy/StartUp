const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireOwner } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { checkoutSchema, refundOrderSchema } = require('../validators/orderValidators');

router.use(requireAuth);

router.post('/', validate(checkoutSchema), orderController.checkout);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/refund', requireOwner, validate(refundOrderSchema), orderController.refundOrder);

module.exports = router;
