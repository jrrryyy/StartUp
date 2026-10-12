import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Zap, Eye, EyeOff, Lock, Mail, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password, rememberMe);
      toast.success(res.message || 'Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.data?.needsEmailVerification) {
        toast.info(err.response.data.message || 'Please verify your email address.');
        navigate(`/verify-email?email=${encodeURIComponent(email)}&devToken=${err.response.data.verificationToken || ''}`);
        return;
      }
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B130E] text-[#EDF6EF]">
      {/* Left Column: Visual Brand Hero */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-[#18261B] bg-[#101912]/80 p-12 lg:flex overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px] pointer-events-none" />

        <div className="relative flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">StartUp</span>
            <span className="ml-1 text-[11px] font-semibold text-brand-400">BUSINESS MANAGEMENT</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <blockquote className="space-y-2">
            <p className="text-2xl font-bold tracking-tight text-white">
              "Start Smart. Sell Better. Grow Faster."
            </p>
            <p className="text-sm text-limestone-300">
              The unified cloud solution for cashier operations, inventory intelligence, and financial health for growing Philippine businesses.
            </p>
          </blockquote>
        </div>

        <div className="relative text-xs text-limestone-400">
          © 2026 StartUp Inc. Enterprise Grade MERN Solution.
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          {/* Back button */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-limestone-400 hover:text-white transition group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Mobile brand header */}
          <div className="flex items-center space-x-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-black text-white">StartUp</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h2>
            <p className="mt-1 text-xs text-limestone-400">
              Log into your business account or register a new one.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-limestone-200 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourbusiness.com"
                  required
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-3 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-brand-400 hover:text-brand-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-10 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-limestone-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-limestone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#1E2E21] bg-[#131F17] text-brand-600 focus:ring-brand-500"
                />
                <span>Remember this session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>


          <p className="mt-8 text-center text-xs text-limestone-400">
            Don't have a business account yet?{' '}
            <Link to="/register" className="font-bold text-brand-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
