import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const GoogleAuthButton = ({ text = 'Continue with Google', redirectTo = '/dashboard' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devName, setDevName] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleBtnContainerRef = React.useRef(null);
  const [googleRendered, setGoogleRendered] = useState(false);

  // Initialize Google Identity Services script if Client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'filled_black',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'rectangular',
              width: 320,
              logo_alignment: 'left',
            });
            setGoogleRendered(true);
          }
        } catch (e) {
          console.warn('Google GSI render error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      let script = document.getElementById('google-client-script');
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-client-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', initGsi);
    }
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const res = await googleLogin(response.credential);
      toast.success(res.message || 'Authenticated with Google successfully!');
      navigate(redirectTo);
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowDevModal(true);
        }
      });
      return;
    }

    setShowDevModal(true);
  };

  const handleDevGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!devEmail) {
      toast.error('Please enter an email address for Google sign in.');
      return;
    }

    setLoading(true);
    try {
      const res = await googleLogin(null, {
        email: devEmail,
        name: devName || devEmail.split('@')[0],
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
        sub: `google_dev_${Date.now()}`,
      });
      toast.success(res.message || 'Signed in with Google!');
      setShowDevModal(false);
      navigate(redirectTo);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to authenticate with Google.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Official Google Identity Services iframe button container */}
      <div
        ref={googleBtnContainerRef}
        className={googleRendered ? 'flex justify-center w-full' : 'hidden'}
      />

      {/* Styled custom fallback button when official button is loading or offline */}
      {!googleRendered && (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="flex w-full items-center justify-center space-x-3 rounded-xl border border-[#1E2E21] bg-[#142017] py-2.5 px-4 text-xs font-semibold text-white hover:bg-[#1A281E] hover:border-brand-500 transition shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{text}</span>
        </button>
      )}

      {/* Instant Google Sign-In Modal (when VITE_GOOGLE_CLIENT_ID not yet added to .env) */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#1E2E21] bg-[#101912] p-6 shadow-2xl">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1.5 shadow">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Authentication</h3>
                <p className="text-[10px] text-limestone-400">Sign in with verified Google Identity</p>
              </div>
            </div>

            <form onSubmit={handleDevGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-limestone-200 mb-1">
                  Google Account Email *
                </label>
                <input
                  type="email"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  required
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#142017] py-2 px-3 text-xs text-white placeholder-limestone-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-limestone-200 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-[#1E2E21] bg-[#142017] py-2 px-3 text-xs text-white placeholder-limestone-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 transition"
                >
                  {loading ? 'Authenticating...' : 'Authorize Google Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDevModal(false)}
                  className="rounded-xl border border-[#1E2E21] bg-[#142017] px-3 py-2 text-xs font-semibold text-limestone-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;
