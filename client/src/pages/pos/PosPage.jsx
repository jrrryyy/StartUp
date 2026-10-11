import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import ReceiptModal from '../../components/receipt/ReceiptModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Banknote,
  Smartphone,
  CreditCard,
  UtensilsCrossed,
  ShoppingBag,
  Percent,
  Check,
  Loader2,
  RefreshCw,
  Tag,
} from 'lucide-react';

const PosPage = () => {
  const { business } = useAuth();
  const symbol = business?.currencySymbol || '₱';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState([]);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [orderType, setOrderType] = useState('dine-in');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Checkout & Receipt Modal
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Fetch Products & Categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?includeInactive=false'),
        api.get('/products/categories'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
      if (catRes.data.success) {
        setCategories(['All', ...catRes.data.categories]);
      }
    } catch (err) {
      toast.error('Failed to load products for POS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" is currently out of stock.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.warning(`Cannot add more. Available stock is ${product.stock}.`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            sku: product.sku,
            sellingPrice: product.sellingPrice,
            stock: product.stock,
            image: product.image,
            quantity: 1,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              toast.warning(`Maximum available stock reached (${item.stock}).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountType('none');
    setDiscountValue(0);
    setAmountReceived('');
    setPaymentReference('');
    setOrderNotes('');
    setShowClearCartConfirm(false);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);

  let discountAmount = 0;
  if (discountType === 'percentage' && discountValue > 0) {
    discountAmount = (subtotal * Math.min(100, discountValue)) / 100;
  } else if (discountType === 'fixed' && discountValue > 0) {
    discountAmount = Math.min(subtotal, Number(discountValue));
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Taxes
  const taxRate = business?.taxRate || 0;
  let taxAmount = 0;
  if (taxRate > 0) {
    if (business?.taxInclusive) {
      taxAmount = discountedSubtotal - discountedSubtotal / (1 + taxRate / 100);
    } else {
      taxAmount = (discountedSubtotal * taxRate) / 100;
    }
  }

  const finalTotal = business?.taxInclusive ? discountedSubtotal : discountedSubtotal + taxAmount;

  const cashGiven = Number(amountReceived) || 0;
  const changeDue = paymentMethod === 'cash' ? Math.max(0, cashGiven - finalTotal) : 0;
  const isCashInsufficient = paymentMethod === 'cash' && cashGiven < finalTotal;

  // Process Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cannot checkout with an empty cart.');
      return;
    }

    if (paymentMethod === 'cash' && isCashInsufficient) {
      toast.error(
        `Insufficient cash tendered. Total is ${formatCurrency(
          finalTotal,
          symbol
        )}, but received ${formatCurrency(cashGiven, symbol)}.`
      );
      return;
    }

    setProcessingCheckout(true);
    try {
      const payload = {
        orderType,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        discountType,
        discountValue: Number(discountValue),
        paymentMethod,
        paymentReference,
        amountReceived: paymentMethod === 'cash' ? cashGiven : finalTotal,
        notes: orderNotes,
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        toast.success(`Order ${res.data.order.receiptNumber} completed successfully!`);
        setCompletedOrder(res.data.order);
        setShowReceiptModal(true);
        clearCart();
        fetchProducts(); // Refresh stock counts in background
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed. Please review stock and totals.';
      toast.error(msg);
    } finally {
      setProcessingCheckout(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 lg:flex-row overflow-hidden">
      {/* Receipt Modal */}
      <ReceiptModal
        order={completedOrder}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />

      {/* LEFT SECTION: Catalog & Product Grid (65% width) */}
      <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Search & Category Pills */}
        <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <button
              onClick={fetchProducts}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 transition"
              title="Refresh Catalog"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pt-3">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Tag className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No products match your search</p>
              <p className="text-[11px] text-slate-400">Try adjusting your category filter or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.lowStockThreshold;

                return (
                  <button
                    key={prod._id}
                    onClick={() => addToCart(prod)}
                    disabled={isOutOfStock}
                    className={`group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500 ${
                      isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      {/* Product Image / Icon */}
                      <div className="relative mb-2.5 h-24 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400 font-bold text-lg">
                            {prod.name.charAt(0)}
                          </div>
                        )}

                        {/* Stock Badges */}
                        <div className="absolute top-1.5 right-1.5">
                          {isOutOfStock ? (
                            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              {prod.stock} left
                            </span>
                          ) : (
                            <span className="rounded bg-black/60 backdrop-blur px-1.5 py-0.5 text-[9px] font-medium text-white">
                              {prod.stock} in stock
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 dark:text-white">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">{prod.sku}</p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                      <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                        {formatCurrency(prod.sellingPrice, symbol)}
                      </span>
                      <div className="rounded-lg bg-brand-50 p-1 text-brand-600 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950 dark:text-brand-400 transition">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart Register & Checkout Panel (35% width) */}
      <div className="flex w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:w-96 xl:w-[420px] overflow-hidden">
        {/* Cart Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Order</h3>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setShowClearCartConfirm(true)}
                className="text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Dine-In vs Takeout Selector */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex items-center justify-center space-x-1.5 rounded-xl py-2 text-xs font-bold transition ${
                orderType === 'dine-in'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Dine-In</span>
            </button>
            <button
              onClick={() => setOrderType('takeout')}
              className={`flex items-center justify-center space-x-1.5 rounded-xl py-2 text-xs font-bold transition ${
                orderType === 'takeout'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Takeout</span>
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-2 dark:divide-slate-800/80">
          {cart.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
              <ShoppingCart className="h-8 w-8 mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold">Your cart is currently empty</p>
              <p className="text-[11px]">Select items from the catalog on the left.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-2 text-xs">
                <div className="flex-1 pr-2">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {formatCurrency(item.sellingPrice, symbol)} each
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="rounded p-0.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="rounded p-0.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="w-16 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.sellingPrice * item.quantity, symbol)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary & Payment Controls */}
        <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-2.5">
          {/* Discount Pill selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
              <Percent className="h-3.5 w-3.5" />
              <span>Discount:</span>
            </span>
            <div className="flex space-x-1">
              {[
                { label: 'None', type: 'none', val: 0 },
                { label: '5%', type: 'percentage', val: 5 },
                { label: '10%', type: 'percentage', val: 10 },
                { label: '20%', type: 'percentage', val: 20 },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => {
                    setDiscountType(d.type);
                    setDiscountValue(d.val);
                  }}
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition ${
                    discountType === d.type && discountValue === d.val
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtotal, Tax & Total */}
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal, symbol)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(discountAmount, symbol)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxRate}% {business?.taxInclusive ? 'Inc.' : 'Add'}):</span>
                <span>{formatCurrency(taxAmount, symbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Total Due:</span>
              <span className="text-brand-600 dark:text-brand-400">
                {formatCurrency(finalTotal, symbol)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'gcash', label: 'GCash', icon: Smartphone },
              { id: 'maya', label: 'Maya', icon: Smartphone },
              { id: 'other', label: 'Other', icon: CreditCard },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center rounded-xl py-2 px-1 text-[10px] font-bold transition ${
                    paymentMethod === method.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 mb-0.5" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cash Payment Calculation Panel */}
          {paymentMethod === 'cash' ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Cash Received:</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-28 rounded-lg border border-slate-300 bg-white py-1 px-2 text-right text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex space-x-1">
                {[
                  { label: 'Exact', val: finalTotal },
                  { label: `${symbol}100`, val: 100 },
                  { label: `${symbol}200`, val: 200 },
                  { label: `${symbol}500`, val: 500 },
                  { label: `${symbol}1k`, val: 1000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setAmountReceived(String(preset.val))}
                    className="flex-1 rounded-md bg-white border border-slate-200 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
                <span className={isCashInsufficient ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}>
                  {isCashInsufficient ? 'Short by:' : 'Change Due:'}
                </span>
                <span className={isCashInsufficient ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}>
                  {formatCurrency(isCashInsufficient ? finalTotal - cashGiven : changeDue, symbol)}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder={`${paymentMethod.toUpperCase()} Ref # (Manual verification)`}
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          )}

          {/* Checkout Submit Button */}
          <button
            onClick={handleCheckout}
            disabled={processingCheckout || cart.length === 0 || isCashInsufficient}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 disabled:opacity-50 transition"
          >
            {processingCheckout ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Validating & Printing...</span>
              </>
            ) : (
              <>
                <span>Complete Checkout & Print Receipt</span>
                <Check className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearCartConfirm}
        onClose={() => setShowClearCartConfirm(false)}
        onConfirm={clearCart}
        title="Clear Current Order?"
        message={`You currently have ${cart.reduce((a, b) => a + b.quantity, 0)} item(s) on the register ticket. Are you sure you want to void this active order?`}
        confirmText="Yes, Clear Order"
        cancelText="Keep Items"
        variant="danger"
      />
    </div>
  );
};

export default PosPage;
