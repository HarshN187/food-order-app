import { useEffect, useState } from 'react';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, removePaymentMethod } from '../api/payments.api';
import type { PaymentMethodWithUser } from '../api/payments.api';
import type { User } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Plus, Edit2, Trash2, CreditCard, Wallet, Building2, Smartphone, Star, X } from 'lucide-react';
import client from '../api/client';

const typeIcons: Record<string, typeof CreditCard> = {
  CARD: CreditCard,
  UPI: Smartphone,
  WALLET: Wallet,
  BANK: Building2,
};

const typeColors: Record<string, { bg: string; text: string; ring: string }> = {
  CARD: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-600/20' },
  UPI: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' },
  WALLET: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  BANK: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
};

export const PaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethodWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'CARD',
    provider: '',
    lastFour: '',
    isDefault: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  // Filter State
  const [filterUser, setFilterUser] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [methodsData, usersData] = await Promise.all([
        getPaymentMethods(),
        client.get('/users').then((res) => res.data),
      ]);
      setMethods(methodsData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ userId: '', type: 'CARD', provider: '', lastFour: '', isDefault: false });
    setEditingId(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (method: PaymentMethodWithUser) => {
    setFormData({
      userId: method.userId,
      type: method.type,
      provider: method.provider || '',
      lastFour: method.lastFour || '',
      isDefault: method.isDefault,
    });
    setEditingId(method.id);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      if (editingId) {
        await updatePaymentMethod(editingId, {
          type: formData.type,
          provider: formData.provider || undefined,
          lastFour: formData.lastFour || undefined,
          isDefault: formData.isDefault,
        });
      } else {
        if (!formData.userId) {
          setFormError('Please select a user');
          setIsSaving(false);
          return;
        }
        await createPaymentMethod({
          userId: formData.userId,
          type: formData.type,
          provider: formData.provider || undefined,
          lastFour: formData.lastFour || undefined,
          isDefault: formData.isDefault,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save payment method');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!methodToDelete) return;
    try {
      await removePaymentMethod(methodToDelete);
      setIsDeleteOpen(false);
      setMethodToDelete(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredMethods = methods.filter((m) => {
    if (filterUser && m.userId !== filterUser) return false;
    if (filterType && m.type !== filterType) return false;
    return true;
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Payment Methods</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage payment methods for all users. <span className="font-medium text-indigo-600">{methods.length} total methods</span>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" /> Add Method
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="CARD">Card</option>
          <option value="UPI">UPI</option>
          <option value="WALLET">Wallet</option>
          <option value="BANK">Bank</option>
        </select>
        {(filterUser || filterType) && (
          <button
            onClick={() => { setFilterUser(''); setFilterType(''); }}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <X className="h-3 w-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Payment Methods Cards */}
      {filteredMethods.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm font-medium text-gray-500">No payment methods found</p>
          <p className="mt-1 text-sm text-gray-400">
            {filterUser || filterType ? 'Try adjusting your filters.' : 'Get started by adding a new payment method.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMethods.map((method) => {
            const TypeIcon = typeIcons[method.type] || CreditCard;
            const colors = typeColors[method.type] || typeColors.CARD;
            return (
              <div
                key={method.id}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
              >
                {/* Default badge */}
                {method.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Default
                    </span>
                  </div>
                )}

                {/* Type icon & badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg} group-hover:scale-105 transition-transform duration-200`}>
                    <TypeIcon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ring-1 ring-inset ${colors.ring}`}>
                      {method.type}
                    </span>
                  </div>
                </div>

                {/* Provider & details */}
                <div className="mb-4">
                  <p className="text-base font-semibold text-gray-900">{method.provider || 'Unknown Provider'}</p>
                  {method.lastFour && (
                    <p className="mt-1 text-sm text-gray-500 font-mono tracking-widest">
                      •••• •••• •••• {method.lastFour}
                    </p>
                  )}
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {method.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{method.user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-400 truncate">{method.user?.email || ''}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => openEditModal(method)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => { setMethodToDelete(method.id); setIsDeleteOpen(true); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSave}>
                  <div className="bg-white px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit' : 'Add'} Payment Method</h3>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {formError && (
                      <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-600/10">
                        {formError}
                      </div>
                    )}

                    <div className="space-y-5">
                      {/* User selector (only for new) */}
                      {!editingId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">User *</label>
                          <select
                            required
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          >
                            <option value="">Select a user...</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['CARD', 'UPI', 'WALLET', 'BANK'] as const).map((type) => {
                            const Icon = typeIcons[type];
                            const selected = formData.type === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition-all duration-200 ${
                                  selected
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Provider */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
                        <input
                          type="text"
                          value={formData.provider}
                          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400 transition-colors"
                          placeholder="Visa, Google Pay, PayPal..."
                        />
                      </div>

                      {/* Last Four */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Four Digits</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={formData.lastFour}
                          onChange={(e) => setFormData({ ...formData, lastFour: e.target.value.replace(/\D/g, '') })}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400 font-mono tracking-widest transition-colors"
                          placeholder="4242"
                        />
                      </div>

                      {/* Default toggle */}
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-indigo-600 transition-colors duration-200"></div>
                          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm peer-checked:translate-x-5 transition-transform duration-200"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Set as default</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        isDestructive={true}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => { setIsDeleteOpen(false); setMethodToDelete(null); }}
      />
    </div>
  );
};
