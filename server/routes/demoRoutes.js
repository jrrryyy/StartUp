const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { requireAuth, requireOwner } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireOwner);

router.post('/seed', demoController.seedDemoData);

module.exports = router;
