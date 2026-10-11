import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { user, business, isAuthenticated, loading, isOwner } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold text-slate-500">Loading your business workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If new business hasn't completed onboarding, direct them to onboarding wizard
  if (business && !business.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireOwner && !isOwner) {
    return (
      <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-rose-100 p-4 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Access Denied (403)</h2>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          This module is reserved for Business Owners. As a Cashier, your access is focused on Point of Sale operations and order entry.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
