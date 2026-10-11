const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { requireAuth, requireOwner } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', inventoryController.getInventory);
router.post('/adjustments', requireOwner, inventoryController.adjustStock);
router.get('/movements', inventoryController.getMovements);

module.exports = router;
