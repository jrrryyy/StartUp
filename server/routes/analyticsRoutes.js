const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireOwner } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireOwner); // Financial analytics restricted to business owners

router.get('/overview', analyticsController.getOverview);

module.exports = router;
