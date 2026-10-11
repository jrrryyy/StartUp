import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Loader2,
  AlertTriangle,
  X,
  Check,
  Tag,
} from 'lucide-react';

import ConfirmModal from '../../components/common/ConfirmModal';

const ProductsPage = () => {
  const { business, isOwner } = useAuth();
  const symbol = business?.currencySymbol || '₱';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [productToArchive, setProductToArchive] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Coffee',
    description: '',
    sellingPrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '10',
    image: '',
  });

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
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Coffee',
      description: '',
      sellingPrice: '',
      costPrice: '',
      stock: '20',
      lowStockThreshold: '10',
      image: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      description: prod.description || '',
      sellingPrice: String(prod.sellingPrice),
      costPrice: String(prod.costPrice),
      stock: String(prod.stock),
      lowStockThreshold: String(prod.lowStockThreshold),
      image: prod.image || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        description: formData.description,
        sellingPrice: Number(formData.sellingPrice),
        costPrice: Number(formData.costPrice || 0),
        stock: Number(formData.stock || 0),
        lowStockThreshold: Number(formData.lowStockThreshold || 10),
        image: formData.image,
      };

      if (editingProduct) {
        const res = await api.patch(`/products/${editingProduct._id}`, payload);
        toast.success(res.data.message || 'Product updated successfully');
      } else {
        const res = await api.post('/products', payload);
        toast.success(res.data.message || 'Product created successfully');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = (prod) => {
    setProductToArchive(prod);
  };

  const confirmArchive = async () => {
    if (!productToArchive) return;
    setArchiveLoading(true);
    try {
      await api.delete(`/products/${productToArchive._id}`);
      toast.success(`Archived "${productToArchive.name}"`);
      setProductToArchive(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to archive product');
    } finally {
      setArchiveLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Product Catalog</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your store menu, retail items, selling prices, and cost margins.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Package className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">No products found</p>
            <p className="mt-1">Try resetting your filters or add your first product above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {isOwner && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((prod) => {
                  const isOut = prod.stock <= 0;
                  const isLow = prod.stock > 0 && prod.stock <= prod.lowStockThreshold;

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-slate-400">
                                {prod.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{prod.name}</p>
                            {prod.description && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{prod.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-500">{prod.sku}</td>
                      <td className="py-3 px-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(prod.sellingPrice, symbol)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {formatCurrency(prod.costPrice, symbol)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {prod.stock}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            Low ({prod.stock})
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            In Stock
                          </span>
                        )}
                      </td>
                      {isOwner && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(prod)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                              title="Edit Product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(prod)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              title="Archive Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Spanish Latte"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. CF-SL-01"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono uppercase text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Coffee, Pastries"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price ({symbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="150.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price / COGS ({symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="50.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock on Hand *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Ingredients or product specs..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToArchive}
        onClose={() => setProductToArchive(null)}
        onConfirm={confirmArchive}
        title="Archive Product?"
        message={
          productToArchive
            ? `Are you sure you want to archive "${productToArchive.name}"? It will be removed from POS and stock monitoring, but historical sales records will remain safe.`
            : ''
        }
        confirmText="Archive Product"
        cancelText="Keep Product"
        variant="danger"
        loading={archiveLoading}
      />
    </div>
  );
};

export default ProductsPage;
