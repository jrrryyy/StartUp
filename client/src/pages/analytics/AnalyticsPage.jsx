import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Info,
  Loader2,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const PALETTE = ['#22C55E', '#16A34A', '#4ADE80', '#10B981', '#34D399', '#059669'];

// Specific brand colors for payment channels
const PAYMENT_COLORS = {
  GCash: '#007DFE', // Vibrant GCash Blue
  gcash: '#007DFE',
  Maya: '#10B981', // PayMaya / Maya Green
  maya: '#10B981',
  PayMaya: '#10B981',
  paymaya: '#10B981',
  Cash: '#EAB308', // Cash Yellow
  cash: '#EAB308',
  Other: '#94A3B8', // Neutral Slate
  other: '#94A3B8',
};

const AnalyticsPage = () => {
  const { business } = useAuth();
  const symbol = business?.currencySymbol || '₱';

  const [period, setPeriod] = useState('30days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/overview?period=${period}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load financial analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Financial Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive P&L analysis, cost of goods, and channel breakdown.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Calendar className="ml-2 h-3.5 w-3.5 text-slate-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-transparent px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Accounting Methodology Banner */}
      <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center space-x-2 font-bold text-brand-600 dark:text-brand-400 mb-1">
          <Info className="h-4 w-4" />
          <span>Accounting Formula Standard</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          • <strong>Net Sales</strong> = Gross Sales − Discounts − Refunds &nbsp;|&nbsp;
          • <strong>Gross Profit</strong> = Net Sales − COGS &nbsp;|&nbsp;
          • <strong>Estimated Net Profit</strong> = Gross Profit − Recorded Operating Expenses
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <>
          {/* Detailed Financial Waterfall Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500">1. Gross Product Sales</span>
              <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(kpis.grossSales || 0, symbol)}
              </p>
              <span className="text-[10px] text-slate-400">Total catalog pricing</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500">2. Discounts & Refunds</span>
              <p className="mt-1 text-lg font-extrabold text-rose-600 dark:text-rose-400">
                -{formatCurrency((kpis.discounts || 0) + (kpis.refunds || 0), symbol)}
              </p>
              <span className="text-[10px] text-slate-400">
                {formatCurrency(kpis.discounts || 0, symbol)} disc, {formatCurrency(kpis.refunds || 0, symbol)} ref
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500">3. Net Sales Intake</span>
              <p className="mt-1 text-lg font-extrabold text-brand-600 dark:text-brand-400">
                {formatCurrency(kpis.netSales || 0, symbol)}
              </p>
              <span className="text-[10px] text-slate-400">Net collected funds</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500">4. Cost of Goods Sold (COGS)</span>
              <p className="mt-1 text-lg font-extrabold text-amber-600 dark:text-amber-400">
                -{formatCurrency(kpis.cogs || 0, symbol)}
              </p>
              <span className="text-[10px] text-slate-400">Historical acquisition basis</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500">5. Gross Profit Margin</span>
              <p className="mt-1 text-lg font-black text-brand-700 dark:text-brand-300">
                {formatCurrency(kpis.grossProfit || 0, symbol)}
              </p>
              <span className="text-[10px] text-slate-400">
                Margin: {kpis.netSales > 0 ? ((kpis.grossProfit / kpis.netSales) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-semibold text-slate-500">6. Operating Expenses</span>
              <p className="mt-1 text-lg font-extrabold text-rose-600 dark:text-rose-400">
                -{formatCurrency(kpis.operatingExpenses || 0, symbol)}
              </p>
              <span className="text-[10px] text-slate-400">Rent, payroll & utilities</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-500">7. Estimated Net Bottom-Line Profit</span>
              <p
                className={`mt-1 text-2xl font-black ${
                  kpis.estimatedNetProfit >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(kpis.estimatedNetProfit || 0, symbol)}
              </p>
              <span className="text-[10px] text-slate-400">
                Net Margin: {kpis.netSales > 0 ? ((kpis.estimatedNetProfit / kpis.netSales) * 100).toFixed(1) : 0}% of net sales
              </span>
            </div>
          </div>

          {/* Charts Row: Payment Method Breakdown & Gross Profit by Category */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Payment Method Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Payment Channel Distribution
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">Cash vs. E-Wallets (GCash, Maya)</p>

              <div className="h-64 w-full">
                {(charts.paymentDistribution || []).length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No payment data recorded in this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.paymentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.paymentDistribution.map((entry, index) => {
                          const sliceColor = PAYMENT_COLORS[entry.name] || PALETTE[index % PALETTE.length];
                          return <Cell key={`cell-${index}`} fill={sliceColor} />;
                        })}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatCurrency(val, symbol)]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)' }}
                        itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                        labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Products Volume Bar Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Top Products by Sales Volume
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">Units sold per menu item</p>

              <div className="h-64 w-full">
                {(charts.topSellingProducts || []).length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No product transactions in this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.topSellingProducts.slice(0, 5)}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis type="number" fontSize={11} stroke="#64748B" />
                      <YAxis dataKey="name" type="category" fontSize={10} width={90} stroke="#64748B" />
                      <Tooltip
                        formatter={(val) => [`${val} units sold`]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)' }}
                        itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                        labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                      />
                      <Bar dataKey="quantity" fill="#22C55E" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
