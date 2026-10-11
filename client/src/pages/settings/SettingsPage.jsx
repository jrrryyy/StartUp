import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  Building,
  Receipt,
  Percent,
  Check,
  Loader2,
  Store,
  MapPin,
  Phone,
  Coins,
} from 'lucide-react';

const SettingsPage = () => {
  const { business, updateBusinessState, isOwner } = useAuth();

  const [formData, setFormData] = useState({
    name: business?.name || '',
    category: business?.category || 'Coffee Shop',
    currency: business?.currency || 'PHP',
    currencySymbol: business?.currencySymbol || '₱',
    taxRate: business?.taxRate ?? 0,
    taxInclusive: business?.taxInclusive ?? true,
    address: business?.address || '',
    contactNumber: business?.contactNumber || '',
    receiptHeader: business?.receiptHeader || 'Thank you for your patronage!',
    receiptFooter: business?.receiptFooter || 'Please come again! Keep this receipt for reference.',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error('Only the Business Owner can modify system settings.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch('/business', {
        ...formData,
        taxRate: Number(formData.taxRate),
      });

      if (res.data.success) {
        updateBusinessState(res.data.business);
        toast.success('Business settings updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Business Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure your legal entity details, POS receipts, currency formatting, and tax rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Building className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Store Identity</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                disabled={!isOwner}
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                disabled={!isOwner}
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
              >
                <option value="Coffee Shop">Coffee Shop / Café</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Retail">Retail Store</option>
                <option value="Food Stall">Food Stall</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                disabled={!isOwner}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Store address printed on receipts"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                disabled={!isOwner}
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Customer support phone"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency & Tax Configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Coins className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Currency & Value-Added Tax (VAT)</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                disabled={!isOwner}
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                disabled={!isOwner}
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                disabled={!isOwner}
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                disabled={!isOwner}
                name="taxInclusive"
                checked={formData.taxInclusive}
                onChange={handleChange}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Catalog product prices are VAT Inclusive</span>
            </label>
          </div>
        </div>

        {/* Section 3: Thermal Receipt Customization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Receipt className="h-5 w-5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Thermal Receipt Customizer</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Top Greeting / Tagline
            </label>
            <input
              type="text"
              disabled={!isOwner}
              name="receiptHeader"
              value={formData.receiptHeader}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Footer Note / Patronage Message
            </label>
            <textarea
              rows={2}
              disabled={!isOwner}
              name="receiptFooter"
              value={formData.receiptFooter}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:opacity-75"
            />
          </div>
        </div>

        {isOwner && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Save Business Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsPage;
