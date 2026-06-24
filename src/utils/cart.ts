import { CartItem } from '../types';

/**
 * Gets the current quantity of a specific item inside the customer's cart.
 */
export const getCartQuantity = (cart: CartItem[], itemId: string): number => {
  // Sum quantities for all cart entries that reference the same base item id
  return cart.reduce((acc, c) => acc + (c.item.id === itemId ? c.quantity : 0), 0);
};
