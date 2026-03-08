import client from './client';
import type { User } from '../types';

export const login = async (email: string, password: string): Promise<{ access_token: string, user: User }> => {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
};

export const getProfile = async (): Promise<User> => {
  const { data } = await client.get('/users/me');
  return data;
};
