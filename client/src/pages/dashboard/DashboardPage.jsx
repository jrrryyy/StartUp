import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Receipt,
  Boxes,
  AlertTriangle,
  Calendar,
  Sparkles,
  Loader2,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#22C55E', '#16A34A', '#4ADE80', '#10B981', '#34D399', '#059669'];

// High-contrast, easily distinguishable category colors
const CATEGORY_COLORS = {
  Coffee: '#854D0E', // Rich Roasted Coffee Brown
  'Non-Coffee': '#10B981', // Matcha Green
  Pastries: '#F59E0B', // Golden Warm Bakery Amber
  Snacks: '#F97316', // Coral Orange
  Retail: '#8B5CF6', // Purple / Indigo
  Blended: '#06B6D4', // Cool Cyan Frappe
  Desserts: '#EC4899', // Berry Pink
  Meals: '#14B8A6', // Ocean Teal
  Beverages: '#3B82F6', // Cobalt Blue
  Other: '#64748B', // Neutral Slate
};

const DISTINCT_PALETTE = [
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F97316', // Orange
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#854D0E', // Coffee Brown
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

const DashboardPage = () => {
  const { business } = useAuth();
  const symbol = business?.currencySymbol || '₱';

  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/overview?period=${period}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [period]);


  const kpis = data?.kpis || {
    grossSales: 0,
    netSales: 0,
    grossProfit: 0,
    estimatedNetProfit: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    productsSold: 0,
    lowStockProducts: 0,
    operatingExpenses: 0,
  };

  const charts = data?.charts || {
    timeline: [],
    topSellingProducts: [],
    categoryDistribution: [],
    paymentDistribution: [],
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Period Filter & Demo Seeder */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Business Performance</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time sales, profitability margins, and transaction intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Period selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Calendar className="ml-2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent px-2 py-1 focus:outline-none dark:bg-slate-900"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Net Revenue</span>
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(kpis.netSales, symbol)}
          </p>
          <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Gross: {formatCurrency(kpis.grossSales, symbol)}
          </span>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Completed Orders</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">{kpis.totalOrders}</p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">Sales Transactions</span>
        </div>

        {/* Estimated Gross Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Gross Profit</span>
            <div className="rounded-lg bg-brand-100/70 p-2 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-extrabold text-brand-700 dark:text-brand-300">
            {formatCurrency(kpis.grossProfit, symbol)}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            COGS: {formatCurrency(kpis.cogs, symbol)}
          </span>
        </div>

        {/* Estimated Net Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Est. Net Profit</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-2 text-lg font-extrabold ${
              kpis.estimatedNetProfit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(kpis.estimatedNetProfit, symbol)}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">
            Exp: {formatCurrency(kpis.operatingExpenses, symbol)}
          </span>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Average Order Value</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(kpis.averageOrderValue, symbol)}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">Per Basket</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Stock Alerts</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-extrabold text-rose-600 dark:text-rose-400">
            {kpis.lowStockProducts}
          </p>
          <span className="mt-1 inline-block text-[10px] text-slate-500">Require Restock</span>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <>
          {/* Charts Row 1: Revenue Trend Line Chart & Daily Sales Bar Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart 1: Revenue Trend */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Trend ({symbol})</h3>
                  <p className="text-[11px] text-slate-400">Net revenue progression over selected timeframe</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.timeline}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="label" fontSize={11} stroke="#64748B" />
                    <YAxis fontSize={11} stroke="#64748B" />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val, symbol), 'Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22C55E"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Daily Sales Volume */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Order Count</h3>
                  <p className="text-[11px] text-slate-400">Total customer checkout volume</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.timeline}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="label" fontSize={11} stroke="#64748B" />
                    <YAxis fontSize={11} stroke="#64748B" allowDecimals={false} />
                    <Tooltip
                      formatter={(val) => [val, 'Completed Orders']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }}
                    />
                    <Bar dataKey="orders" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Revenue vs Expenses Area & Category Distribution Donut */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Chart 3: Revenue vs. Expenses Comparison */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue vs. Operating Expenses</h3>
                  <p className="text-[11px] text-slate-400">Comparing intake against overhead expenditures</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.timeline}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="label" fontSize={11} stroke="#64748B" />
                    <YAxis fontSize={11} stroke="#64748B" />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val, symbol)]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22C55E" fillOpacity={1} fill="url(#revGrad)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" fillOpacity={1} fill="url(#expGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Sales by Product Category (Donut) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue by Category</h3>
                  <p className="text-[11px] text-slate-400">Product classification share</p>
                </div>
              </div>
              <div className="h-64 w-full">
                {charts.categoryDistribution.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No sales categorized yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {charts.categoryDistribution.map((entry, index) => {
                          const sliceColor =
                            CATEGORY_COLORS[entry.name] ||
                            DISTINCT_PALETTE[index % DISTINCT_PALETTE.length];
                          return <Cell key={`cell-${index}`} fill={sliceColor} />;
                        })}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatCurrency(val, symbol)]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 3: Top Selling Products Leaderboard */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Top-Selling Products Leaderboard</h3>
            <p className="text-[11px] text-slate-400 mb-4">Highest volume menu items and retail units sold</p>

            {charts.topSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No product sales records found in this timeframe. Open the POS register to record sales!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                      <th className="pb-2 font-semibold">Rank</th>
                      <th className="pb-2 font-semibold">Product Name</th>
                      <th className="pb-2 font-semibold">SKU</th>
                      <th className="pb-2 font-semibold text-right">Units Sold</th>
                      <th className="pb-2 font-semibold text-right">Generated Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {charts.topSellingProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-slate-400">#{idx + 1}</td>
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <Package className="h-3.5 w-3.5 text-brand-500" />
                          <span>{p.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-500">{p.sku}</td>
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white text-right">
                          {p.quantity} units
                        </td>
                        <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400 text-right">
                          {formatCurrency(p.revenue, symbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
