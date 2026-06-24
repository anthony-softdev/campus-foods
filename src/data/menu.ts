import { MenuItem } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  // --- NIGERIAN MEALS ---
  {
    id: 'nig-jollof',
    name: 'Jollof Rice + Chicken',
    price: 1500,
    category: 'Nigerian Meals',
    description: 'Rich, smoky legendary Nigerian Jollof rice, served with tender grilled or fried chicken and sweet plantain dodo.',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=80',
    popular: true,
    customOptions: [
      {
        id: 'proteinType',
        label: 'Protein Option',
        mode: 'choice',
        choices: [
          { value: 'chicken', label: 'Chicken', price: 0 },
          { value: 'beef', label: 'Beef', price: 250 },
          { value: 'turkey', label: 'Turkey', price: 350 }
        ]
      },
      {
        id: 'proteinAmount',
        label: 'Extra Protein',
        mode: 'quantity',
        choices: [
          { value: 'portion', label: 'Extra Portion', price: 300 }
        ]
      }
      ,
      {
        id: 'side',
        label: 'Side Option',
        mode: 'choice',
        choices: [
          { value: 'plantain', label: 'Plantain', price: 200 },
          { value: 'none', label: 'No Side', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'nig-friedrice',
    name: 'Fried Rice + Plantain',
    price: 1500,
    category: 'Nigerian Meals',
    description: 'Fragrant and colourful fried rice stir-fried with vegetables, served with delicious chicken and fried plantain.',
    image: 'https://images.unsplash.com/photo-1603133872878-6966588aaae0?w=600&auto=format&fit=crop&q=80',
    popular: true,
    customOptions: [
      {
        id: 'proteinType',
        label: 'Protein Option',
        mode: 'choice',
        choices: [
          { value: 'chicken', label: 'Chicken', price: 0 },
          { value: 'beef', label: 'Beef', price: 250 },
          { value: 'turkey', label: 'Turkey', price: 350 }
        ]
      },
      {
        id: 'proteinAmount',
        label: 'Extra Protein',
        mode: 'quantity',
        choices: [
          { value: 'portion', label: 'Extra Portion', price: 300 }
        ]
      }
      ,
      {
        id: 'side',
        label: 'Side Option',
        mode: 'choice',
        choices: [
          { value: 'plantain', label: 'Plantain', price: 200 },
          { value: 'none', label: 'No Side', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'nig-egusi',
    name: 'Egusi Soup + Eba',
    price: 1200,
    category: 'Nigerian Meals',
    description: 'Perfectly seasoned melon seed soup cooked with spinach, palm oil and stock fish, served with smooth yellow/white eba.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-ofeonugbu',
    name: 'Ofe Onugbu (Bitter Leaf) + Fufu',
    price: 1200,
    category: 'Nigerian Meals',
    description: 'Traditional bitter-leaf soup slow-cooked to eliminate bitterness, enhanced with local spices and served with soft fufu.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-afang',
    name: 'Afang Soup + Pounded Yam',
    price: 1400,
    category: 'Nigerian Meals',
    description: 'Nutritious leafy Afang soup packed with rich stock fish, periwinkles and assorted meats, served with stretchy pounded yam.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-eforiro',
    name: 'Efo Riro + White Rice',
    price: 1300,
    category: 'Nigerian Meals',
    description: 'Rich, peppery Yoruba spinach stew mixed with locust beans and shredded meats, served over steaming white rice.',
    image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-beans',
    name: 'Beans + Plantain',
    price: 900,
    category: 'Nigerian Meals',
    description: 'Slow-cooked honey beans (Ewa) in palm oil sauce, perfectly paired with a sweet serving of golden fried plantains.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-ogbono',
    name: 'Ogbono Soup + Semo',
    price: 1200,
    category: 'Nigerian Meals',
    description: 'Aromatic drewy soup made from ground ogbono seeds, cooked with local spices and assorted beef, served with smooth semo.',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-ofada',
    name: 'Ofada Rice + Ayamase',
    price: 1600,
    category: 'Nigerian Meals',
    description: 'Local unpolished Ofada rice served inside leaf wrapping, topped with spicy green bell pepper Ayamase designer stew.',
    image: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-peppersoup',
    name: 'Pepper Soup (Goat Meat)',
    price: 1800,
    category: 'Nigerian Meals',
    description: 'Hot, spicy, aromatic broth packed with medicinal local herbs, peppers, and chunks of tender goat meat (Asun vibes).',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-suya',
    name: 'Suya (Half kg)',
    price: 1500,
    category: 'Nigerian Meals',
    description: 'Perfectly skewered and charcoal-roasted beef strips rubbed with spicy peanut burger-flavored Yaji spice, raw onions and cabbage.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: 'nig-grilledchicken',
    name: 'Grilled Chicken',
    price: 2000,
    category: 'Nigerian Meals',
    description: 'Large flame-grilled quarter chicken marinated in local peppers and spicy seasoning.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'nig-nkwobi',
    name: 'Nkwobi',
    price: 1800,
    category: 'Nigerian Meals',
    description: 'Traditional Igbo delicacy of spicy cow foot cooked and tossed in rich, palm oil-infused edible potash sauce with utazi leaves.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
  },

  // --- FAST FOODS ---
  {
    id: 'ff-shawarmachicken',
    name: 'Shawarma (Chicken)',
    price: 1800,
    category: 'Fast Foods',
    description: 'Double wrapped, fully stuffed grilled chicken shawarma loaded with cream, hot pepper, cabbage, and sausage option.',
    image: 'https://images.unsplash.com/photo-1561651823-34fed022540e?w=600&auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: 'ff-shawarmabeef',
    name: 'Shawarma (Beef)',
    price: 2000,
    category: 'Fast Foods',
    description: 'Seasoned grilled beef strips rolled inside soft flatbread with creamy mayonnaise, mustard, ketchup and crisp veggie crunch.',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ff-burgerchicken',
    name: 'Burger (Chicken)',
    price: 1500,
    category: 'Fast Foods',
    description: 'Crispy fried chicken breast fillet inside toasted brioche bun with lettuce, thick pickles, and secret house sauce.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ff-burgerbeef',
    name: 'Burger (Beef)',
    price: 1700,
    category: 'Fast Foods',
    description: 'Smashed Nigerian beef patty grilled with cheese, fresh tomatoes, caramelised white onions and signature burger relish.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ff-friedchicken',
    name: 'Fried Chicken (2 pieces)',
    price: 1500,
    category: 'Fast Foods',
    description: 'Golden, crispy-coated deep-fried chicken leg and thigh piece, heavily spiced the local way.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ff-indomie',
    name: 'Indomie Special (Egg + Veg)',
    price: 800,
    category: 'Fast Foods',
    description: 'The national food of Nigerian students: instant noodles stir-fried with carrots, green beans, onions and fried/boiled egg.',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80',
    popular: true,
    customOptions: [
      {
        id: 'eggType',
        label: 'Egg Type',
        mode: 'choice',
        choices: [
          { value: 'fried', label: 'Fried Egg', price: 100 },
          { value: 'boiled', label: 'Boiled Egg', price: 100 },
          { value: 'none', label: 'No Egg', price: 0 }
        ]
      },
      {
        id: 'eggAmount',
        label: 'Egg Amount',
        mode: 'quantity',
        choices: [
          { value: 'egg', label: 'Per Egg', price: 100 }
        ]
      }
    ]
  },
  {
    id: 'ff-gizzard',
    name: 'Peppered Gizzard',
    price: 1200,
    category: 'Fast Foods',
    description: 'Chunky roasted chicken gizzards tossed in a super peppery, spicy thick bell pepper and habanero onion reduction juice.',
    image: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ff-springrolls',
    name: 'Spring Rolls (5 pieces)',
    price: 700,
    category: 'Fast Foods',
    description: 'Paper-thin crunchy pastries filled with shredded seasoned carrots, cabbage and minced beef chunks.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  },

  // --- SNACKS ---
  {
    id: 'sn-puffpuff',
    name: 'Puff Puff (10 pieces)',
    price: 400,
    category: 'Snacks',
    description: 'Sweet, spongy, fluffy deep-fried soft dough balls. A classic Nigerian street delight, freshly made.',
    image: 'https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?w=600&auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: 'sn-chinchin',
    name: 'Chin Chin (bag)',
    price: 300,
    category: 'Snacks',
    description: 'Crisp, crunchy, sweet-milky mini square biscuit snacks - perfect for chewing during lectures.',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn-meatpie',
    name: 'Meat Pie',
    price: 400,
    category: 'Snacks',
    description: 'Shortcrust golden baked pastry filled with rich minced beef, cubed soft potatoes and carrots.',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: 'sn-sausageroll',
    name: 'Sausage Roll',
    price: 300,
    category: 'Snacks',
    description: 'Baked puff pastry roll wrapping a seasoned minced pork/beef sausage link filling.',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn-scotchegg',
    name: 'Scotch Egg',
    price: 350,
    category: 'Snacks',
    description: 'A whole hard-boiled egg wrapped in seasoned sausage meat, coated in breadcrumbs, Fried golden-brown.',
    image: 'https://images.unsplash.com/photo-1536816579748-4fc13f4bfec3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn-buns',
    name: 'Buns (5 pieces)',
    price: 400,
    category: 'Snacks',
    description: 'Sweet, heavily crusty, hard-exterior fried dough spheres with a uniquely soft, dense core.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  },

  // --- DRINKS ---
  {
    id: 'dr-chapman',
    name: 'Chapman (glass)',
    price: 800,
    category: 'Drinks',
    description: 'Famous exotic Nigerian mocktail containing Fanta, Sprite, Angostura bitters, blackcurrant Alaro syrup and cucumber slices.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: 'dr-zobo',
    name: 'Zobo Drink',
    price: 400,
    category: 'Drinks',
    description: 'Deep magenta brewed Roselle (hibiscus calyces) juice sweet-infused with crushed pineapples, ginger and cloves.',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80',
    popular: true
  },
  {
    id: 'dr-kunu',
    name: 'Kunu (cup)',
    price: 300,
    category: 'Drinks',
    description: 'Traditional fermented millet drink spiced with sweet cloves, ginger, and sweet potatoes for a nourishing kick.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-krest',
    name: 'Krest Bitter Lemon',
    price: 400,
    category: 'Drinks',
    description: 'Fizzy carbonated bitter lemon soda, extremely refreshing on a hot afternoon.',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-fanta',
    name: 'Fanta (bottle)',
    price: 350,
    category: 'Drinks',
    description: 'Fanta Orange in a cold glass bottle, bubbly, bright and zesty.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-coke',
    name: 'Coca-Cola (bottle)',
    price: 350,
    category: 'Drinks',
    description: 'Original refreshing cold Coca-Cola flavor in a clean glass/PET bottle.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-sprite',
    name: 'Sprite (bottle)',
    price: 350,
    category: 'Drinks',
    description: 'Crisp, sparkling lemon and lime flavoured carbonated soft drink to quench your thirst.',
    image: 'https://images.unsplash.com/photo-1625772290748-160b216886e5?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-malt',
    name: 'Malt (bottle)',
    price: 450,
    category: 'Drinks',
    description: 'Dark, rich, extremely sweet non-alcoholic classic Nigerian malt drink packing B-vitamins.',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-lacasera',
    name: 'Lacasera',
    price: 400,
    category: 'Drinks',
    description: 'The golden original apple-sweet crisp soda that everyone loves.',
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-watersachet',
    name: 'Water (sachet)',
    price: 100,
    category: 'Drinks',
    description: 'Highly purified cold sachet water (Popularly called pure water) for quick thirst-quenching.',
    image: 'https://images.unsplash.com/photo-1548839130-3fd96cd5bd4d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-waterbottle',
    name: 'Water (bottle)',
    price: 200,
    category: 'Drinks',
    description: 'Premium purified PET bottled water, iced cold.',
    image: 'https://images.unsplash.com/photo-1548839130-3fd96cd5bd4d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'dr-predator',
    name: 'Predator Energy Drink',
    price: 600,
    category: 'Drinks',
    description: 'Powerful carbonated energy drink loaded with caffeine and Taurine to fuel your late-night T-Jack reading prep.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80'
  }
];

export const HOSTELLOCATIONS = {
  male: [
    { value: 'Hall 1', label: 'Hall 1 (Male Hostel)' },
    { value: 'Hall 2', label: 'Hall 2 (Male Hostel)' },
    { value: 'Hall 3', label: 'Hall 3 (Male Hostel)' },
    { value: 'Hall 4', label: 'Hall 4 (Male Hostel)' },
    { value: 'Hall 5', label: 'Hall 5 (Male Hostel)' }
  ],
  female: [
    { value: 'Queens Hall', label: 'Queens Hall (Female Hostel)' },
    { value: 'Moremi Hall', label: 'Moremi Hall (Female Hostel)' },
    { value: 'Amina Hall', label: 'Amina Hall (Female Hostel)' }
  ],
  academic: [
    { value: 'Faculty of Engineering', label: 'Faculty of Engineering' },
    { value: 'Faculty of Sciences', label: 'Faculty of Sciences' },
    { value: 'Faculty of Law', label: 'Faculty of Law' },
    { value: 'Main Library', label: 'Main Library' },
    { value: 'Student Union Building', label: 'Student Union Building (SUB)' }
  ],
  other: [
    { value: 'Sports Complex', label: 'Sports Complex' },
    { value: 'Campus Gate', label: 'Campus Gate' }
  ]
};
