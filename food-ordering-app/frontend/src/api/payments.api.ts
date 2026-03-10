import client from './client';
import type { PaymentMethod } from '../types';

export interface PaymentMethodWithUser extends PaymentMethod {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const getPaymentMethods = async (): Promise<PaymentMethodWithUser[]> => {
  const { data } = await client.get('/payments');
  return data;
};

export const getMyPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data } = await client.get('/payments/my');
  return data;
};

export const createPaymentMethod = async (paymentData: {
  userId: string;
  type: string;
  provider?: string;
  lastFour?: string;
  isDefault?: boolean;
}): Promise<PaymentMethod> => {
  const { data } = await client.post('/payments', paymentData);
  return data;
};

export const updatePaymentMethod = async (id: string, paymentData: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  const { data } = await client.put(`/payments/${id}`, paymentData);
  return data;
};

export const removePaymentMethod = async (id: string): Promise<PaymentMethod> => {
  const { data } = await client.delete(`/payments/${id}`);
  return data;
};
