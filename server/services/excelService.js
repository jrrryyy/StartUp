const ExcelJS = require('exceljs');
const { format } = require('date-fns');

/**
 * Sanitize cell values against formula injection (CSV/Excel injection)
 */
const sanitizeCellValue = (val) => {
  if (typeof val === 'string' && /^[=+\-@\t\r]/.test(val)) {
    return `'${val}`;
  }
  return val;
};

/**
 * Apply styling to header row
 */
const styleHeaderRow = (row, bgColor = '2563EB') => {
  row.height = 26;
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: bgColor },
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' },
      size: 11,
      name: 'Calibri',
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'CBD5E1' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      bottom: { style: 'medium', color: { argb: '394A26' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } },
    };
  });
};

/**
 * Generate comprehensive Financial & Business Report Excel Workbook
 */
const generateComprehensiveReport = async ({ business, overview, orders, products, expenses }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'StartUp Business Management System';
  workbook.created = new Date();

  const brandColor = '5A733B';

  // -------------------------------------------------------------
  // Sheet 1: Executive Summary
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Executive Summary', {
    views: [{ showGridLines: true }],
  });

  // Title Banner
  summarySheet.mergeCells('A1:D1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = `${business.name} — Business Performance & Financial Report`;
  titleCell.font = { size: 16, bold: true, color: { argb: '394A26' } };
  titleCell.alignment = { vertical: 'middle' };
  summarySheet.getRow(1).height = 30;

  summarySheet.getCell('A2').value = `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
  summarySheet.getCell('A2').font = { italic: true, color: { argb: '64748B' } };
  summarySheet.getCell('A3').value = `Currency: ${business.currency || 'PHP'} (${business.currencySymbol || '₱'})`;
  summarySheet.getCell('A3').font = { color: { argb: '64748B' } };

  summarySheet.addRow([]); // Blank spacer

  // KPI Metrics Table
  const kpiHeaderRow = summarySheet.addRow(['Financial Metric', 'Value', 'Classification', 'Notes']);
  styleHeaderRow(kpiHeaderRow, brandColor);

  const kpis = [
    ['Gross Sales', overview.kpis.grossSales, 'Revenue', 'Total product sales before deductions'],
    ['Discounts Given', overview.kpis.discounts, 'Deduction', 'Promotional discounts applied'],
    ['Refunds Processed', overview.kpis.refunds, 'Deduction', 'Returns & cancelled orders refunded'],
    ['Net Sales', overview.kpis.netSales, 'Revenue', 'Gross Sales minus Discounts & Refunds'],
    ['Cost of Goods Sold (COGS)', overview.kpis.cogs, 'Direct Cost', 'Historical product acquisition cost'],
    ['Gross Profit', overview.kpis.grossProfit, 'Profitability', 'Net Sales minus COGS'],
    ['Operating Expenses', overview.kpis.operatingExpenses, 'Overhead', 'Rent, utilities, payroll, supplies'],
    ['Estimated Net Profit', overview.kpis.estimatedNetProfit, 'Profitability', 'Gross Profit minus Operating Expenses'],
    ['Completed Transactions', overview.kpis.totalOrders, 'Volume', 'Total successful sales orders'],
    ['Average Order Value (AOV)', overview.kpis.averageOrderValue, 'Performance', 'Net Sales / Completed Orders'],
    ['Total Units Sold', overview.kpis.productsSold, 'Volume', 'Total item quantities sold'],
    ['Low Stock Items Alert', overview.kpis.lowStockProducts, 'Inventory', 'Items requiring restocking'],
  ];

  kpis.forEach(([metric, val, cat, notes]) => {
    const row = summarySheet.addRow([metric, val, cat, notes]);
    row.height = 20;
    if (typeof val === 'number') {
      row.getCell(2).numFmt = '#,##0.00';
      row.getCell(2).alignment = { horizontal: 'right' };
    }
  });

  summarySheet.columns = [
    { width: 30 },
    { width: 22 },
    { width: 20 },
    { width: 45 },
  ];

  // -------------------------------------------------------------
  // Sheet 2: Transactions
  // -------------------------------------------------------------
  const orderSheet = workbook.addWorksheet('Transactions', {
    views: [{ state: 'frozen', ySplit: 2, showGridLines: true }],
  });

  const orderHeaderRow = orderSheet.addRow([
    'Receipt #',
    'Date & Time',
    'Order Type',
    'Items Count',
    'Subtotal',
    'Discount',
    'Tax',
    'Total Amount',
    'Payment Method',
    'Cashier',
    'Status',
  ]);
  styleHeaderRow(orderHeaderRow, '1E40AF');

  orders.forEach((o) => {
    const totalQty = (o.items || []).reduce((acc, i) => acc + i.quantity, 0);
    const row = orderSheet.addRow([
      sanitizeCellValue(o.receiptNumber),
      format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm'),
      o.orderType,
      totalQty,
      o.subtotal,
      o.discountAmount,
      o.taxAmount,
      o.totalAmount,
      o.paymentMethod.toUpperCase(),
      sanitizeCellValue(o.cashierId?.name || 'Cashier'),
      o.orderStatus.toUpperCase(),
    ]);
    row.height = 20;
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(6).numFmt = '#,##0.00';
    row.getCell(7).numFmt = '#,##0.00';
    row.getCell(8).numFmt = '#,##0.00';
  });

  orderSheet.columns = [
    { width: 22 },
    { width: 20 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 18 },
    { width: 16 },
    { width: 20 },
    { width: 16 },
  ];
  orderSheet.autoFilter = 'A1:K1';

  // -------------------------------------------------------------
  // Sheet 3: Product Inventory
  // -------------------------------------------------------------
  const productSheet = workbook.addWorksheet('Inventory & Products', {
    views: [{ state: 'frozen', ySplit: 2, showGridLines: true }],
  });

  const productHeader = productSheet.addRow([
    'SKU',
    'Product Name',
    'Category',
    'Selling Price',
    'Cost Price',
    'Stock on Hand',
    'Stock Status',
    'Cost Valuation',
    'Retail Valuation',
  ]);
  styleHeaderRow(productHeader, '047857');

  products.forEach((p) => {
    let status = 'In Stock';
    if (p.stock <= 0) status = 'OUT OF STOCK';
    else if (p.stock <= p.lowStockThreshold) status = 'LOW STOCK';

    const row = productSheet.addRow([
      sanitizeCellValue(p.sku),
      sanitizeCellValue(p.name),
      sanitizeCellValue(p.category),
      p.sellingPrice,
      p.costPrice,
      p.stock,
      status,
      p.stock * p.costPrice,
      p.stock * p.sellingPrice,
    ]);
    row.height = 20;
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(8).numFmt = '#,##0.00';
    row.getCell(9).numFmt = '#,##0.00';
  });

  productSheet.columns = [
    { width: 16 },
    { width: 28 },
    { width: 18 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
  ];
  productSheet.autoFilter = 'A1:I1';

  // -------------------------------------------------------------
  // Sheet 4: Operating Expenses
  // -------------------------------------------------------------
  const expenseSheet = workbook.addWorksheet('Operating Expenses', {
    views: [{ state: 'frozen', ySplit: 2, showGridLines: true }],
  });

  const expenseHeader = expenseSheet.addRow([
    'Date',
    'Expense Title',
    'Category',
    'Amount',
    'Recorded By',
    'Description',
  ]);
  styleHeaderRow(expenseHeader, 'B91C1C');

  expenses.forEach((e) => {
    const row = expenseSheet.addRow([
      format(new Date(e.expenseDate), 'yyyy-MM-dd'),
      sanitizeCellValue(e.title),
      sanitizeCellValue(e.category),
      e.amount,
      sanitizeCellValue(e.recordedBy?.name || 'Owner'),
      sanitizeCellValue(e.description || ''),
    ]);
    row.height = 20;
    row.getCell(4).numFmt = '#,##0.00';
  });

  expenseSheet.columns = [
    { width: 16 },
    { width: 26 },
    { width: 18 },
    { width: 16 },
    { width: 20 },
    { width: 35 },
  ];
  expenseSheet.autoFilter = 'A1:F1';

  return workbook;
};

module.exports = {
  generateComprehensiveReport,
};
