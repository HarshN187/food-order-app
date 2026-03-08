import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurant, getRestaurantMenu } from '../api/restaurants.api';
import { getOrders, createOrder, addOrderItem } from '../api/orders.api';
import type { Restaurant, MenuItem, Order } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Plus, X } from 'lucide-react';

export const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [draftOrders, setDraftOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('new');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (restaurantId: string) => {
    try {
      setIsLoading(true);
      const [restData, menuData, ordersData] = await Promise.all([
        getRestaurant(restaurantId),
        getRestaurantMenu(restaurantId),
        getOrders() // We fetch all orders and filter drafts for this restaurant
      ]);
      setRestaurant(restData);
      setMenu(menuData);
      setDraftOrders(ordersData.filter(o => o.status === 'DRAFT' && o.restaurantId === restaurantId));
    } catch (err: any) {
      setError('Failed to load restaurant details');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSelectedOrderId(draftOrders.length > 0 ? draftOrders[0].id : 'new');
    setIsModalOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedItem || !id) return;
    try {
      setIsAdding(true);
      let orderId = selectedOrderId;

      if (orderId === 'new') {
        const newOrder = await createOrder(id, null);
        orderId = newOrder.id;
      }

      await addOrderItem(orderId, selectedItem.id, quantity);
      setIsModalOpen(false);

      // Navigate to order detail? Or just show success. 
      // The prompt doesn't specify navigation, let's just refresh drafts or go to orders.
      alert('Item added successfully!');
      fetchData(id); // Reload to update drafts
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add item');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !restaurant) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{restaurant.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <span>{restaurant.cuisineType}</span>
          <span>&bull;</span>
          <span>{restaurant.address}</span>
          <span>&bull;</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${restaurant.country?.code === 'IN' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
            }`}>{restaurant.country?.name}</span>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Item Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Price</th>
                    <th className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                      <span className="sr-only">Add</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {menu.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.name}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                        {restaurant.country?.code === 'IN' ? '₹' : '$'}{Number(item.price).toFixed(2)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => openModal(item)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))}
                  {menu.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-sm text-gray-500">No items available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Side Modal */}
      {isModalOpen && selectedItem && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Add Item</h2>
                        <div className="ml-3 flex h-7 items-center">
                          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500"><X className="h-6 w-6" /></button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-base font-semibold">{selectedItem.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{selectedItem.description}</p>
                        <p className="mt-2 text-indigo-600 font-bold">
                          {restaurant.country?.code === 'IN' ? '₹' : '$'}{Number(selectedItem.price).toFixed(2)}
                        </p>

                        <div className="mt-6">
                          <label className="block text-sm font-medium leading-6 text-gray-900">Quantity</label>
                          <select
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          >
                            {[...Array(10)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-6">
                          <label className="block text-sm font-medium leading-6 text-gray-900">Order</label>
                          <select
                            value={selectedOrderId}
                            onChange={(e) => setSelectedOrderId(e.target.value)}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          >
                            <option value="new">+ Create New Order</option>
                            {draftOrders.map(draft => (
                              <option key={draft.id} value={draft.id}>Add to Draft (ID: {draft.id.substring(0, 8)})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900 text-lg">
                        <p>Subtotal</p>
                        <p>{restaurant.country?.code === 'IN' ? '₹' : '$'}{(Number(selectedItem.price) * quantity).toFixed(2)}</p>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={handleAddToCart}
                          disabled={isAdding}
                          className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isAdding ? 'Adding...' : 'Add to Order'}
                        </button>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <button onClick={() => setIsModalOpen(false)} className="font-medium text-indigo-600 hover:text-indigo-500">Cancel</button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
