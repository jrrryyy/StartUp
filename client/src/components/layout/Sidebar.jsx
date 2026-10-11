import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  LineChart,
  Wallet,
  FileSpreadsheet,
  Users,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggleCollapse, isOpenMobile, onCloseMobile }) => {
  const { user, business, isOwner } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, ownerOnly: false },
    { name: 'Point of Sale', path: '/pos', icon: ShoppingCart, ownerOnly: false },
    { name: 'Products', path: '/products', icon: Package, ownerOnly: false },
    { name: 'Inventory', path: '/inventory', icon: Boxes, ownerOnly: false },
    { name: 'Transactions', path: '/transactions', icon: Receipt, ownerOnly: false },
    { name: 'Analytics', path: '/analytics', icon: LineChart, ownerOnly: true },
    { name: 'Expenses', path: '/expenses', icon: Wallet, ownerOnly: true },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet, ownerOnly: true },
    { name: 'Employees', path: '/employees', icon: Users, ownerOnly: true },
    { name: 'Settings', path: '/settings', icon: Settings, ownerOnly: false },
  ];

  const visibleItems = navItems.filter((item) => !item.ownerOnly || isOwner);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#0C1510] text-[#D8ECD9]">
      {/* Top Header / Branding */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-[#1A281E] px-4">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
              <Zap className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white">StartUp</span>
                <span className="text-[10px] text-brand-300 font-semibold">Artisan POS & Suite</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1 text-brand-300 hover:bg-[#16231A] hover:text-white lg:flex"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 p-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : 'text-[#9BB7A1] hover:bg-[#16231A] hover:text-white'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tenant Footer Card */}
      {!isCollapsed && (
        <div className="border-t border-[#1A281E] p-3">
          <div className="rounded-xl bg-[#131F17] border border-[#1D2E21] p-2.5">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-brand-400 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{business?.name || 'StartUp Store'}</p>
                <p className="text-[10px] text-[#9BB7A1] truncate">
                  Role: <span className="text-brand-300 uppercase font-bold">{user?.role}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Drawer */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#0C1510] transition-transform duration-200 ease-in-out lg:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-[#1A281E] bg-[#0C1510] transition-all duration-200 lg:block ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
