export type Category = 'All' | 'Nigerian Meals' | 'Fast Foods' | 'Snacks' | 'Drinks';

export interface MenuCustomizationChoice {
  value: string | number;
  label: string;
  price?: number; // additional price for this choice (per unit)
}

export interface MenuCustomizationOption {
  id: string;
  label: string;
  // mode: 'choice' shows a select; 'quantity' shows +/- numeric selector (price applies per unit)
  mode?: 'choice' | 'quantity';
  choices: MenuCustomizationChoice[];
}

export type MenuItemCustomizations = Record<string, string | number>;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
  popular?: boolean;
  customOptions?: MenuCustomizationOption[];
}

export interface CartItem {
  cartId: string;
  item: MenuItem;
  quantity: number;
  customizations?: MenuItemCustomizations;
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

