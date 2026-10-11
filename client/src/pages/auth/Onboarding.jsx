import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  Store,
  Receipt,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Percent,
} from 'lucide-react';

const Onboarding = () => {
  const { business, updateBusinessState } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: business?.name || '',
    category: business?.category || 'Coffee Shop',
    currency: business?.currency || 'PHP',
    currencySymbol: business?.currencySymbol || '₱',
    address: business?.address || '',
    contactNumber: business?.contactNumber || '',
    taxRate: business?.taxRate || 0,
    taxInclusive: business?.taxInclusive ?? true,
    receiptHeader: business?.receiptHeader || 'Thank you for your patronage!',
    receiptFooter: business?.receiptFooter || 'Please come again! Keep this receipt for reference.',
  });

  const [seedSampleData, setSeedSampleData] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Update business settings
      const res = await api.patch('/business', {
        ...formData,
        taxRate: Number(formData.taxRate),
        onboardingCompleted: true,
      });

      if (res.data.success) {
        updateBusinessState(res.data.business);
      }

      // 2. If seed requested, seed demo catalog
      if (seedSampleData) {
        try {
          await api.post('/demo/seed');
        } catch (e) {
          console.warn('Seed notice:', e.message);
        }
      }

      toast.success("Welcome to StartUp! Your business register is ready.");
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to complete onboarding settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B130E] text-[#EDF6EF] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-[#18261B] bg-[#101912]/85 p-8 shadow-2xl backdrop-blur">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-brand-950/60 border border-brand-500/30 px-3 py-1 text-[11px] font-semibold text-brand-300 mb-3">
            <Sparkles className="h-3 w-3 text-brand-400" />
            <span>Store Onboarding Wizard</span>
          </span>
          <h2 className="text-2xl font-black text-white">Welcome to StartUp!</h2>
          <p className="mt-1 text-xs text-limestone-400">Let's configure your store parameters in 3 simple steps.</p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Tax & Receipts' },
            { num: 3, label: 'Catalog Ready' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center space-x-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    step === s.num
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-2 ring-brand-400'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#18261B] text-limestone-400'
                  }`}
                >
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className="hidden text-xs font-semibold sm:inline">{s.label}</span>
              </div>
              {idx < 2 && <div className="h-0.5 flex-1 mx-3 bg-[#18261B]" />}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Step 1: Identity & Currency */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-limestone-200 mb-1">Business Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="Coffee Shop">Coffee Shop / Café</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Retail">Retail Store</option>
                  <option value="Food Stall">Food Stall</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Currency Code & Symbol</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-1/2 rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={handleChange}
                    className="w-1/2 rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-limestone-200 mb-1">Store Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Unit 4, Ground Floor, Bonifacio Global City, Metro Manila"
                className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-limestone-200 mb-1">Contact Phone</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. +63 917 890 1234"
                className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Wizard Step 2: Taxes & Receipts */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#1E2E21] bg-[#131F17] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Percent className="h-4 w-4 text-brand-400" />
                  <span>Tax Configuration (e.g. 12% Philippine VAT)</span>
                </span>
                <span className="text-xs text-limestone-400">Set 0 for non-VAT businesses</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-[11px] text-limestone-400 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2 text-xs text-limestone-200 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      name="taxInclusive"
                      checked={formData.taxInclusive}
                      onChange={handleChange}
                      className="rounded border-[#1E2E21] bg-[#131F17] text-brand-600 focus:ring-brand-500"
                    />
                    <span>Price is Tax Inclusive</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-limestone-200 mb-1">Receipt Header Greeting</label>
              <input
                type="text"
                name="receiptHeader"
                value={formData.receiptHeader}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-limestone-200 mb-1">Receipt Footer Note</label>
              <textarea
                name="receiptFooter"
                value={formData.receiptFooter}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Wizard Step 3: Seed Catalog & Launch */}
        {step === 3 && (
          <div className="space-y-5 text-center">
            <div className="rounded-2xl border border-brand-500/20 bg-brand-950/20 p-6">
              <Store className="mx-auto h-12 w-12 text-brand-400 mb-3" />
              <h3 className="text-lg font-bold text-white">Your store is configured!</h3>
              <p className="mt-1 text-xs text-limestone-400 max-w-sm mx-auto">
                Would you like to seed realistic sample menu items (Spanish Latte, Cold Brew, Pastries) and recent transactions to test out the dashboard and POS immediately?
              </p>

              <label className="mt-5 inline-flex items-center space-x-2.5 rounded-xl border border-brand-500/30 bg-brand-900/30 px-4 py-2.5 text-xs font-semibold text-white cursor-pointer hover:bg-brand-900/50 transition">
                <input
                  type="checkbox"
                  checked={seedSampleData}
                  onChange={(e) => setSeedSampleData(e.target.checked)}
                  className="rounded border-[#1E2E21] bg-[#131F17] text-brand-600 focus:ring-brand-500"
                />
                <span>Include realistic demo products & past sales records</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-[#18261B] pt-5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center space-x-1.5 rounded-xl border border-[#1E2E21] bg-[#142017] px-4 py-2.5 text-xs font-semibold text-limestone-300 hover:bg-[#1A281E] hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 transition"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Launching Store...</span>
                </>
              ) : (
                <>
                  <span>Launch Dashboard</span>
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
