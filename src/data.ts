import { MenuItem } from './types';

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'jollof-rice',
    name: 'Jollof Rice',
    description: 'Authentic Nigerian jollof rice with perfectly seasoned long grain parboiled rice.',
    price: 600,
    category: 'Main Dishes',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600',
    customizable: true,
    options: [
      { label: 'Fried Egg', price: 200 },
      { label: 'Plantain Portions', price: 300 },
      { label: 'Fried Chicken Drumstick', price: 800 },
      { label: 'Assorted Meat', price: 600 }
    ]
  },
  {
    id: 'chicken-chips',
    name: 'Chicken and Chips',
    description: 'Crispy deep-fried golden seasoned chicken breast fillet served with lightly salted potato fries.',
    price: 3000,
    category: 'Fast Food/Sides',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=600',
    customizable: false
  },
  {
    id: 'indomie',
    name: 'Indomie Stir-fry Noodles',
    description: 'Delicious instant campus noodles fried in healthy vegetable oil mix with green peas & carrots.',
    price: 500,
    category: 'Fast Food/Sides',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
    customizable: true,
    options: [
      { label: 'Boiled Egg', price: 200 },
      { label: 'Fried Sausage Pieces', price: 400 },
      { label: 'Shredded Chicken breast', price: 600 }
    ]
  },
  {
    id: 'viju-milk',
    name: 'Viju Milk Fruit Drink',
    description: 'Nutritious and highly refreshing viju milk flavor packed sweet beverage.',
    price: 800,
    category: 'Drinks & Desserts',
    image: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&q=80&w=600',
    customizable: false
  },
  {
    id: 'egusi-pounded-yam',
    name: 'Egusi & Pounded Yam',
    description: 'Rich, melon Egusi soup cooked with fresh pumpkin leaves and served with smooth hot pounded yam.',
    price: 2500,
    category: 'Main Dishes',
    image: 'https://images.unsplash.com/photo-1618413156686-2a6288647000?auto=format&fit=crop&q=80&w=600',
    customizable: true,
    options: [
      { label: 'Assorted Meat Piece', price: 600 },
      { label: 'Fresh Catfish Portion', price: 1000 }
    ]
  }
];
