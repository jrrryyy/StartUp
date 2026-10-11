const Expense = require('../models/Expense');

/**
 * Get all expenses for tenant
 */
const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search, page = 1, limit = 50 } = req.query;

    const query = { businessId: req.businessId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) {
        query.expenseDate.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      if (endDate) {
        query.expenseDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalExpensesCount = await Expense.countDocuments(query);

    const expenses = await Expense.find(query)
      .populate('recordedBy', 'name email role')
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Summary calculation for the filtered query
    const aggregateTotal = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    const totalAmount = aggregateTotal[0]?.totalAmount || 0;

    return res.json({
      success: true,
      totalExpensesCount,
      totalAmount,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new expense
 */
const createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, expenseDate, description } = req.body;

    const expense = await Expense.create({
      businessId: req.businessId,
      title,
      category,
      amount: Number(amount),
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      description: description || '',
      recordedBy: req.user._id,
    });

    const populated = await Expense.findById(expense._id).populate('recordedBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Expense recorded successfully.',
      expense: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an expense
 */
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    const { title, category, amount, expenseDate, description } = req.body;

    if (title !== undefined) expense.title = title;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (expenseDate !== undefined) expense.expenseDate = new Date(expenseDate);
    if (description !== undefined) expense.description = description;

    await expense.save();

    return res.json({
      success: true,
      message: 'Expense updated successfully.',
      expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an expense
 */
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    return res.json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
