const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { requireAuth, requireOwner } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireOwner);

router.get('/', employeeController.getEmployees);
router.post('/', employeeController.createEmployee);
router.patch('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
