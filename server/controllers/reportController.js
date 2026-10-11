const Order = require('../models/Order');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const Business = require('../models/Business');
const { generateComprehensiveReport } = require('../services/excelService');
const { format } = require('date-fns');

/**
 * Export full comprehensive Excel report (.xlsx)
 */
const exportComprehensiveReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const business = await Business.findById(req.businessId);

    const orderQuery = { businessId: req.businessId };
    const expenseQuery = { businessId: req.businessId };

    if (startDate || endDate) {
      orderQuery.createdAt = {};
      expenseQuery.expenseDate = {};
      if (startDate) {
        orderQuery.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        expenseQuery.expenseDate.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      if (endDate) {
        orderQuery.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        expenseQuery.expenseDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const [orders, products, expenses] = await Promise.all([
      Order.find(orderQuery).populate('cashierId', 'name email').sort({ createdAt: -1 }),
      Product.find({ businessId: req.businessId, isActive: true }).sort({ category: 1, name: 1 }),
      Expense.find(expenseQuery).populate('recordedBy', 'name email').sort({ expenseDate: -1 }),
    ]);

    // Calculate executive KPIs
    let grossSales = 0;
    let discounts = 0;
    let refunds = 0;
    let cogs = 0;
    let productsSold = 0;
    let completedOrders = 0;

    orders.forEach((o) => {
      if (o.orderStatus === 'completed') {
        completedOrders++;
        grossSales += o.subtotal;
        discounts += o.discountAmount;
        cogs += o.costOfGoodsSold || 0;
        o.items.forEach((i) => (productsSold += i.quantity));
      } else if (o.orderStatus === 'refunded') {
        refunds += o.totalAmount;
      }
    });

    const netSales = Math.max(0, grossSales - discounts - refunds);
    const grossProfit = Math.round((netSales - cogs) * 100) / 100;
    const operatingExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const estimatedNetProfit = Math.round((grossProfit - operatingExpenses) * 100) / 100;
    const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

    const overview = {
      kpis: {
        grossSales,
        discounts,
        refunds,
        netSales,
        cogs,
        grossProfit,
        operatingExpenses,
        estimatedNetProfit,
        totalOrders: completedOrders,
        averageOrderValue: completedOrders > 0 ? Math.round((netSales / completedOrders) * 100) / 100 : 0,
        productsSold,
        lowStockProducts: lowStockCount,
      },
    };

    const workbook = await generateComprehensiveReport({
      business,
      overview,
      orders,
      products,
      expenses,
    });

    const fileName = `StartUp_${business.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${format(
      new Date(),
      'yyyyMMdd_HHmm'
    )}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportComprehensiveReport,
};
