export interface MealOption {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  customizable: boolean;
  options?: MealOption[];
  available?: boolean;
}

export interface User {
  firstname: string;
  lastname: string;
  gender: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'admin';
}

export interface CartItem {
  cartId: string;
  id: string;
  name: string;
  image: string;
  basePrice: number;
  extras: MealOption[];
  extrasKey: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  userEmail: string;
  userName: string;
  phone: string;
  items: CartItem[];
  address: string;
  deliveryType: string;
  ref: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered';
  timestamp: string;
  estimatedMinutes?: number;
}
