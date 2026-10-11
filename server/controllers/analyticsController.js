const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  format,
} = require('date-fns');

/**
 * Parse time range into start and end dates
 */
const getDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let start = startOfDay(subDays(now, 29));
  let end = endOfDay(now);

  switch (period) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'yesterday':
      start = startOfDay(subDays(now, 1));
      end = endOfDay(subDays(now, 1));
      break;
    case '7days':
      start = startOfDay(subDays(now, 6));
      end = endOfDay(now);
      break;
    case '30days':
      start = startOfDay(subDays(now, 29));
      end = endOfDay(now);
      break;
    case 'month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'last_month':
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      break;
    case 'year':
      start = startOfYear(now);
      end = endOfDay(now);
      break;
    case 'custom':
      if (customStart) start = startOfDay(new Date(customStart));
      if (customEnd) end = endOfDay(new Date(customEnd));
      break;
    default:
      start = startOfDay(subDays(now, 29));
      end = endOfDay(now);
  }

  return { start, end };
};

/**
 * Get overall business metrics and KPI card statistics
 */
const getOverview = async (req, res, next) => {
  try {
    const { period = '30days', startDate, endDate } = req.query;
    const { start, end } = getDateRange(period, startDate, endDate);

    const businessId = req.businessId;

    // 1. Fetch orders in the period
    const orders = await Order.find({
      businessId,
      createdAt: { $gte: start, $lte: end },
    });

    let grossSales = 0;
    let discounts = 0;
    let refunds = 0;
    let cogs = 0;
    let totalProductsSold = 0;
    let completedOrdersCount = 0;

    const paymentMethodMap = { cash: 0, gcash: 0, maya: 0, other: 0 };
    const categoryRevenueMap = {};
    const productSalesMap = {};

    for (const order of orders) {
      if (order.orderStatus === 'completed') {
        completedOrdersCount++;
        grossSales += order.subtotal;
        discounts += order.discountAmount;
        cogs += order.costOfGoodsSold || 0;

        // Payment method breakdown
        paymentMethodMap[order.paymentMethod] = (paymentMethodMap[order.paymentMethod] || 0) + order.totalAmount;

        // Item level breakdown
        for (const item of order.items) {
          totalProductsSold += item.quantity;

          // Product aggregation
          const pId = item.productId.toString();
          if (!productSalesMap[pId]) {
            productSalesMap[pId] = {
              name: item.name,
              sku: item.sku,
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[pId].quantity += item.quantity;
          productSalesMap[pId].revenue += item.subtotal;
        }
      } else if (order.orderStatus === 'refunded') {
        refunds += order.totalAmount;
      }
    }

    const netSales = Math.max(0, grossSales - discounts - refunds);
    const grossProfit = Math.round((netSales - cogs) * 100) / 100;
    const averageOrderValue = completedOrdersCount > 0 ? Math.round((netSales / completedOrdersCount) * 100) / 100 : 0;

    // 2. Fetch Operating Expenses in the period
    const expenses = await Expense.find({
      businessId,
      expenseDate: { $gte: start, $lte: end },
    });

    const operatingExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const estimatedNetProfit = Math.round((grossProfit - operatingExpenses) * 100) / 100;

    // 3. Count low stock products
    const lowStockCount = await Product.countDocuments({
      businessId,
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    });

    // 4. Products sold ranking
    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // 5. Build timeline data (daily revenue vs expenses)
    const timelineMap = {};
    const curr = new Date(start);
    while (curr <= end) {
      const key = format(curr, 'yyyy-MM-dd');
      timelineMap[key] = {
        date: key,
        label: format(curr, 'MMM dd'),
        revenue: 0,
        orders: 0,
        expenses: 0,
        cogs: 0,
        grossProfit: 0,
      };
      curr.setDate(curr.getDate() + 1);
    }

    orders.forEach((o) => {
      if (o.orderStatus === 'completed') {
        const key = format(new Date(o.createdAt), 'yyyy-MM-dd');
        if (timelineMap[key]) {
          timelineMap[key].revenue += o.totalAmount;
          timelineMap[key].orders += 1;
          timelineMap[key].cogs += o.costOfGoodsSold || 0;
          timelineMap[key].grossProfit += o.totalAmount - (o.costOfGoodsSold || 0);
        }
      }
    });

    expenses.forEach((e) => {
      const key = format(new Date(e.expenseDate), 'yyyy-MM-dd');
      if (timelineMap[key]) {
        timelineMap[key].expenses += e.amount;
      }
    });

    const timeline = Object.values(timelineMap);

    // 6. Category Sales Distribution
    const activeProducts = await Product.find({ businessId, isActive: true });
    const productCategoryLookup = {};
    activeProducts.forEach((p) => {
      productCategoryLookup[p._id.toString()] = p.category;
    });

    orders.forEach((o) => {
      if (o.orderStatus === 'completed') {
        o.items.forEach((item) => {
          const cat = productCategoryLookup[item.productId.toString()] || 'General';
          categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + item.subtotal;
        });
      }
    });

    const categoryDistribution = Object.keys(categoryRevenueMap).map((cat) => ({
      name: cat,
      value: Math.round(categoryRevenueMap[cat] * 100) / 100,
    }));

    return res.json({
      success: true,
      period,
      dateRange: { start, end },
      kpis: {
        grossSales: Math.round(grossSales * 100) / 100,
        discounts: Math.round(discounts * 100) / 100,
        refunds: Math.round(refunds * 100) / 100,
        netSales: Math.round(netSales * 100) / 100,
        cogs: Math.round(cogs * 100) / 100,
        grossProfit,
        operatingExpenses: Math.round(operatingExpenses * 100) / 100,
        estimatedNetProfit,
        totalOrders: completedOrdersCount,
        averageOrderValue,
        productsSold: totalProductsSold,
        lowStockProducts: lowStockCount,
      },
      charts: {
        timeline,
        topSellingProducts,
        categoryDistribution,
        paymentDistribution: [
          { name: 'Cash', value: Math.round(paymentMethodMap.cash * 100) / 100 },
          { name: 'GCash', value: Math.round(paymentMethodMap.gcash * 100) / 100 },
          { name: 'Maya', value: Math.round(paymentMethodMap.maya * 100) / 100 },
          { name: 'Other', value: Math.round(paymentMethodMap.other * 100) / 100 },
        ].filter((p) => p.value > 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
};
