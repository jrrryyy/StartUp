import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'sonner';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Loader2,
  X,
  Check,
  Calendar,
  DollarSign,
} from 'lucide-react';

import ConfirmModal from '../../components/common/ConfirmModal';

const CATEGORIES = [
  'All',
  'Rent',
  'Utilities',
  'Salaries',
  'Supplies',
  'Equipment',
  'Marketing',
  'Maintenance',
  'Miscellaneous',
];

const ExpensesPage = () => {
  const { business } = useAuth();
  const symbol = business?.currencySymbol || '₱';

  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Supplies',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/expenses?${params.toString()}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setTotalAmount(res.data.totalAmount);
      }
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, search, startDate, endDate]);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Supplies',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      amount: String(exp.amount),
      expenseDate: new Date(exp.expenseDate).toISOString().split('T')[0],
      description: exp.description || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid title and positive amount');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        amount: Number(formData.amount),
        expenseDate: formData.expenseDate,
        description: formData.description,
      };

      if (editingExpense) {
        await api.patch(`/expenses/${editingExpense._id}`, payload);
        toast.success('Expense updated');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense recorded');
      }

      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (exp) => {
    setExpenseToDelete(exp);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/expenses/${expenseToDelete._id}`);
      toast.success('Expense record deleted');
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Operating Expenses</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log overhead, salaries, supplies, utilities, and commercial rent for accurate net profit accounting.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Expense Summary Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500">Total Recorded Expenses</span>
          <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalAmount, symbol)}
          </p>
          <span className="text-[10px] text-slate-400">{expenses.length} entries in view</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Date Filter Inputs with Clear Labels */}
          <div className="flex items-center space-x-2">
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

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Expense Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Wallet className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">No expenses recorded yet</p>
            <p className="mt-1">Click "Record New Expense" above to log store expenditures.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-500">{formatDate(exp.expenseDate)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(exp.amount, symbol)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{exp.description || '—'}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{exp.recordedBy?.name || 'Owner'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingExpense ? 'Edit Expense Record' : 'Record Operating Expense'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Electric & Water Bill"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({symbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="2500.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Invoice # / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Official receipt / vendor details..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>{editingExpense ? 'Save Changes' : 'Record Expense'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Expense Record?"
        message={
          expenseToDelete
            ? `Are you sure you want to delete "${expenseToDelete.title}" (${formatCurrency(expenseToDelete.amount, symbol)})? This will adjust your operating expense calculations.`
            : ''
        }
        confirmText="Delete Expense"
        cancelText="Keep Record"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ExpensesPage;
