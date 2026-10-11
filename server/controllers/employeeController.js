const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Get all employees for the business (Owner only)
 */
const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ businessId: req.businessId }).sort({ createdAt: -1 });

    const safeEmployees = employees.map((emp) => emp.toSafeObject());

    return res.json({
      success: true,
      count: safeEmployees.length,
      employees: safeEmployees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new cashier or employee (Owner only)
 */
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role = 'cashier' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      businessId: req.businessId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: ['owner', 'cashier'].includes(role) ? role : 'cashier',
      status: 'active',
    });

    return res.status(201).json({
      success: true,
      message: `Employee account created for ${user.name} (${user.role.toUpperCase()}).`,
      employee: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee status or role (Owner only)
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { status, role, name } = req.body;
    const employee = await User.findOne({ _id: req.params.id, businessId: req.businessId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Prevent disabling self
    if (employee._id.toString() === req.user._id.toString() && status === 'disabled') {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    if (name) employee.name = name.trim();
    if (status && ['active', 'disabled'].includes(status)) employee.status = status;
    if (role && ['owner', 'cashier'].includes(role)) employee.role = role;

    await employee.save();

    return res.json({
      success: true,
      message: 'Employee updated successfully.',
      employee: employee.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete employee (Owner only)
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, businessId: req.businessId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(employee._id);

    return res.json({
      success: true,
      message: 'Employee account removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
