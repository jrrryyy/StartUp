import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShoppingCart,
  TrendingUp,
  Boxes,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle,
  Store,
  Coffee,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0B130E] text-[#EDF6EF] selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-[#18261B] bg-[#0B130E]/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">StartUp</span>
              <span className="ml-1 text-[11px] font-semibold text-brand-400">BUSINESS SUITE</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-limestone-200 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28 text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[700px] rounded-full bg-brand-500/15 blur-[130px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center space-x-2 rounded-full border border-brand-500/40 bg-brand-950/60 px-3.5 py-1 text-xs font-semibold text-brand-300 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>Commercial-Grade POS & Business Intelligence</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Start Smart. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-limestone-200 bg-clip-text text-transparent">
              Sell Better. Grow Faster.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-limestone-300 sm:text-lg">
            The all-in-one business management, cloud cashier POS, inventory control, and financial analytics platform tailored for coffee shops, cafes, retail, and modern startups.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="flex items-center space-x-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/25 hover:bg-brand-600 transition"
            >
              <span>Launch Your Business</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-[#1E2E21] bg-[#142017] px-6 py-3.5 text-sm font-bold text-limestone-200 hover:bg-[#1A281E] transition"
            >
              Sign In to Store
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-limestone-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="h-4 w-4 text-brand-400" />
              <span>Multi-Tenant Security</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="h-4 w-4 text-brand-400" />
              <span>PHP (₱) Currency Ready</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="h-4 w-4 text-brand-400" />
              <span>Excel & Thermal Print</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="border-t border-[#18261B] bg-[#101912]/50 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400">Everything You Need</h2>
            <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Engineered for Speed, Accuracy, and Profit
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-[#18261B] bg-[#101912]/80 p-6 hover:border-brand-500/50 transition shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-5">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Ultra-Fast Digital Cashier POS</h3>
              <p className="mt-2 text-xs leading-relaxed text-limestone-300">
                Designed for barista and cashier speed. Instant product search, Dine-in/Takeout tags, cash change calculator, and GCash/Maya logging.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-[#18261B] bg-[#101912]/80 p-6 hover:border-brand-500/50 transition shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-5">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">True Net Profit Intelligence</h3>
              <p className="mt-2 text-xs leading-relaxed text-limestone-300">
                Never confuse revenue with profit. Track Cost of Goods Sold (COGS), operating expenses, and estimated net profit with interactive Recharts graphs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-[#18261B] bg-[#101912]/80 p-6 hover:border-brand-500/50 transition shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-5">
                <Boxes className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Atomic Inventory & Restocking</h3>
              <p className="mt-2 text-xs leading-relaxed text-limestone-300">
                Automatic stock deduction upon checkout. Prevents overselling, alerts on low stock thresholds, and maintains an immutable movement audit trail.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-[#18261B] bg-[#101912]/80 p-6 hover:border-brand-500/50 transition shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-5">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Professional Excel (.xlsx) Reports</h3>
              <p className="mt-2 text-xs leading-relaxed text-limestone-300">
                One-click export with ExcelJS. Styled multi-sheet workbooks with executive KPI summaries, transaction logs, inventory valuations, and expense sheets.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-[#18261B] bg-[#101912]/80 p-6 hover:border-brand-500/50 transition shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 mb-5">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">58mm & 80mm Thermal Receipts</h3>
              <p className="mt-2 text-xs leading-relaxed text-limestone-300">
                Generate clean, compliant thermal receipts configured with your store name, address, contact, cashier name, tax rates, and footer greetings.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-[#18261B] bg-[#101912]/80 p-6 hover:border-brand-500/50 transition shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Role-Based Access Control (RBAC)</h3>
              <p className="mt-2 text-xs leading-relaxed text-limestone-300">
                Grant Cashiers fast access to the POS register while safeguarding business financial analytics, expense entries, and business settings for the Owner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#18261B] py-8 text-center text-xs text-limestone-400">
        <p>© 2026 StartUp Platform. "Start Smart. Sell Better. Grow Faster." All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
