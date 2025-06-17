
import React, { useState, useEffect, createContext, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { CheckoutPage } from './pages/CheckoutPage'; 
import { TrackOrderPage } from './pages/TrackOrderPage'; 
import { DreamGadgetPage } from './pages/DreamGadgetPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { Product, CartItem, NewProductData, Order, OrderStatus, OrderStatusUpdate, LikedProductsContextType, ProductReview, ProductQuestion, ProductAnswer, QnAContextType as IQnAContextType, ProductContextType as IProductContextType } from './types'; // Updated QnAContextType import
import { SAMPLE_PRODUCTS, MOCK_REVIEWS, MOCK_QUESTIONS } from './constants';
import { ToastContainer, toast } from 'react-toastify';
import { ScrollToTop } from './components/ScrollToTop';
import { PageLayout } from './components/PageLayout'; // Import PageLayout

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Product Context
// ProductContextType is now imported and doesn't define updateProductRating
export const ProductContext = createContext<IProductContextType | undefined>(undefined);


// Wishlist Context
interface WishlistContextType {
  wishlist: string[];
  toggleWishlistItem: (productId: string) => void;
  isProductWished: (productId: string) => boolean;
}
export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Cart Context
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Order Context
export interface OrderContextType { // Exporting OrderContextType
  orders: Order[];
  addOrder: (
    customerName: string, 
    items: CartItem[], 
    totalPrice: number,
    billingAddress: string,
    stateProvince: string,
    phoneNumber: string,
    neighborhood: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => void; 
  getOrderById: (orderId: string) => Order | undefined;
}
export const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Liked Products Context
export const LikedProductsContext = createContext<LikedProductsContextType | undefined>(undefined);

// Auth Context
interface AuthContextType {
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Q&A Context
export const QnAContext = createContext<IQnAContextType | undefined>(undefined); // Use IQnAContextType

// Review Context
export interface ReviewContextType { // Exporting ReviewContextType
  reviews: ProductReview[];
  addReview: (productId: string, reviewerName: string, rating: number, comment: string, reviewerAvatar?: string) => ProductReview;
  deleteReview: (reviewId: string) => void;
}
export const ReviewContext = createContext<ReviewContextType | undefined>(undefined);


const App: React.FC = () => {
  // --- Theme State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('gumballTechnoTheme') as 'light' | 'dark';
    if (savedTheme) return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('gumballTechnoTheme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  const themeContextValue: ThemeContextType = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme]);

  // --- Products State ---
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('gumballTechnoProducts');
    return savedProducts ? JSON.parse(savedProducts) : SAMPLE_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('gumballTechnoProducts', JSON.stringify(products));
  }, [products]);

  const addProduct = useCallback((newProductData: NewProductData): Product => {
    const newProductWithIdAndLikes: Product = {
      id: newProductData.id || Date.now().toString(),
      name: newProductData.name,
      description: newProductData.description,
      price: newProductData.price,
      imageUrl: newProductData.imageUrl,
      additionalImageUrls: newProductData.additionalImageUrls || [],
      category: newProductData.category,
      stock: newProductData.stock,
      keywords: newProductData.keywords || [],
      likes: newProductData.likes || 0,
      averageRating: newProductData.averageRating || 0,
      reviewCount: newProductData.reviewCount || 0,
      originalPrice: newProductData.originalPrice, // Ensure this is carried over
      discountPercentage: newProductData.discountPercentage, // Ensure this is carried over
    };
    setProducts((prevProducts) => [newProductWithIdAndLikes, ...prevProducts]);
    return newProductWithIdAndLikes;
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  }, []);

  const incrementProductLike = useCallback((productId: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, likes: p.likes + 1 } : p
      )
    );
  }, []);
  
  const decrementProductLike = useCallback((productId: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, likes: Math.max(0, p.likes - 1) } : p
      )
    );
  }, []);
  
  const getProductById = useCallback((productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  }, [products]);

  // --- Reviews State (needed for product rating calculation) ---
  const [reviewsData, setReviewsData] = useState<ProductReview[]>(() => {
    const saved = localStorage.getItem('gumballTechnoReviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });
  useEffect(() => { localStorage.setItem('gumballTechnoReviews', JSON.stringify(reviewsData)); }, [reviewsData]);

  // State to track product IDs whose ratings need recalculation
  const [productIdsNeedingRatingUpdate, setProductIdsNeedingRatingUpdate] = useState<string[]>([]);

  // useEffect to handle product rating updates reactively
  useEffect(() => {
    if (productIdsNeedingRatingUpdate.length === 0) return;

    setProducts(currentProducts => {
        let productsActuallyChanged = false;
        const updatedProducts = currentProducts.map(p => {
            if (productIdsNeedingRatingUpdate.includes(p.id)) {
                const productSpecificReviews = reviewsData.filter(r => r.productId === p.id);
                const newReviewCount = productSpecificReviews.length;
                let newAverageRating = 0;
                if (newReviewCount > 0) {
                    const totalRatingSum = productSpecificReviews.reduce((sum, review) => sum + review.rating, 0);
                    newAverageRating = totalRatingSum / newReviewCount;
                }
                
                const calculatedAvgRating = parseFloat(newAverageRating.toFixed(1));
                
                // Check if update is actually needed
                if (p.averageRating !== calculatedAvgRating || p.reviewCount !== newReviewCount) {
                    productsActuallyChanged = true;
                    return { 
                        ...p, 
                        averageRating: calculatedAvgRating,
                        reviewCount: newReviewCount 
                    };
                }
            }
            return p;
        });
      
        return productsActuallyChanged ? updatedProducts : currentProducts;
    });

    setProductIdsNeedingRatingUpdate([]); // Reset the queue
  }, [productIdsNeedingRatingUpdate, reviewsData, setProducts]);


  const productContextValue: IProductContextType = useMemo(() => ({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    incrementProductLike,
    decrementProductLike,
    getProductById,
    // updateProductRating is no longer part of the context
  }), [products, addProduct, updateProduct, deleteProduct, incrementProductLike, decrementProductLike, getProductById]);

  // --- Wishlist State ---
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const savedWishlist = localStorage.getItem('gumballTechnoWishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('gumballTechnoWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlistItem = useCallback((productId: string) => {
    setWishlist(prevWishlist =>
      prevWishlist.includes(productId)
        ? prevWishlist.filter(id => id !== productId)
        : [...prevWishlist, productId]
    );
  }, []);

  const isProductWished = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const wishlistContextValue: WishlistContextType = useMemo(() => ({
    wishlist,
    toggleWishlistItem,
    isProductWished,
  }), [wishlist, toggleWishlistItem, isProductWished]);

  // --- Liked Products State ---
  const [likedProductIds, setLikedProductIds] = useState<string[]>(() => {
    const savedLikedProducts = localStorage.getItem('gumballTechnoLikedProducts');
    return savedLikedProducts ? JSON.parse(savedLikedProducts) : [];
  });

  useEffect(() => {
    localStorage.setItem('gumballTechnoLikedProducts', JSON.stringify(likedProductIds));
  }, [likedProductIds]);

  const toggleProductLikeState = useCallback((productId: string): 'liked' | 'unliked' => {
    let newStatus: 'liked' | 'unliked' = 'unliked';
    setLikedProductIds(prevLiked => {
      if (prevLiked.includes(productId)) {
        newStatus = 'unliked';
        return prevLiked.filter(id => id !== productId);
      } else {
        newStatus = 'liked';
        return [...prevLiked, productId];
      }
    });
    return newStatus;
  }, []);

  const isProductLikedByUser = useCallback((productId: string) => {
    return likedProductIds.includes(productId);
  }, [likedProductIds]);

  const likedProductsContextValue: LikedProductsContextType = useMemo(() => ({
    likedProductIds,
    toggleProductLikeState,
    isProductLikedByUser,
  }), [likedProductIds, toggleProductLikeState, isProductLikedByUser]);

  // --- Cart State ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('gumballTechnoCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('gumballTechnoCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((productToAdd: Product, quantity: number = 1) => {
    const productInState = products.find(p => p.id === productToAdd.id);
    if (!productInState) {
        console.error("Product not found in global state for cart addition:", productToAdd.name);
        return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productInState.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productInState.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, productInState.stock) }
            : item
        );
      }
      return [...prevCart, { ...productInState, quantity: Math.min(quantity, productInState.stock) }];
    });
  }, [products]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const productDetails = products.find(p => p.id === productId);
          const stock = productDetails ? productDetails.stock : Infinity;
          return { ...item, quantity: Math.max(0, Math.min(quantity, stock)) };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  }, [products]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const cartContextValue: CartContextType = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice]);

  // --- Orders State ---
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('gumballTechnoOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => {
    localStorage.setItem('gumballTechnoOrders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((
    customerName: string, 
    items: CartItem[], 
    totalPrice: number,
    billingAddress: string,
    stateProvince: string,
    phoneNumber: string,
    neighborhood: string
  ): Order => {
    const initialStatus: OrderStatus = "Pending Approval";
    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerName: customerName || "Valued Customer",
      items,
      totalPrice,
      orderDate: new Date().toISOString(),
      status: initialStatus,
      statusHistory: [{ status: initialStatus, timestamp: new Date().toISOString(), notes: "Order created." }],
      billingAddress,
      stateProvince,
      phoneNumber,
      neighborhood,
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart();
    return newOrder;
  }, [clearCart]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, adminNotes?: string) => {
    setOrders(prevOrders => 
      prevOrders.map(o => {
        if (o.id === orderId) {
          const newStatusUpdate: OrderStatusUpdate = {
            status,
            timestamp: new Date().toISOString(),
            notes: adminNotes || `Status changed to ${status} by Admin.`
          };
          const existingHistory = Array.isArray(o.statusHistory) ? o.statusHistory : [];
          return { ...o, status, statusHistory: [...existingHistory, newStatusUpdate] };
        }
        return o;
      })
    );
  }, []);
  
  const getOrderById = useCallback((orderId: string) => {
    return orders.find(o => o.id === orderId);
  }, [orders]);

  const orderContextValue: OrderContextType = useMemo(() => ({
    orders,
    addOrder,
    updateOrderStatus,
    getOrderById,
  }), [orders, addOrder, updateOrderStatus, getOrderById]);
  
  // --- Auth State ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gumballAdminAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('gumballAdminAuthenticated', isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  const loginAdmin = useCallback((password: string): boolean => {
    if (password === 'firasadmin') { // Changed admin password
      setIsAdminAuthenticated(true);
      return true;
    }
    setIsAdminAuthenticated(false);
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
  }, []);

  const authContextValue: AuthContextType = useMemo(() => ({
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
  }), [isAdminAuthenticated, loginAdmin, logoutAdmin]);

  // --- Q&A State ---
  const [questionsData, setQuestionsData] = useState<ProductQuestion[]>(() => {
    const saved = localStorage.getItem('gumballTechnoQnA');
    return saved ? JSON.parse(saved) : MOCK_QUESTIONS;
  });
  useEffect(() => { localStorage.setItem('gumballTechnoQnA', JSON.stringify(questionsData)); }, [questionsData]);

  const addQuestion = useCallback((productId: string, userName: string, questionText: string): ProductQuestion => {
    const newQ: ProductQuestion = {
      id: `q-${Date.now()}`,
      productId,
      userName: userName || "Anonymous User",
      questionText,
      dateAsked: new Date().toISOString(),
      answers: [],
    };
    setQuestionsData(prev => [newQ, ...prev]);
    return newQ;
  }, []);

  const addAnswerToQuestion = useCallback((questionId: string, responderName: string, answerText: string) => {
    setQuestionsData(prevQs => prevQs.map(q => {
      if (q.id === questionId) {
        const newAns: ProductAnswer = {
          id: `ans-${Date.now()}`,
          responderName,
          answerText,
          dateAnswered: new Date().toISOString(),
        };
        return { ...q, answers: [...q.answers, newAns] };
      }
      return q;
    }));
  }, []);

  const updateAnswerText = useCallback((questionId: string, answerId: string, newAnswerText: string) => {
    setQuestionsData(prevQs => {
      const questionIndex = prevQs.findIndex(q => q.id === questionId);
      if (questionIndex === -1) {
        toast.error("Question not found for updating answer.");
        return prevQs;
      }

      const questionToUpdate = prevQs[questionIndex];
      const answerIndex = questionToUpdate.answers.findIndex(ans => ans.id === answerId);

      if (answerIndex === -1) {
        toast.error("Answer not found within the question.");
        return prevQs;
      }

      const updatedAnswers = [...questionToUpdate.answers];
      updatedAnswers[answerIndex] = {
        ...updatedAnswers[answerIndex],
        answerText: newAnswerText,
        dateAnswered: new Date().toISOString(),
      };

      const updatedQuestion = { ...questionToUpdate, answers: updatedAnswers };
      const newQuestionsData = [...prevQs];
      newQuestionsData[questionIndex] = updatedQuestion;
      
      toast.success("Answer updated successfully!");
      return newQuestionsData;
    });
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    const questionToDelete = questionsData.find(q => q.id === questionId);
    if (questionToDelete) {
      setQuestionsData(prevQs => prevQs.filter(q => q.id !== questionId));
      toast.info(`Question by "${questionToDelete.userName}" and its answers have been deleted.`);
    } else {
      toast.warn("Could not find the question to delete.");
    }
  }, [questionsData]);


  const qnaContextValue: IQnAContextType = useMemo(() => ({
    questions: questionsData,
    addQuestion,
    addAnswerToQuestion,
    updateAnswerText,
    deleteQuestion,
  }), [questionsData, addQuestion, addAnswerToQuestion, updateAnswerText, deleteQuestion]);


  // Updated Review Context functions
  const addReview = useCallback((productId: string, reviewerName: string, rating: number, comment: string, reviewerAvatar?: string): ProductReview => {
    const newR: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      reviewerName: reviewerName || "Valued Customer", // More generic default
      rating,
      comment,
      reviewerAvatar: reviewerAvatar || `https://picsum.photos/seed/${Date.now()}/40/40`,
      date: new Date().toISOString(),
    };
    setReviewsData(prev => [newR, ...prev]);
    // Trigger rating update by adding product ID to the queue
    setProductIdsNeedingRatingUpdate(ids => [...new Set([...ids, productId])]);
    return newR;
  }, []); 

  const deleteReview = useCallback((reviewId: string) => {
    const reviewToDelete = reviewsData.find(r => r.id === reviewId);
    if (reviewToDelete) {
        setReviewsData(prev => prev.filter(r => r.id !== reviewId));
        // Trigger rating update by adding product ID to the queue
        setProductIdsNeedingRatingUpdate(ids => [...new Set([...ids, reviewToDelete.productId])]);
        toast.info(`Review by ${reviewToDelete.reviewerName} removed successfully.`); // Neutral tone
    } else {
        toast.warn("Could not find the review to delete.");
    }
  }, [reviewsData]); 

  const reviewContextValue: ReviewContextType = useMemo(() => ({
    reviews: reviewsData,
    addReview,
    deleteReview,
  }), [reviewsData, addReview, deleteReview]);
  

  return (
    <ThemeContext.Provider value={themeContextValue}>
     <AuthContext.Provider value={authContextValue}>
      <ProductContext.Provider value={productContextValue}>
        <WishlistContext.Provider value={wishlistContextValue}>
          <LikedProductsContext.Provider value={likedProductsContextValue}>
            <CartContext.Provider value={cartContextValue}>
              <OrderContext.Provider value={orderContextValue}>
                <QnAContext.Provider value={qnaContextValue}>
                  <ReviewContext.Provider value={reviewContextValue}>
                    <HashRouter>
                      <ScrollToTop />
                      <div className="flex flex-col min-h-screen bg-gumball-light-bg dark:bg-gumball-dark-deep transition-colors duration-300">
                        <Navbar />
                          <Routes>
                            <Route path="/" element={<PageLayout><HomePage /></PageLayout>} />
                            <Route path="/product/:productId" element={<PageLayout><ProductDetailPage /></PageLayout>} />
                            <Route path="/cart" element={<PageLayout><CartPage /></PageLayout>} />
                            <Route path="/checkout" element={<PageLayout><CheckoutPage /></PageLayout>} /> 
                            <Route path="/track-order/" element={<PageLayout><TrackOrderPage /></PageLayout>} />
                            <Route path="/track-order/:orderId" element={<PageLayout><TrackOrderPage /></PageLayout>} />
                            <Route path="/dream-gadget" element={<PageLayout><DreamGadgetPage /></PageLayout>} />
                            <Route 
                              path="/admin" 
                              element={
                                authContextValue.isAdminAuthenticated ? (
                                  <PageLayout useContainer={false}><AdminPanelPage /></PageLayout>
                                ) : (
                                  <Navigate to="/login" replace />
                                )
                              } 
                            />
                            <Route path="/login" element={<PageLayout useContainer={false}><LoginPage /></PageLayout>} />
                            <Route path="*" element={<PageLayout><HomePage /></PageLayout>} /> {/* Fallback to HomePage */}
                          </Routes>
                        <Footer />
                        <ToastContainer
                          position="top-right"
                          autoClose={3500}
                          hideProgressBar={false}
                          newestOnTop
                          closeOnClick
                          rtl={false}
                          pauseOnFocusLoss
                          draggable
                          draggablePercent={30} // Make toasts easier to swipe away
                          pauseOnHover
                          theme="colored"
                        />
                      </div>
                    </HashRouter>
                  </ReviewContext.Provider>
                </QnAContext.Provider>
              </OrderContext.Provider>
            </CartContext.Provider>
          </LikedProductsContext.Provider>
        </WishlistContext.Provider>
      </ProductContext.Provider>
     </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
