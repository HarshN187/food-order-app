import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, placeOrder, cancelOrder, removeOrderItem } from '../api/orders.api';
import type { Order } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { Trash2, Utensils } from 'lucide-react';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [_actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      setError('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      await placeOrder(order.id);
      setIsPlaceModalOpen(false);
      fetchOrder(order.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      await cancelOrder(order.id);
      setIsCancelModalOpen(false);
      fetchOrder(order.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!order || !window.confirm('Remove this item?')) return;
    try {
      await removeOrderItem(order.id, itemId);
      fetchOrder(order.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !order) return <div className="text-red-500 text-center">{error}</div>;

  const isDraft = order.status === 'DRAFT';
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';
  const currency = order.restaurant?.country?.code === 'IN' ? '₹' : '$';

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Back to Orders
        </button>
      </div>

      <div className="bg-white px-8 py-8 shadow-xl shadow-slate-100 rounded-3xl mb-8 flex justify-between items-center flex-wrap gap-6 border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Utensils className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">
                Order #{order.id.substring(0, 8).toUpperCase()}
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-slate-500 font-medium">
              {order.restaurant?.name} &bull; {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
          <p className="text-3xl font-black text-indigo-600">{currency}{Number(order.totalAmount).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Order Items</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Item</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Price</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Qty</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Subtotal</th>
              {isDraft && <th className="py-3.5 pl-3 pr-4 sm:pr-6"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {order.orderItems.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {item.menuItem?.name || 'Unknown'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                  {currency}{Number(item.unitPrice).toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                  x{item.quantity}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium text-right">
                  {currency}{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </td>
                {isDraft && (
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {order.orderItems.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500 text-sm">No items in this order. Add some from the restaurant menu.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 justify-end">
        {!hasRole('MEMBER') && (
          <>
            <button
              onClick={() => setIsCancelModalOpen(true)}
              disabled={isCompleted || isCancelled}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel Order
            </button>
            <button
              onClick={() => setIsPlaceModalOpen(true)}
              disabled={!isDraft || order.orderItems.length === 0}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              Place Order
            </button>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={isPlaceModalOpen}
        title="Place Order"
        message="Are you sure you want to checkout and place this order? You will not be able to modify items afterwards."
        onClose={() => setIsPlaceModalOpen(false)}
        onConfirm={handlePlaceOrder}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        isDestructive={true}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
      />
    </div>
  );
};
