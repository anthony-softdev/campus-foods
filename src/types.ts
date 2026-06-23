export type Category = 'All' | 'Nigerian Meals' | 'Fast Foods' | 'Snacks' | 'Drinks';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  popular?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type PaymentMethod = 'card' | 'transfer' | 'delivery';

export interface OrderDetails {
  id: string;
  fullName: string;
  phoneNumber: string;
  deliveryLocation: string;
  roomNumber: string;
  specialInstructions: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered';
  userEmail?: string;
  createdAt: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  deliveryLocation: string;
  roomNumber: string;
  role?: 'admin' | 'student';
}

export type ViewType = 'home' | 'menu' | 'cart' | 'contact' | 'auth' | 'dashboard' | 'admin';

