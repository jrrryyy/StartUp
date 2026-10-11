const Product = require('../models/Product');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const InventoryMovement = require('../models/InventoryMovement');
const { subDays, format } = require('date-fns');

/**
 * Seed realistic Coffee Shop / Retail demo dataset for current business
 */
const seedDemoData = async (req, res, next) => {
  try {
    const businessId = req.businessId;
    const userId = req.user._id;

    // 1. Sample Coffee Shop Products
    const sampleProducts = [
      {
        name: 'Spanish Latte (Iced)',
        sku: 'CF-SL-01',
        category: 'Coffee',
        description: 'Double espresso shot with condensed milk and steamed fresh milk over ice',
        sellingPrice: 155,
        costPrice: 52,
        stock: 85,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Caramel Macchiato',
        sku: 'CF-CM-02',
        category: 'Coffee',
        description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso and caramel drizzle',
        sellingPrice: 165,
        costPrice: 58,
        stock: 64,
        lowStockThreshold: 12,
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Artisan Cold Brew',
        sku: 'CF-CB-03',
        category: 'Coffee',
        description: 'Slow-steeped 16 hours for an ultra-smooth, naturally sweet profile',
        sellingPrice: 140,
        costPrice: 40,
        stock: 45,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Kyoto Matcha Latte',
        sku: 'TEA-ML-01',
        category: 'Non-Coffee',
        description: 'Ceremonial grade Uji matcha whisked with oat milk and honey',
        sellingPrice: 175,
        costPrice: 65,
        stock: 38,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Belgian Chocolate Frappe',
        sku: 'FRP-BC-01',
        category: 'Blended',
        description: 'Rich dark chocolate blend topped with whipped cream and cocoa shavings',
        sellingPrice: 185,
        costPrice: 68,
        stock: 50,
        lowStockThreshold: 15,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Butter Croissant',
        sku: 'PAS-BC-01',
        category: 'Pastries',
        description: 'Flaky French golden butter croissant baked fresh daily',
        sellingPrice: 95,
        costPrice: 38,
        stock: 24,
        lowStockThreshold: 8,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Blueberry Cheesecake Slice',
        sku: 'PAS-BCS-02',
        category: 'Pastries',
        description: 'New York style velvety cheesecake topped with wild blueberry compote',
        sellingPrice: 190,
        costPrice: 75,
        stock: 12,
        lowStockThreshold: 5,
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Grilled Ham & Three Cheese Toastie',
        sku: 'SNK-TC-01',
        category: 'Snacks',
        description: 'Artisan sourdough with smoked ham, sharp cheddar, mozzarella, and gouda',
        sellingPrice: 180,
        costPrice: 70,
        stock: 18,
        lowStockThreshold: 6,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60',
      },
      {
        name: 'Roasted Hazelnut Coffee Beans (250g)',
        sku: 'RET-RB-01',
        category: 'Retail',
        description: 'Medium-dark roast single origin Arabica with natural hazelnut notes',
        sellingPrice: 420,
        costPrice: 220,
        stock: 8, // Low stock on purpose
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&auto=format&fit=crop&q=60',
      },
    ];

    // Upsert products
    const savedProducts = [];
    for (const prodData of sampleProducts) {
      let p = await Product.findOne({ businessId, sku: prodData.sku });
      if (!p) {
        p = await Product.create({ ...prodData, businessId });
        await InventoryMovement.create({
          businessId,
          productId: p._id,
          movementType: 'restock',
          quantity: p.stock,
          previousStock: 0,
          newStock: p.stock,
          performedBy: userId,
          reason: 'Initial demo catalog import',
        });
      }
      savedProducts.push(p);
    }

    // 2. Generate Sample Transactions across the last 10 days
    const orderCount = await Order.countDocuments({ businessId });
    if (orderCount < 10) {
      const now = new Date();
      const paymentOptions = ['cash', 'gcash', 'maya', 'cash', 'gcash'];

      for (let dayOffset = 9; dayOffset >= 0; dayOffset--) {
        const orderDate = subDays(now, dayOffset);
        // Create 2 to 4 orders per day
        const dailyOrdersCount = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < dailyOrdersCount; i++) {
          const item1 = savedProducts[Math.floor(Math.random() * savedProducts.length)];
          const item2 = savedProducts[Math.floor(Math.random() * savedProducts.length)];

          const q1 = Math.floor(Math.random() * 2) + 1;
          const q2 = item1._id.toString() !== item2._id.toString() ? 1 : 0;

          const orderItems = [
            {
              productId: item1._id,
              name: item1.name,
              sku: item1.sku,
              unitSellingPrice: item1.sellingPrice,
              unitCostPrice: item1.costPrice,
              quantity: q1,
              subtotal: item1.sellingPrice * q1,
            },
          ];

          let cogsTotal = item1.costPrice * q1;
          let subtotal = item1.sellingPrice * q1;

          if (q2 > 0) {
            orderItems.push({
              productId: item2._id,
              name: item2.name,
              sku: item2.sku,
              unitSellingPrice: item2.sellingPrice,
              unitCostPrice: item2.costPrice,
              quantity: q2,
              subtotal: item2.sellingPrice * q2,
            });
            cogsTotal += item2.costPrice * q2;
            subtotal += item2.sellingPrice * q2;
          }

          const paymentMethod = paymentOptions[Math.floor(Math.random() * paymentOptions.length)];
          const dateStr = format(orderDate, 'yyyyMMdd');
          const receiptNumber = `RCP-${dateStr}-${String(Math.floor(Math.random() * 8999) + 1000)}`;

          await Order.create({
            businessId,
            cashierId: userId,
            receiptNumber,
            orderType: Math.random() > 0.4 ? 'dine-in' : 'takeout',
            items: orderItems,
            subtotal,
            discountType: 'none',
            discountValue: 0,
            discountAmount: 0,
            taxRate: 0,
            taxAmount: 0,
            totalAmount: subtotal,
            costOfGoodsSold: cogsTotal,
            paymentMethod,
            paymentReference: paymentMethod !== 'cash' ? `REF-${Math.floor(Math.random() * 899999 + 100000)}` : '',
            amountReceived: subtotal + (paymentMethod === 'cash' ? 50 : 0),
            changeGiven: paymentMethod === 'cash' ? 50 : 0,
            orderStatus: 'completed',
            createdAt: orderDate,
            updatedAt: orderDate,
          });
        }
      }
    }

    // 3. Generate Operating Expenses
    const expenseCount = await Expense.countDocuments({ businessId });
    if (expenseCount < 4) {
      const demoExpenses = [
        {
          title: 'Store Commercial Space Rental (Monthly)',
          category: 'Rent',
          amount: 22000,
          date: subDays(new Date(), 8),
          description: 'Monthly commercial rental payment for café space',
        },
        {
          title: 'Electricity & Water Commercial Bill',
          category: 'Utilities',
          amount: 7850,
          date: subDays(new Date(), 5),
          description: 'Power consumption for espresso machines, refrigeration & lighting',
        },
        {
          title: 'Wholesale Dairy & Oat Milk Supply',
          category: 'Supplies',
          amount: 5400,
          date: subDays(new Date(), 3),
          description: '5 crates of Barista blend fresh milk and oat milk cartons',
        },
        {
          title: 'Biodegradable Cups, Lids & Straws',
          category: 'Supplies',
          amount: 3200,
          date: subDays(new Date(), 2),
          description: 'Custom logo printed cold cups and hot sleeves',
        },
      ];

      for (const exp of demoExpenses) {
        await Expense.create({
          businessId,
          title: exp.title,
          category: exp.category,
          amount: exp.amount,
          expenseDate: exp.date,
          description: exp.description,
          recordedBy: userId,
        });
      }
    }

    return res.json({
      success: true,
      message: 'Demo dataset successfully loaded with products, sales transactions, and expense records!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  seedDemoData,
};
