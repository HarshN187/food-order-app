export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type OrderStatus = 'DRAFT' | 'PLACED' | 'COMPLETED' | 'CANCELLED';

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  countryId: string | null;
  country?: Country | null;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string | null;
  address: string | null;
  countryId: string;
  country?: Country;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant?: Restaurant;
  paymentMethodId: string | null;
  paymentMethod?: PaymentMethod | null;
  status: OrderStatus;
  totalAmount: number;
  countryId: string;
  placedAt: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  provider: string | null;
  lastFour: string | null;
  isDefault: boolean;
  isActive: boolean;
}
