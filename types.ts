

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // This is the current selling price (discounted price if applicable)
  originalPrice?: number; // Price before discount
  discountPercentage?: number; // Calculated discount percentage for display
  imageUrl: string;
  additionalImageUrls?: string[]; 
  category: string;
  stock: number;
  keywords?: string[];
  likes: number;
  averageRating?: number; 
  reviewCount?: number;   
}

export type NewProductData = Omit<Product, 'id' | 'likes'> & { 
  id?: string; 
  likes?: number; 
  additionalImageUrls?: string[]; 
  averageRating?: number; 
  reviewCount?: number;
  originalPrice?: number; 
  discountPercentage?: number; 
};

export interface CartItem extends Product {
  quantity: number;
}

export interface AdminSection {
  id:string;
  name: string;
  icon?: React.ReactNode;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
}

export type OrderStatus = 
  | "Pending Approval" 
  | "Processing" 
  | "Preparing for Shipment" 
  | "Shipped" 
  | "Delivered";

// New: Interface for status updates in order history
export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: string; // ISO string for when this status was set
  notes?: string; // Optional notes from admin or system
}

export interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  totalPrice: number;
  orderDate: string; // ISO string
  status: OrderStatus;
  statusHistory: OrderStatusUpdate[]; // New: History of status changes
  // Added fields from checkout form
  billingAddress: string;
  stateProvince: string;
  phoneNumber: string;
  neighborhood: string;
}

export interface LikedProductsContextType {
  likedProductIds: string[];
  toggleProductLikeState: (productId: string) => 'liked' | 'unliked';
  isProductLikedByUser: (productId: string) => boolean;
}

// Product Review Interface
export interface ProductReview {
  id: string;
  productId: string;
  reviewerName: string;
  reviewerAvatar?: string; // Optional: URL to an avatar image
  rating: number; // e.g., 1-5 stars
  comment: string;
  date: string; // ISO string
}

// Product Question Interface
export interface ProductQuestion {
  id: string;
  productId: string; // Can be 'general' for homepage Q&A
  userName: string;
  questionText: string;
  dateAsked: string; // ISO string
  answers: ProductAnswer[];
}

// Product Answer Interface
export interface ProductAnswer {
  id: string;
  // questionId: string; // Implicitly linked by being in ProductQuestion.answers array
  responderName: string; // Could be "Admin" or another user
  answerText: string;
  dateAnswered: string; // ISO string
}

// Q&A Context Type Update
export interface QnAContextType {
  questions: ProductQuestion[];
  addQuestion: (productId: string, userName: string, questionText: string) => ProductQuestion;
  addAnswerToQuestion: (questionId: string, responderName: string, answerText: string) => void;
  deleteQuestion: (questionId: string) => void; // Added deleteQuestion method
  updateAnswerText: (questionId: string, answerId: string, newAnswerText: string) => void; // Added updateAnswerText method
}

// Product Context Type Update
export interface ProductContextType {
  products: Product[];
  addProduct: (newProductData: NewProductData) => Product;
  updateProduct: (updatedProduct: Product) => void;
  deleteProduct: (productId: string) => void; // Added deleteProduct method
  incrementProductLike: (productId: string) => void;
  decrementProductLike: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
  // updateProductRating was removed, will be handled by useEffect in App.tsx
}