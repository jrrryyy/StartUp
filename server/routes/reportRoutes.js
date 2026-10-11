const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, requireOwner } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireOwner);

router.get('/export', reportController.exportComprehensiveReport);
router.get('/financial/export', reportController.exportComprehensiveReport);
router.get('/sales/export', reportController.exportComprehensiveReport);
router.get('/transactions/export', reportController.exportComprehensiveReport);
router.get('/inventory/export', reportController.exportComprehensiveReport);

module.exports = router;
