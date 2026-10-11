import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'sonner';
import { Zap, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data.resetToken) {
        setDemoToken(res.data.resetToken);
      }
      toast.success('Password reset instructions processed.');
    } catch (err) {
      toast.error('Unable to process password reset request.');
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

        <h2 className="text-xl font-bold text-white">Forgot your password?</h2>
        <p className="mt-1 text-xs text-limestone-400">
          Enter your registered email address and we will provide password reset instructions.
        </p>

        {submitted ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-400">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Reset request received</p>
                <p className="mt-1 text-limestone-400">
                  If that email exists in our records, a secure single-use reset token has been issued.
                </p>
              </div>
            </div>

            {demoToken && (
              <div className="rounded-xl border border-[#1E2E21] bg-[#131F17] p-3 text-xs">
                <p className="font-semibold text-brand-400 mb-1">Development Demo Token:</p>
                <p className="font-mono text-[11px] text-limestone-300 break-all">{demoToken}</p>
                <Link
                  to={`/reset-password?token=${demoToken}`}
                  className="mt-2 inline-block font-bold text-brand-400 hover:underline"
                >
                  Proceed to Reset Password Form →
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-limestone-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-limestone-200 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-limestone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourbusiness.com"
                  required
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2.5 pl-10 pr-3 text-xs text-white placeholder-limestone-400 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Send Reset Instructions</span>}
            </button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs text-limestone-400 hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
