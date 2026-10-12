import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  Clock,
} from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { token: routeToken } = useParams();
  const { verifyEmail, resendVerification, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getHashToken = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashStr = window.location.hash.replace(/^#/, '');
      const search = new URLSearchParams(hashStr);
      return search.get('token') || (hashStr.startsWith('token=') ? hashStr.slice(6) : null);
    }
    return null;
  };

  const hashToken = getHashToken();
  const token = routeToken || searchParams.get('token') || hashToken;
  const email = searchParams.get('email') || '';

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState(email);

  // Storage keys for persistent countdown across page reloads
  const storageKeyLink = `startup_link_exp_${email || 'global'}`;
  const storageKeyCooldown = `startup_resend_cd_${email || 'global'}`;

  // 30-minute Link Expiration (1800 seconds)
  const [linkSeconds, setLinkSeconds] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKeyLink);
      if (stored) {
        return Math.max(0, Math.floor((parseInt(stored, 10) - Date.now()) / 1000));
      }
    } catch (e) {}
    const defaultExp = Date.now() + 30 * 60 * 1000;
    try {
      localStorage.setItem(storageKeyLink, defaultExp.toString());
    } catch (e) {}
    return 30 * 60;
  });

  // 30-second Resend Cooldown
  const [cooldownSeconds, setCooldownSeconds] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKeyCooldown);
      if (stored) {
        return Math.max(0, Math.floor((parseInt(stored, 10) - Date.now()) / 1000));
      }
    } catch (e) {}
    const defaultCd = Date.now() + 30 * 1000;
    try {
      localStorage.setItem(storageKeyCooldown, defaultCd.toString());
    } catch (e) {}
    return 30;
  });

  // Tick countdowns every second
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Link Timer
      try {
        const stored = localStorage.getItem(storageKeyLink);
        if (stored) {
          const remaining = Math.max(0, Math.floor((parseInt(stored, 10) - Date.now()) / 1000));
          setLinkSeconds(remaining);
        } else {
          setLinkSeconds((prev) => Math.max(0, prev - 1));
        }
      } catch (e) {
        setLinkSeconds((prev) => Math.max(0, prev - 1));
      }

      // 2. Resend Cooldown
      try {
        const storedCd = localStorage.getItem(storageKeyCooldown);
        if (storedCd) {
          const remaining = Math.max(0, Math.floor((parseInt(storedCd, 10) - Date.now()) / 1000));
          setCooldownSeconds(remaining);
        } else {
          setCooldownSeconds((prev) => Math.max(0, prev - 1));
        }
      } catch (e) {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [storageKeyLink, storageKeyCooldown]);

  const formatLinkTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If token is in URL (params, query, or hash), auto-verify immediately
  useEffect(() => {
    const activeToken = token || getHashToken();
    if (activeToken && !verified && !verifying) {
      handleVerify(activeToken);
    }

    const handleHashChange = () => {
      const hToken = getHashToken();
      if (hToken && !verified && !verifying) {
        handleVerify(hToken);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [token]);

  const handleVerify = async (tokenToVerify) => {
    setVerifying(true);
    setErrorMsg('');
    try {
      const res = await verifyEmail(tokenToVerify);
      setVerified(true);
      toast.success(res.message || 'Email verified successfully!');
      setTimeout(() => {
        navigate('/onboarding');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification token is invalid or has expired.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async (e) => {
    if (e) e.preventDefault();
    if (cooldownSeconds > 0) {
      toast.info(`Please wait ${cooldownSeconds}s before requesting another email.`);
      return;
    }
    if (!resendEmail) {
      toast.error('Please enter your email address to receive an activation link.');
      return;
    }

    setResending(true);
    try {
      const res = await resendVerification(resendEmail);
      toast.success(res.message || 'Verification link sent! Check your inbox.');

      if (res.verificationToken) {
        toast.info('Click below to activate immediately without waiting for email:', {
          action: {
            label: 'Activate Account',
            onClick: () => handleVerify(res.verificationToken),
          },
          duration: 20000,
        });
      }

      // Reset 30-min link expiration and start fresh 30-sec cooldown
      const newLinkExp = Date.now() + 30 * 60 * 1000;
      const newCooldown = Date.now() + 30 * 1000;
      try {
        localStorage.setItem(storageKeyLink, newLinkExp.toString());
        localStorage.setItem(storageKeyCooldown, newCooldown.toString());
      } catch (err) {}
      setLinkSeconds(30 * 60);
      setCooldownSeconds(30);
    } catch (err) {
      toast.error('Failed to send verification link.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B130E] text-[#EDF6EF] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#18261B] bg-[#101912]/90 p-8 shadow-2xl backdrop-blur">
        {/* Brand header */}
        <div className="flex items-center space-x-2.5 justify-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black text-white">StartUp</span>
            <span className="ml-1 text-[11px] font-semibold text-brand-400">VERIFY EMAIL</span>
          </div>
        </div>

        {/* State 1: Verifying in progress */}
        {verifying && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-500" />
            <h2 className="text-lg font-bold text-white">Validating your email...</h2>
            <p className="text-xs text-limestone-400">
              Please wait while we activate your business management account.
            </p>
          </div>
        )}

        {/* State 2: Verification Successful */}
        {verified && !verifying && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Email Verified Successfully!</h2>
            <p className="text-xs text-limestone-300">
              Your account is active. Redirecting you to configure your store...
            </p>
            <div className="pt-2">
              <Link
                to="/onboarding"
                className="inline-flex items-center space-x-2 rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500 transition"
              >
                <span>Continue to Store Setup</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Error or Pending Verification */}
        {!verified && !verifying && (
          <div className="space-y-6">
            {errorMsg ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <p className="font-bold">Verification Failed</p>
                  <p className="mt-0.5 text-[11px] text-rose-300/90">{errorMsg}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-950/60 border border-brand-500/30 text-brand-400 mb-4 shadow">
                  <Mail className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-extrabold text-white">Verify Your Email Address</h2>
                <p className="mt-1 text-xs text-limestone-300">
                  {email ? (
                    <>
                      We sent an activation link to <strong className="text-white">{email}</strong>.
                    </>
                  ) : (
                    'Please click the activation link sent to your email to unlock your account.'
                  )}
                </p>

                {/* 30-Minute Link Expiration Countdown Badge */}
                <div className="mt-4 flex flex-col items-center justify-center space-y-1.5">
                  <div
                    className={`inline-flex items-center space-x-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      linkSeconds > 0
                        ? 'border-brand-500/30 bg-brand-950/40 text-brand-300'
                        : 'border-rose-500/30 bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    <Clock
                      className={`h-3.5 w-3.5 ${
                        linkSeconds > 0 ? 'text-brand-400 animate-pulse' : 'text-rose-400'
                      }`}
                    />
                    <span>
                      {linkSeconds > 0 ? (
                        <>
                          Link expires in:{' '}
                          <strong className="font-mono font-bold text-white tracking-wider">
                            {formatLinkTime(linkSeconds)}
                          </strong>
                        </>
                      ) : (
                        <strong className="font-semibold text-rose-300">
                          Activation link has expired
                        </strong>
                      )}
                    </span>
                  </div>

                  {linkSeconds === 0 && (
                    <p className="text-[11px] text-rose-400/90 text-center">
                      Please request a fresh activation link below to unlock your account.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Resend Verification Form with 30s Cooldown Countdown */}
            <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-[#18261B]">
              <label className="block text-xs font-semibold text-limestone-200">
                Didn't receive the email? Resend activation link:
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-limestone-400" />
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your account email"
                  required
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#131F17] py-2 pl-9 pr-3 text-xs text-white placeholder-limestone-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={resending || cooldownSeconds > 0}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-[#1E2E21] bg-[#142017] py-2.5 text-xs font-bold text-limestone-200 hover:bg-[#1A281E] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                    <span>Dispatching Link...</span>
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 text-limestone-500" />
                    <span className="text-limestone-400 font-medium">
                      Resend available in{' '}
                      <strong className="font-mono font-bold text-white">{cooldownSeconds}s</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 text-brand-400" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-limestone-400 hover:text-white transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
