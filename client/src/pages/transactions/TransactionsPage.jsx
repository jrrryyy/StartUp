import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import ReceiptModal from '../../components/receipt/ReceiptModal';
import { toast } from 'sonner';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  RotateCcw,
  Eye,
  Loader2,
  Calendar,
  X,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const TransactionsPage = () => {
  const { business, isOwner } = useAuth();
  const symbol = business?.currencySymbol || '₱';

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Selected Order for Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (paymentMethod !== 'all') params.append('paymentMethod', paymentMethod);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page);
      params.append('limit', 25);

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalOrders(res.data.totalOrders);
      }
    } catch (err) {
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, status, paymentMethod, startDate, endDate, page]);

  const viewReceipt = (order) => {
    setSelectedOrder(order);
    setReceiptOpen(true);
  };

  const openRefundDialog = (order) => {
    setOrderToRefund(order);
    setRefundReason('Customer requested return or cancellation');
    setRefundModalOpen(true);
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!orderToRefund) return;

    setProcessingRefund(true);
    try {
      const res = await api.post(`/orders/${orderToRefund._id}/refund`, {
        reason: refundReason,
      });

      toast.success(res.data.message || 'Order refunded and inventory restored.');
      setRefundModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund processing failed.');
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Receipt Preview & Print Modal */}
      <ReceiptModal
        order={selectedOrder}
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />

      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Transaction History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit records of customer sales, payment tenders, refunds, and receipt re-printing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">
            Total Logged: <span className="font-extrabold text-slate-900 dark:text-white">{totalOrders}</span>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
          {/* Search by Receipt */}
          <div className="relative xl:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Receipt # (e.g. RCP-2026...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="xl:col-span-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Orders</option>
              <option value="refunded">Refunded Orders</option>
              <option value="cancelled">Cancelled Orders</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="xl:col-span-2">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash Tender</option>
              <option value="gcash">GCash Wallet</option>
              <option value="maya">Maya Wallet</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date Filter Inputs with Clear Labels */}
          <div className="flex items-center space-x-2 xl:col-span-4">
            <div className="flex flex-1 min-w-[130px] items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-brand-500 focus-within:bg-white dark:border-slate-800 dark:bg-slate-950">
              <span className="mr-1.5 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                From
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs text-slate-900 focus:outline-none dark:text-white"
                title="Start Date (From)"
              />
            </div>
            <div className="flex flex-1 min-w-[130px] items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-brand-500 focus-within:bg-white dark:border-slate-800 dark:bg-slate-950">
              <span className="mr-1.5 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                To
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs text-slate-900 focus:outline-none dark:text-white"
                title="End Date (To)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Receipt className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">No transactions match your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {orders.map((o) => {
                  const itemCount = (o.items || []).reduce((sum, i) => sum + i.quantity, 0);
                  const firstItem = o.items?.[0]?.name || 'Item';
                  const moreCount = o.items?.length > 1 ? ` +${o.items.length - 1} more` : '';

                  return (
                    <tr key={o._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {o.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDateTime(o.createdAt)}</td>
                      <td className="py-3 px-4 capitalize font-medium text-slate-600 dark:text-slate-400">
                        {o.orderType}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                          {firstItem}
                          <span className="text-[10px] text-slate-400">{moreCount}</span>
                        </p>
                        <span className="text-[10px] text-slate-500">{itemCount} units</span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(o.totalAmount, symbol)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {o.orderStatus === 'completed' ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            REFUNDED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {o.cashierId?.name || 'Staff'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => viewReceipt(o)}
                            className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            title="View and Print Thermal Receipt"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Receipt</span>
                          </button>

                          {isOwner && o.orderStatus === 'completed' && (
                            <button
                              onClick={() => openRefundDialog(o)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              title="Process Refund & Restock Items"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Confirmation Modal */}
      {refundModalOpen && orderToRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-base font-extrabold">Process Order Refund</h3>
              </div>
              <button
                onClick={() => setRefundModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300 space-y-1">
                <p>
                  Receipt: <span className="font-mono font-bold">{orderToRefund.receiptNumber}</span>
                </p>
                <p>
                  Refund Amount:{' '}
                  <span className="font-bold text-rose-600">
                    {formatCurrency(orderToRefund.totalAmount, symbol)}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Stock for all purchased items will be returned to inventory automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Refund *
                </label>
                <textarea
                  required
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer cancelled order / spilled cup..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-50"
                >
                  {processingRefund ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  <span>Confirm Refund & Restock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
