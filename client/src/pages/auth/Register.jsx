import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Zap, Lock, Mail, User, Store, MapPin, Phone, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthMeter, { getPasswordCriteria } from '../../components/auth/PasswordStrengthMeter';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Coffee Shop',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessAddress: '',
    contactNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Strong password criteria check
    const { isValid, criteriaList } = getPasswordCriteria(formData.password);
    if (!isValid) {
      const unmet = criteriaList.filter((c) => !c.met).map((c) => c.label).join(', ');
      const msg = `Password does not meet requirements: ${unmet}`;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData);
      toast.success(res.message || 'Business registered successfully!');
      if (res.needsEmailVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B130E] text-[#EDF6EF] py-12 px-6 sm:px-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Back navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-limestone-400 hover:text-white transition group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-brand-400 hover:underline"
          >
            Sign In instead
          </Link>
        </div>

        {/* Brand header */}
        <div className="flex items-center space-x-2.5 justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black text-white">StartUp</span>
            <span className="ml-1 text-[11px] font-semibold text-brand-400">REGISTER</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#18261B] bg-[#101912]/85 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold text-white">Register your business</h2>
            <p className="mt-1 text-xs text-limestone-400">
              Join thousands of cafés, food stalls, and retail stores scaling with StartUp.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Business Name *</label>
                <div className="relative">
                  <Store className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Daily Grind Coffee"
                    required
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-3 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Business Category *</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="Coffee Shop">Coffee Shop / Café</option>
                  <option value="Restaurant">Restaurant / Bistro</option>
                  <option value="Retail">Retail Store / Boutique</option>
                  <option value="Food Stall">Food Stall / Kiosk</option>
                  <option value="Other">Other Startup</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Owner Full Name *</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Maria Santos"
                    required
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-3 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="owner@business.com"
                    required
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-3 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-10 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-limestone-400 hover:text-white transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-10 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-limestone-400 hover:text-white transition"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <PasswordStrengthMeter password={formData.password} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Business Address (Optional)</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    placeholder="e.g. BGC, Taguig City"
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-3 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-limestone-200 mb-1">Contact Number (Optional)</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="e.g. +63 917 123 4567"
                    className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-3 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Setup Store</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-limestone-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
