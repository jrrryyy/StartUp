import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Check,
  UserCheck,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

import ConfirmModal from '../../components/common/ConfirmModal';

const EmployeesPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Employee Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      toast.error('Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/employees', formData);
      toast.success(res.data.message || 'Staff account created successfully');
      setModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'cashier' });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'active' ? 'disabled' : 'active';
    try {
      await api.patch(`/employees/${emp._id}`, { status: newStatus });
      toast.success(`Account marked as ${newStatus}`);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee status');
    }
  };

  const handleDelete = (emp) => {
    setEmployeeToDelete(emp);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/employees/${employeeToDelete._id}`);
      toast.success('Employee account removed');
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Staff & Cashier Accounts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control register access, create cashier logins, and manage staff roles.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Cashier Account</span>
        </button>
      </div>

      {/* Employees Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">No staff accounts registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4">Date Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {employees.map((emp) => {
                  const isCurrent = emp._id === user._id;
                  const isActive = emp.status === 'active';

                  return (
                    <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {emp.name} {isCurrent && <span className="text-[10px] text-brand-600 font-semibold">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{emp.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            emp.role === 'owner'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
                          }`}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          disabled={isCurrent}
                          onClick={() => handleToggleStatus(emp)}
                          className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-400'
                          } ${isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
                          title={isCurrent ? 'Cannot deactivate self' : 'Toggle Active/Disabled'}
                        >
                          {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span className="uppercase">{emp.status}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(emp.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDelete(emp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            title="Remove account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Create Employee Account</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cashier@yourbusiness.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password (Min. 8 chars) *
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="cashier">Cashier (POS & Sales Checkout Only)</option>
                  <option value="owner">Business Co-Owner (Full Admin Privileges)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      <ConfirmModal
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Staff Account?"
        message={
          employeeToDelete
            ? `Are you sure you want to remove the account for "${employeeToDelete.name}" (${employeeToDelete.email})? They will immediately lose access to the register.`
            : ''
        }
        confirmText="Remove Account"
        cancelText="Keep Account"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default EmployeesPage;
