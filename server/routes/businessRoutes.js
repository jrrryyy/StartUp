const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { requireAuth, requireOwner } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', businessController.getBusiness);
router.patch('/', requireOwner, businessController.updateBusiness);

module.exports = router;
