import client from './client';
import type { Restaurant, MenuItem } from '../types';

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data } = await client.get('/restaurants');
  return data;
};

export const getRestaurant = async (id: string): Promise<Restaurant> => {
  const { data } = await client.get(`/restaurants/${id}`);
  return data;
};

export const getRestaurantMenu = async (id: string): Promise<MenuItem[]> => {
  const { data } = await client.get(`/restaurants/${id}/menu`);
  return data;
};
