import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { toast } from 'sonner';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  History,
  PlusCircle,
  Search,
  Loader2,
  X,
  Check,
  TrendingDown,
  PackageCheck,
} from 'lucide-react';

const InventoryPage = () => {
  const { business, isOwner } = useAuth();
  const symbol = business?.currencySymbol || '₱';

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'movements'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'low_stock' | 'out_of_stock'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [inventoryData, setInventoryData] = useState({ summary: {}, items: [] });
  const [movements, setMovements] = useState([]);

  // Adjust Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('restock'); // 'restock' | 'damage' | 'adjustment'
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      if (res.data.success) {
        setInventoryData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await api.get('/inventory/movements?limit=100');
      if (res.data.success) {
        setMovements(res.data.movements);
      }
    } catch (err) {
      toast.error('Failed to load stock movements');
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, []);

  const openAdjustModal = (item) => {
    setSelectedProduct(item);
    setAdjustmentType('restock');
    setAdjustQty('');
    setAdjustReason('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustQty || Number(adjustQty) <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }

    setSubmittingAdjust(true);
    try {
      const res = await api.post('/inventory/adjustments', {
        productId: selectedProduct._id,
        adjustmentType,
        quantity: Number(adjustQty),
        reason: adjustReason || `${adjustmentType.toUpperCase()} via Inventory Manager`,
      });

      toast.success(res.data.message || 'Inventory updated successfully');
      setAdjustModalOpen(false);
      fetchInventory();
      fetchMovements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const summary = inventoryData.summary || {};
  const items = inventoryData.items || [];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === 'low_stock') {
      return matchesSearch && item.stockStatus === 'low_stock';
    }
    if (filterStatus === 'out_of_stock') {
      return matchesSearch && item.stockStatus === 'out_of_stock';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Inventory Monitor</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time stock on hand, inventory valuation, and stock intake audit log.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'inventory'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Stock Levels & Valuation
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === 'movements'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Movement Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500">Total Units on Hand</span>
          <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {summary.totalItems || 0} units
          </p>
          <span className="text-[10px] text-slate-400">{summary.totalProducts || 0} active catalog SKUs</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500">Inventory Cost Valuation</span>
          <p className="mt-1 text-xl font-extrabold text-brand-700 dark:text-brand-300">
            {formatCurrency(summary.totalCostValuation || 0, symbol)}
          </p>
          <span className="text-[10px] text-slate-400">Asset acquisition basis</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500">Retail Sales Potential</span>
          <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.totalRetailValuation || 0, symbol)}
          </p>
          <span className="text-[10px] text-slate-400">Expected gross revenue</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500">Stock Out Alerts</span>
          <p className="mt-1 text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {(summary.lowStockCount || 0) + (summary.outOfStockCount || 0)} items
          </p>
          <span className="text-[10px] text-slate-400">
            {summary.outOfStockCount || 0} out of stock, {summary.lowStockCount || 0} low
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory by item or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex space-x-1.5">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'low_stock', label: `Low Stock (${summary.lowStockCount || 0})` },
                { id: 'out_of_stock', label: `Out of Stock (${summary.outOfStockCount || 0})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterStatus(btn.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    filterStatus === btn.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <Boxes className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">No inventory records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Item & SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Available Stock</th>
                      <th className="py-3 px-4 text-center">Stock Status</th>
                      <th className="py-3 px-4 text-right">Unit Cost</th>
                      <th className="py-3 px-4 text-right">Cost Valuation</th>
                      <th className="py-3 px-4 text-right">Retail Potential</th>
                      {isOwner && <th className="py-3 px-4 text-right">Restock / Adjust</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">{item.sku}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.category}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-slate-900 dark:text-white">
                          {item.stock}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.stockStatus === 'out_of_stock' ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                              OUT OF STOCK
                            </span>
                          ) : item.stockStatus === 'low_stock' ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                              LOW ({item.stock})
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                              IN STOCK
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          {formatCurrency(item.costPrice, symbol)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-brand-700 dark:text-brand-300">
                          {formatCurrency(item.costValuation, symbol)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.retailValuation, symbol)}
                        </td>
                        {isOwner && (
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => openAdjustModal(item)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
                            >
                              Adjust Stock
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Movement Audit Logs */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Log of Stock Movements</h3>
            <p className="text-[11px] text-slate-400">
              Complete history of sales deductions, restocking intakes, damages, and audit adjustments.
            </p>
          </div>

          {movements.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">No stock movements recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4 text-center">Quantity Delta</th>
                    <th className="py-3 px-4 text-center">Previous → New</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {movements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr key={mov._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-500">{formatDateTime(mov.createdAt)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {mov.productId?.name || 'Deleted Product'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              mov.movementType === 'sale'
                                ? 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300'
                                : mov.movementType === 'restock'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {mov.movementType}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-center font-bold ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? `+${mov.quantity}` : mov.quantity}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-mono">
                          {mov.previousStock} → <span className="font-bold text-slate-900 dark:text-white">{mov.newStock}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{mov.reason}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {mov.performedBy?.name || 'Staff'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Adjust Stock Level</h3>
                <p className="text-xs text-brand-600 font-semibold">{selectedProduct.name} ({selectedProduct.sku})</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="restock">Restock Intake (Add to stock)</option>
                  <option value="damage">Damage / Expired / Loss (Deduct from stock)</option>
                  <option value="adjustment">Count Correction (Direct addition/subtraction)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity ({adjustmentType === 'restock' ? 'Units to Add' : 'Units Affected'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">Current stock: {selectedProduct.stock} units</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Supplier / Note
                </label>
                <textarea
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Weekly wholesale restock shipment from bean roaster..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50"
                >
                  {submittingAdjust ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Commit Stock Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
