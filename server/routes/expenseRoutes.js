const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { requireAuth, requireOwner } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { expenseSchema } = require('../validators/expenseValidators');

router.use(requireAuth);
router.use(requireOwner); // Expenses are owner-restricted

router.get('/', expenseController.getExpenses);
router.post('/', validate(expenseSchema), expenseController.createExpense);
router.patch('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
