import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'sonner';
import { Zap, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthMeter, { getPasswordCriteria } from '../../components/auth/PasswordStrengthMeter';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, criteriaList } = getPasswordCriteria(password);
    if (!isValid) {
      const unmet = criteriaList.filter((c) => !c.met).map((c) => c.label).join(', ');
      const msg = `Password does not meet requirements: ${unmet}`;
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      toast.success(res.data.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Token may be expired.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B130E] text-[#EDF6EF] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#18261B] bg-[#101912]/85 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-lg font-black text-white">StartUp</span>
        </div>

        <h2 className="text-xl font-bold text-white">Set new password</h2>
        <p className="mt-1 text-xs text-limestone-400">
          Enter your reset token and your new secure password.
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-limestone-200 mb-1">Reset Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste 64-character token"
              required
              className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 px-3 text-xs font-mono text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-limestone-200 mb-1">New Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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
            <label className="block text-xs font-semibold text-limestone-200 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Password strength meter */}
          <PasswordStrengthMeter password={password} />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update Password</span>}
          </button>

          <p className="text-center text-xs text-limestone-400">
            <Link to="/login" className="font-semibold text-brand-400 hover:underline">
              Cancel and Return to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
