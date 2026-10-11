import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-400">
          <Zap className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <h2 className="text-base font-bold text-slate-300">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The page or register you are trying to navigate to does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-500 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
