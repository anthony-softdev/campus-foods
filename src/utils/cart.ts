import { CartItem } from '../types';

/**
 * Gets the current quantity of a specific item inside the customer's cart.
 */
export const getCartQuantity = (cart: CartItem[], itemId: string): number => {
  const found = cart.find((c) => c.item.id === itemId);
  return found ? found.quantity : 0;
};
