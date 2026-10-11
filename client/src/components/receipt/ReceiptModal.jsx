import React from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Printer, X, CheckCircle2 } from 'lucide-react';

const ReceiptModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const business = order.businessId || {};
  const symbol = business.currencySymbol || '₱';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
        {/* Top Header / Modal Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Sale Complete</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-5">
          {/* Thermal Receipt Paper (58mm / 80mm layout) */}
          <div
            id="printable-receipt"
            className="rounded-lg border border-dashed border-slate-300 bg-white p-4 font-mono text-[11px] text-slate-800 shadow-sm"
          >
            {/* Business Header */}
            <div className="text-center">
              <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
                {business.name || 'StartUp Store'}
              </h2>
              {business.address && (
                <p className="mt-0.5 text-[10px] text-slate-600 leading-tight">{business.address}</p>
              )}
              {business.contactNumber && (
                <p className="text-[10px] text-slate-600">Tel: {business.contactNumber}</p>
              )}
              <div className="my-2 border-b border-dashed border-slate-300" />
            </div>

            {/* Receipt Meta */}
            <div className="space-y-1 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold text-slate-900">{order.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{order.cashierId?.name || 'Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Type:</span>
                <span className="uppercase font-semibold">{order.orderType || 'Dine-In'}</span>
              </div>
              <div className="my-2 border-b border-dashed border-slate-300" />
            </div>

            {/* Purchased Items List */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[10px] text-slate-900 uppercase">
                <span>Item</span>
                <span className="text-right">Qty × Price = Subtotal</span>
              </div>
              <div className="border-b border-dashed border-slate-200" />

              {order.items.map((item, idx) => (
                <div key={idx} className="flex flex-col text-[10px]">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span className="truncate pr-2">{item.name}</span>
                    <span>{formatCurrency(item.subtotal, symbol)}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {item.quantity} × {formatCurrency(item.unitSellingPrice, symbol)}
                  </div>
                </div>
              ))}
              <div className="my-2 border-b border-dashed border-slate-300" />
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal, symbol)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discountAmount, symbol)}</span>
                </div>
              )}

              {order.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({order.taxRate}%):</span>
                  <span>{formatCurrency(order.taxAmount, symbol)}</span>
                </div>
              )}

              <div className="my-1 border-b border-slate-400" />

              <div className="flex justify-between text-sm font-extrabold text-slate-900">
                <span>TOTAL AMOUNT:</span>
                <span>{formatCurrency(order.totalAmount, symbol)}</span>
              </div>

              <div className="my-1 border-b border-dashed border-slate-300" />

              {/* Payment details */}
              <div className="flex justify-between text-slate-700">
                <span>Payment Method:</span>
                <span className="uppercase font-semibold">{order.paymentMethod}</span>
              </div>

              {order.paymentReference && (
                <div className="flex justify-between text-slate-700">
                  <span>Ref #:</span>
                  <span className="font-mono">{order.paymentReference}</span>
                </div>
              )}

              {order.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-slate-700">
                    <span>Cash Tendered:</span>
                    <span>{formatCurrency(order.amountReceived, symbol)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Change:</span>
                    <span>{formatCurrency(order.changeGiven, symbol)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Message */}
            <div className="mt-4 text-center text-[9px] text-slate-500 space-y-1">
              <p>{business.receiptFooter || 'Thank you for your business!'}</p>
              <p className="font-mono text-[8px] text-slate-400">Powered by StartUp POS Platform</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Thermal Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
