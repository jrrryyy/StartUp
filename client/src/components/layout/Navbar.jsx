import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Sun,
  Moon,
  ShoppingCart,
  LogOut,
  Store,
  ChevronDown,
  Building,
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
                className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${
                  isOwner
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                    : 'bg-brand-100 text-brand-900 dark:bg-brand-950/70 dark:text-brand-300'
                }`}
              >
                {user?.role || 'cashier'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-xl border border-[#DFEDE1] bg-[#FAFDFB] p-1.5 shadow-xl dark:border-[#1D2E21] dark:bg-[#131F17] z-50"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="border-b border-[#E3EFE4] px-3 py-2 dark:border-[#1D2E21]">
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">{user?.name}</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{user?.email}</p>
              </div>

              {isOwner && (
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 hover:bg-limestone-100 dark:text-stone-300 dark:hover:bg-[#262D20] transition"
                >
                  <Building className="h-4 w-4 text-stone-400" />
                  <span>Business Settings</span>
                </Link>
              )}

              <button
                onClick={handleLogoutClick}
                className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

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
