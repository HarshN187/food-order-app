import { useEffect, useState } from 'react';
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, removePaymentMethod } from '../api/payments.api';
import type { PaymentMethod } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const PaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: 'CARD', provider: '', lastFour: '', isDefault: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setIsLoading(true);
      const data = await getPaymentMethods();
      setMethods(data);
    } catch (err: any) {
      setError('Failed to fetch payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ type: 'CARD', provider: '', lastFour: '', isDefault: false });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setFormData({ type: method.type, provider: method.provider, lastFour: method.lastFour, isDefault: method.isDefault });
    setEditingId(method.id);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePaymentMethod(editingId, formData);
      } else {
        await createPaymentMethod(formData);
      }
      setIsModalOpen(false);
      fetchMethods();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save payment method');
    }
  };

  const handleDelete = async () => {
    if (!methodToDelete) return;
    try {
      await removePaymentMethod(methodToDelete);
      setIsDeleteOpen(false);
      fetchMethods();
    } catch (err: any) {
      alert('Failed to delete');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Payment Methods</h1>
          <p className="mt-2 text-sm text-gray-700">Manage payment options. Admin only view.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={openAddModal}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add method
          </button>
        </div>
      </div>

      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Type</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Provider</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Default</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {methods.map((method) => (
                  <tr key={method.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{method.type}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{method.provider || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {method.lastFour ? `**** ${method.lastFour}` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {method.isDefault ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Yes
                        </span>
                      ) : 'No'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditModal(method)} className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center gap-1">
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => { setMethodToDelete(method.id); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-900 text-sm flex items-center gap-1">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSave}>
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit' : 'Add'} Payment Method</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">Type</label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="mt-2 block w-full rounded-md border-gray-300 py-1.5 focus:ring-indigo-600 p-2 border"
                        >
                          <option value="CARD">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="WALLET">Wallet</option>
                          <option value="BANK">Bank</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">Provider (Optional)</label>
                        <input
                          type="text"
                          value={formData.provider || ''}
                          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                          className="mt-2 block w-full rounded-md border-gray-300 py-1.5 focus:ring-indigo-600 p-2 border"
                          placeholder="Visa, GPay, PayPal..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">Last Four (Optional, for Cards)</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={formData.lastFour || ''}
                          onChange={(e) => setFormData({ ...formData, lastFour: e.target.value })}
                          className="mt-2 block w-full rounded-md border-gray-300 py-1.5 focus:ring-indigo-600 p-2 border"
                          placeholder="e.g. 4242"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={formData.isDefault}
                          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium leading-6 text-gray-900">Set as default</label>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto">Save</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
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
        message="Are you sure you want to delete this payment method?"
        isDestructive={true}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
