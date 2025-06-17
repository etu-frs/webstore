import { Product, ProductReview, ProductQuestion, OrderStatus } from './types';

export const APP_NAME = "Techno Mart";

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Cart', path: '/cart' },
  { name: 'Track Order', path: '/track-order' },
  { name: 'Dream Gadget', path: '/dream-gadget' },
  { name: 'Admin Panel', path: '/admin' },
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Smart Toaster X9000',
    description: 'Efficiently toasts bread to perfection. Features multiple browning settings and a digital timer.',
    price: 63.99, // Discounted price
    originalPrice: 79.99, // Original price
    discountPercentage: 20, // (79.99 - 63.99) / 79.99 * 100
    imageUrl: 'https://picsum.photos/seed/toaster/600/600',
    additionalImageUrls: [
      'https://picsum.photos/seed/toasterX/600/600',
      'https://picsum.photos/seed/toasterY/600/600',
      'https://picsum.photos/seed/toasterZ/600/600',
    ],
    category: 'Kitchen Tech',
    stock: 15,
    keywords: ['smart', 'kitchen', 'toaster', 'efficient'],
    likes: 25,
    averageRating: 4.5,
    reviewCount: 2,
  },
  {
    id: '2',
    name: 'Precision Gaming Controller',
    description: 'Ergonomic gaming controller for an immersive experience. Features responsive buttons and analog sticks.',
    price: 49.50,
    imageUrl: 'https://picsum.photos/seed/gamepad/600/600',
    additionalImageUrls: [
      'https://picsum.photos/seed/gamepadX/600/600',
    ],
    category: 'Gaming',
    stock: 22,
    keywords: ['gaming', 'ergonomic', 'responsive', 'controller'],
    likes: 18,
    averageRating: 3.2,
    reviewCount: 1,
  },
  {
    id: '3',
    name: 'Aquatic Ambiance Lamp',
    description: 'Unique fish-themed lamp that provides soft, ambient lighting. Adds a decorative touch to any room.',
    price: 65.00,
    imageUrl: 'https://picsum.photos/seed/fishlamp/600/600',
    category: 'Home Decor',
    stock: 8,
    keywords: ['decorative', 'lighting', 'ambient', 'fish'],
    likes: 30,
    averageRating: 4.0,
    reviewCount: 0,
  },
  {
    id: '4',
    name: 'Advanced Smart Socks',
    description: 'Comfortable smart socks with integrated sensors for activity tracking. Warm and machine washable.',
    price: 35.25,
    imageUrl: 'https://picsum.photos/seed/smartsocks/600/600',
    additionalImageUrls: [
      'https://picsum.photos/seed/smartsocksX/600/600',
      'https://picsum.photos/seed/smartsocksY/600/600',
    ],
    category: 'Apparel',
    stock: 30,
    keywords: ['smart', 'wearable', 'tracking', 'comfortable'],
    likes: 55,
    averageRating: 4.8,
    reviewCount: 1,
  },
  {
    id: '5',
    name: 'Zero-Gravity Recliner',
    description: 'Luxurious recliner offering exceptional comfort and support. Features multiple reclining positions and built-in massager.',
    price: 499.99,
    imageUrl: 'https://picsum.photos/seed/rocketrecliner/600/600',
    additionalImageUrls: [
        'https://picsum.photos/seed/rocketreclinerSide/600/600',
        'https://picsum.photos/seed/rocketreclinerBack/600/600',
        'https://picsum.photos/seed/rocketreclinerControls/600/600',
    ],
    category: 'Furniture',
    stock: 3,
    keywords: ['comfort', 'luxury', 'recliner', 'massage'],
    likes: 102,
    averageRating: 4.2,
    reviewCount: 1,
  },
  {
    id: '6',
    name: 'Interactive Smart Plant',
    description: 'A smart decorative plant with interactive light and movement features. Responds to environmental cues.',
    price: 89.99,
    imageUrl: 'https://picsum.photos/seed/smartplant/600/600',
    category: 'Bio-Tech',
    stock: 12,
    keywords: ['plant', 'smart', 'interactive', 'decor'],
    likes: 76,
    averageRating: 0, 
    reviewCount: 0,
  },
];

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending Approval",
  "Processing",
  "Preparing for Shipment",
  "Shipped",
  "Delivered",
];


export const MOCK_REVIEWS: ProductReview[] = [
  { id: 'rev1', productId: '1', reviewerName: 'Tech Enthusiast', reviewerAvatar: 'https://picsum.photos/seed/tech_avatar/40/40', rating: 5, comment: "This Smart Toaster X9000 is excellent! My toast is perfect every time. Highly recommended!", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rev2', productId: '1', reviewerName: 'Busy Parent', reviewerAvatar: 'https://picsum.photos/seed/parent_avatar/40/40', rating: 4, comment: "It's a bit loud, but the toast comes out great. The digital timer is very useful.", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rev3', productId: '2', reviewerName: 'Pro Gamer', reviewerAvatar: 'https://picsum.photos/seed/gamer_avatar/40/40', rating: 3, comment: "The Precision Gaming Controller is decent for casual play. Build quality could be better for the price.", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rev4', productId: '4', reviewerName: 'Fitness Tracker', reviewerAvatar: 'https://picsum.photos/seed/fitness_avatar/40/40', rating: 5, comment: "The Advanced Smart Socks are surprisingly effective for tracking my daily activity. Very comfortable too.", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rev5', productId: '5', reviewerName: 'Home Comfort Seeker', reviewerAvatar: 'https://picsum.photos/seed/comfort_avatar/40/40', rating: 4, comment: "The Zero-Gravity Recliner is very comfortable. The massage feature is a nice bonus. Good value.", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_QUESTIONS: ProductQuestion[] = [
  { 
    id: 'q1', 
    productId: '1', 
    userName: 'Curious Customer', 
    questionText: "Does the Smart Toaster X9000 have a crumb tray for easy cleaning?", 
    dateAsked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      { id: 'a1', responderName: 'Support Team', answerText: "Yes, the Smart Toaster X9000 includes a removable crumb tray for convenient cleaning.", dateAnswered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  { 
    id: 'q2', 
    productId: '1', 
    userName: 'Techie Tom', 
    questionText: "What material is the casing of the toaster made of?", 
    dateAsked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
       { id: 'a2', responderName: 'Support Team', answerText: "The Smart Toaster X9000 features a durable stainless steel casing for a sleek look and longevity.", dateAnswered: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
   { 
    id: 'q3', 
    productId: 'general', 
    userName: 'New Visitor', 
    questionText: "What is your return policy for electronics?", 
    dateAsked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
       { id: 'a3', responderName: 'Support Team', answerText: "We offer a 30-day return policy for most electronics, provided they are in their original condition and packaging. Please see our full policy for details.", dateAnswered: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  { 
    id: 'q4', 
    productId: '6', 
    userName: 'Plant Lover', 
    questionText: "Does the Interactive Smart Plant require actual sunlight, or is it purely electronic?", 
    dateAsked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [] 
  },
];