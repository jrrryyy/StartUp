import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import {
  Menu,
  Sun,
  Moon,
  ShoppingCart,
  LogOut,
  Store,
  ChevronDown,
  ChevronRight,
  Building,
  Sparkles,
  Headphones,
  HelpCircle,
  MessageSquare,
  Bug,
  X,
  Star,
  Send,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';

import ConfirmModal from '../common/ConfirmModal';

const Navbar = ({ onToggleSidebar }) => {
  const { user, business, logout, isOwner } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Active Dialog: 'whatsNew' | 'support' | 'feedback' | 'bug' | null
  const [activeModal, setActiveModal] = useState(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Bug Report State
  const [bugCategory, setBugCategory] = useState('POS');
  const [bugDescription, setBugDescription] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Business Dashboard';
    if (path.includes('/pos')) return 'Point of Sale (POS)';
    if (path.includes('/products')) return 'Product Management';
    if (path.includes('/inventory')) return 'Inventory & Stock Monitor';
    if (path.includes('/transactions')) return 'Sales & Transaction History';
    if (path.includes('/analytics')) return 'Financial Analytics & Profit';
    if (path.includes('/expenses')) return 'Operating Expenses';
    if (path.includes('/reports')) return 'Excel Reports & Exports';
    if (path.includes('/employees')) return 'Staff & Cashier Accounts';
    if (path.includes('/settings')) return 'Business Settings';
    if (path.includes('/onboarding')) return 'Business Setup';
    return 'StartUp Management';
  };

  const handleLogoutClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback comments');
      return;
    }
    toast.success('Thank you for your feedback! Our team reviews every suggestion.');
    setFeedbackText('');
    setFeedbackRating(5);
    setActiveModal(null);
  };

  const handleSubmitBug = (e) => {
    e.preventDefault();
    if (!bugDescription.trim()) {
      toast.error('Please describe the issue encountered');
      return;
    }
    toast.success('Bug report submitted. Our technical team has been notified!');
    setBugDescription('');
    setActiveModal(null);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E2EEE3] bg-[#F7FBF8]/95 px-4 backdrop-blur dark:border-[#1A281E] dark:bg-[#0D1510]/95 sm:px-6">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-stone-600 hover:bg-brand-50 dark:text-stone-300 dark:hover:bg-[#16231A] lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-[#1F2922] dark:text-[#E8F2EA] sm:text-xl">
            {getPageTitle()}
          </h1>
          <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400">
            <Store className="h-3.5 w-3.5 text-brand-500" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {business?.name || 'My Business'}
            </span>
            <span>•</span>
            <span className="capitalize">{business?.category || 'Retail'}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Launch POS Button */}
        {location.pathname !== '/pos' && (
          <Link
            to="/pos"
            className="hidden sm:inline-flex items-center space-x-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Open POS</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-stone-500 hover:bg-brand-50 dark:text-stone-400 dark:hover:bg-[#16231A] transition"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-stone-600" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 rounded-lg p-1.5 hover:bg-brand-50 dark:hover:bg-[#16231A] transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold dark:bg-brand-950 dark:text-brand-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                {user?.name || 'User'}
              </p>
              <span
                className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${isOwner
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                    : 'bg-brand-100 text-brand-900 dark:bg-brand-950/70 dark:text-brand-300'
                  }`}
              >
                {user?.role || 'cashier'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </button>

          {/* Click-away backdrop */}
          {dropdownOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
          )}

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-stone-200/80 bg-white p-2 shadow-2xl dark:border-[#1E2D22] dark:bg-[#111A13] z-50"
            >
              {/* User Header */}
              <div className="border-b border-stone-100 px-3 py-2 dark:border-[#1E2D22]/80">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{user?.name}</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{user?.email}</p>
              </div>

              {/* Top Menu Group */}
              <div className="py-1">
                {/* What's New */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveModal('whatsNew');
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-brand-50/70 dark:text-stone-200 dark:hover:bg-[#19271D] transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>What's New</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                </button>

                {/* Business Settings (for Owner) */}
                {isOwner && (
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-brand-50/70 dark:text-stone-200 dark:hover:bg-[#19271D] transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Building className="h-4 w-4 text-stone-400" />
                      <span>Business Settings</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                  </Link>
                )}
              </div>

              {/* Support Section Header */}
              <div className="border-t border-stone-100 pt-1.5 dark:border-[#1E2D22]/80">
                <div className="flex items-center space-x-2 px-3 py-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                  <Headphones className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                  <span>Support</span>
                </div>

                {/* Support Item */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveModal('support');
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-brand-50/70 dark:text-stone-200 dark:hover:bg-[#19271D] transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <HelpCircle className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                    <span>Support</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                </button>

                {/* Feedback Item */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveModal('feedback');
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-brand-50/70 dark:text-stone-200 dark:hover:bg-[#19271D] transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <MessageSquare className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                    <span>Feedback</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                </button>

                {/* Report a Bug Item */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveModal('bug');
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-700 hover:bg-rose-50/60 dark:text-stone-200 dark:hover:bg-rose-950/30 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Bug className="h-4 w-4 text-rose-500" />
                    <span>Report a bug</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                </button>
              </div>

              {/* Bottom Divider & Log Out */}
              <div className="border-t border-stone-100 pt-1.5 dark:border-[#1E2D22]/80">
                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Dialogs (Portaled to document.body for perfect viewport centering) */}
      {activeModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveModal(null);
            }}
          >
            {/* What's New Modal */}
            {activeModal === 'whatsNew' && (
              <div className="relative my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121B14] border border-stone-200 dark:border-[#1F3024]">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-[#1F3024]">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">What's New in StartUp</h3>
                      <p className="text-[11px] text-stone-400">Version 1.2.0 • Latest Enhancements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1D2B20]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div className="flex items-start space-x-3 rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-[#1E2C20] dark:bg-[#152118]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Category Selection Dropdown</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Product creation now features quick category dropdown options plus custom category entry.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-[#1E2C20] dark:bg-[#152118]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">From & To Date Filter Badges</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Clear date range tags across Transaction History and Operating Expenses with no overlapping.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-[#1E2C20] dark:bg-[#152118]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Brand-Accurate Payment Analytics</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        GCash is highlighted in vibrant blue, PayMaya in green, and Cash in yellow in Financial Analytics.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="mt-5 w-full rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition"
                >
                  Got it
                </button>
              </div>
            )}

            {/* Support Modal */}
            {activeModal === 'support' && (
              <div className="relative my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121B14] border border-stone-200 dark:border-[#1F3024]">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-[#1F3024]">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">Help & Support</h3>
                      <p className="text-[11px] text-stone-400">Customer care & store assistance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1D2B20]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5 dark:border-[#1E2C20] dark:bg-[#152118]">
                    <div className="flex items-center space-x-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <Mail className="h-4 w-4 text-brand-500" />
                      <span>Email Support Desk</span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                      Send questions to our dedicated merchant team:
                    </p>
                    <a
                      href="mailto:start.up122503@gmail.com"
                      className="mt-1 inline-block text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    >
                      start.up122503@gmail.com
                    </a>
                  </div>

                  <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5 dark:border-[#1E2C20] dark:bg-[#152118]">
                    <div className="flex items-center space-x-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <Phone className="h-4 w-4 text-brand-500" />
                      <span>Technical Assistance Hotline</span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                      Monday to Saturday • 8:00 AM - 10:00 PM PHT
                    </p>
                    <p className="mt-0.5 text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                      +63 (2) 8888-START
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="mt-5 w-full rounded-xl bg-stone-100 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 dark:bg-[#1C291F] dark:text-stone-200 dark:hover:bg-[#233327] transition"
                >
                  Close
                </button>
              </div>
            )}

            {/* Feedback Modal */}
            {activeModal === 'feedback' && (
              <div className="relative my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121B14] border border-stone-200 dark:border-[#1F3024]">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-[#1F3024]">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">Share Your Feedback</h3>
                      <p className="text-[11px] text-stone-400">Help us refine StartUp for your store</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1D2B20]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitFeedback} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      How was your experience?
                    </label>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`h-5 w-5 ${star <= feedbackRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300 dark:text-stone-600'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Suggestions or Comments *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what features you'd like to see next or what needs improvement..."
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-1/2 rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:border-[#1F3024] dark:text-stone-300 dark:hover:bg-[#1B281E]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex w-1/2 items-center justify-center space-x-1.5 rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Report Bug Modal */}
            {activeModal === 'bug' && (
              <div className="relative my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121B14] border border-stone-200 dark:border-[#1F3024]">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-[#1F3024]">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <Bug className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white">Report a Bug</h3>
                      <p className="text-[11px] text-stone-400">Report unexpected behavior or errors</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1D2B20]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitBug} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Affected Feature
                    </label>
                    <select
                      value={bugCategory}
                      onChange={(e) => setBugCategory(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs text-stone-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-white"
                    >
                      <option value="POS">Point of Sale (POS)</option>
                      <option value="Products">Product Management</option>
                      <option value="Inventory">Inventory Monitoring</option>
                      <option value="Transactions">Transaction History</option>
                      <option value="Analytics">Financial Analytics</option>
                      <option value="Expenses">Operating Expenses</option>
                      <option value="Reports">Reports & Exports</option>
                      <option value="Other">Other / System Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Issue Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={bugDescription}
                      onChange={(e) => setBugDescription(e.target.value)}
                      placeholder="Describe what happened and any steps to reproduce the issue..."
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-1/2 rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:border-[#1F3024] dark:text-stone-300 dark:hover:bg-[#1B281E]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex w-1/2 items-center justify-center space-x-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Bug</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>,
          document.body
        )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Sign Out of Store?"
        message={`You are signed in as ${user?.name || 'Store User'}. Are you sure you want to end your session?`}
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="logout"
        loading={logoutLoading}
      />
    </header>
  );
};

export default Navbar;
