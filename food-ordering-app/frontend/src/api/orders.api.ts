import client from './client';
import type { Order, OrderItem } from '../types';

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await client.get('/orders');
  return data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const { data } = await client.get(`/orders/${id}`);
  return data;
};

export const createOrder = async (restaurantId: string, paymentMethodId?: string | null): Promise<Order> => {
  const { data } = await client.post('/orders', { restaurantId, paymentMethodId });
  return data;
};

export const addOrderItem = async (orderId: string, menuItemId: string, quantity: number): Promise<OrderItem> => {
  const { data } = await client.post(`/orders/${orderId}/items`, { menuItemId, quantity });
  return data;
};

export const removeOrderItem = async (orderId: string, itemId: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await client.delete(`/orders/${orderId}/items/${itemId}`);
  return data;
};

export const placeOrder = async (id: string, paymentMethodId?: string): Promise<Order> => {
  const { data } = await client.patch(`/orders/${id}/place`, { paymentMethodId });
  return data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const { data } = await client.patch(`/orders/${id}/cancel`);
  return data;
};
