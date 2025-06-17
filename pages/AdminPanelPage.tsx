

import React, { useState, useEffect, useCallback, useContext, ChangeEvent, useRef, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { Product, AdminSection, GroundingChunk, NewProductData, Order, OrderStatus, OrderStatusUpdate, ProductQuestion, ProductReview, ProductAnswer, Candidate, ProductContextType as IProductContextType, QnAContextType as IQnAContextType } from '../types'; 
import { OrderContextType, ReviewContextType } from '../App'; // Updated import paths
import { Button } from '../components/Button';
import { generateProductDescription, searchRecentEvents } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductContext, OrderContext, QnAContext, ReviewContext } from '../App';
import { toast } from 'react-toastify';
import { StarRating } from '../components/StarRating';
import { ORDER_STATUSES, SAMPLE_PRODUCTS } from '../constants';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Modal } from '../components/Modal';

// --- Icons ---
const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
const ProductsIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z" /></svg>;
const OrdersIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const QnAIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.537V17.5c0 .621-.504 1.125-1.125 1.125H9.75c-.621 0-1.125-.504-1.125-1.125V15M3 16.5V17.5c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125V16.5m-3.375 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H6.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-3.375 0h1.5Q6.375 16.5 6.75 16.125m-3.375 0c.375.375.875.375 1.125.375m0 0c.25 0 .5-.125.5-.375M3 12h18M3 12c0-1.136.847-2.1 1.98-2.193l3.722-.537V6.5c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v3.286c0 .97.616 1.813 1.5 2.097M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm4.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm4.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
const ReviewsIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
const AISparklesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188l-1.25-2.188L13.563 11l2.188-1.25L17 7.563l1.25 2.188L20.438 11l-2.188 1.25zM12 1.25L10.813 3.563 8.562 4.812 10.813 6.062 12 8.25l1.188-2.188L15.438 4.812 13.188 3.563 12 1.25z" /></svg>;
const ReportsIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zM19.5 14.25v2.625a3.375 3.375 0 01-3.375 3.375H8.25m11.25-6.375v2.625a3.375 3.375 0 01-3.375 3.375H8.25M15 14.25H8.25M15 11.25H8.25M15 8.25H8.25" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const HamburgerIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>);
const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const ADMIN_SECTIONS: AdminSection[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'products', name: 'Manage Products', icon: <ProductsIcon /> },
  { id: 'orders', name: 'View Orders', icon: <OrdersIcon /> },
  { id: 'qna', name: 'Manage Q&A', icon: <QnAIcon /> },
  { id: 'reviews', name: 'Manage Reviews', icon: <ReviewsIcon /> },
  { id: 'reports', name: 'Monthly Reports', icon: <ReportsIcon /> },
];

const inputBaseClass = "block w-full px-3 py-2 text-sm sm:text-base bg-white dark:bg-gumball-dark border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gumball-pink focus:border-gumball-pink placeholder-gray-400 dark:placeholder-gray-500 text-gumball-dark dark:text-gumball-light-bg";
const labelBaseClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";


export const AdminPanelPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const productCtx = useContext(ProductContext);
  const orderCtx = useContext(OrderContext);
  const qnaCtx = useContext(QnAContext);
  const reviewCtx = useContext(ReviewContext);

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.matchMedia('(min-width: 768px)').matches);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
     return localStorage.getItem('adminSidebarCollapsed') === 'true';
  });

  const [modalConfig, setModalConfig] = useState<{
      isOpen: boolean;
      title?: string;
      message?: React.ReactNode;
      onConfirmAction?: () => void;
      confirmText?: string;
      confirmVariant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  }>({ isOpen: false });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  const [editingAnswer, setEditingAnswer] = useState<{ questionId: string; answer: ProductAnswer } | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);


  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handler = () => setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', String(isDesktopSidebarCollapsed));
  }, [isDesktopSidebarCollapsed]);
  
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const newActiveSectionCandidate = ADMIN_SECTIONS.find(s => s.id === hash) ? hash : 'dashboard';

    if (newActiveSectionCandidate !== activeSection) {
        setActiveSection(newActiveSectionCandidate);
    }
    // Ensure URL hash reflects 'dashboard' if no valid hash is present and section is dashboard
    // This is useful for initial load or if hash is manually cleared.
    if (!hash && newActiveSectionCandidate === 'dashboard' && location.hash !== '#dashboard') {
        navigate('#dashboard', { replace: true });
    }
  }, [location.hash, navigate, activeSection]);

  const handleSelectSection = (sectionId: string) => {
    navigate(`#${sectionId}`); // Only navigate, useEffect will handle setActiveSection
    if (!isDesktop) {
      setIsMobileSidebarOpen(false);
    }
  };

  const toggleDesktopCollapse = () => setIsDesktopSidebarCollapsed(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

  // --- Product Management ---
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = productCtx?.products.find(p => p.id === productId);
    setModalConfig({
      isOpen: true,
      title: "Confirm Delete Product",
      message: <>Are you sure you want to delete product: <strong className="font-semibold">{productToDelete?.name || 'this product'}</strong>? This cannot be undone.</>,
      onConfirmAction: () => {
        productCtx?.deleteProduct(productId);
        toast.success(`Product "${productToDelete?.name || 'ID: '+productId}" deleted.`);
      },
      confirmText: "Delete Product",
      confirmVariant: "danger",
    });
  };

  // --- Order Management ---
    const handleViewOrder = (order: Order) => {
        setViewingOrder(order);
        setShowOrderModal(true);
    };
    
    const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
        orderCtx?.updateOrderStatus(orderId, newStatus, `Status updated by Admin via panel.`);
        toast.success(`Order ${orderId} status updated to ${newStatus}.`);
        if(viewingOrder?.id === orderId) {
            setViewingOrder(prev => prev ? {...prev, status: newStatus, statusHistory: [...prev.statusHistory, {status: newStatus, timestamp: new Date().toISOString(), notes: "Status updated by Admin."}]} : null);
        }
    };

  // --- Q&A Management ---
  const handleEditAnswer = (questionId: string, answer: ProductAnswer) => {
    setEditingAnswer({ questionId, answer });
    setShowAnswerModal(true);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    const questionToDelete = qnaCtx?.questions.find(q => q.id === questionId);
    setModalConfig({
        isOpen: true,
        title: "Confirm Delete Question",
        message: <>Are you sure you want to delete the question by <strong className="font-semibold">{questionToDelete?.userName || 'this user'}</strong> ("{questionToDelete?.questionText.substring(0,50)}...") and all its answers?</>,
        onConfirmAction: () => {
            qnaCtx?.deleteQuestion(questionId);
            toast.success(`Question by "${questionToDelete?.userName}" deleted.`);
        },
        confirmText: "Delete Question",
        confirmVariant: "danger",
    });
  };

  // --- Review Management ---
  const handleDeleteReview = (reviewId: string) => {
    const reviewToDelete = reviewCtx?.reviews.find(r => r.id === reviewId);
    setModalConfig({
        isOpen: true,
        title: "Confirm Delete Review",
        message: <>Are you sure you want to delete the review by <strong className="font-semibold">{reviewToDelete?.reviewerName || 'this user'}</strong> for product ID {reviewToDelete?.productId}?</>,
        onConfirmAction: () => {
            reviewCtx?.deleteReview(reviewId);
            toast.success(`Review by "${reviewToDelete?.reviewerName}" deleted.`);
        },
        confirmText: "Delete Review",
        confirmVariant: "danger",
    });
  };
  

  const renderActiveSection = () => {
    if (!productCtx || !orderCtx || !qnaCtx || !reviewCtx) {
      return <LoadingSpinner message="Loading admin data..." />;
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardPane />;
      case 'products':
        return <ManageProductsPane 
                    products={productCtx.products} 
                    onEdit={handleEditProduct} 
                    onDelete={handleDeleteProduct}
                    onAdd={() => { setEditingProduct(null); setShowProductModal(true);}} 
                />;
      case 'orders':
        return <ManageOrdersPane 
                    orders={orderCtx.orders} 
                    onViewDetails={handleViewOrder}
                    onUpdateStatus={handleUpdateOrderStatus}
                />;
      case 'qna':
        return <ManageQnAPane 
                    questions={qnaCtx.questions} 
                    onEditAnswer={handleEditAnswer}
                    onDeleteQuestion={handleDeleteQuestion}
                    addAnswerToQuestion={qnaCtx.addAnswerToQuestion}
                />;
      case 'reviews':
        return <ManageReviewsPane 
                    reviews={reviewCtx.reviews} 
                    getProductById={productCtx.getProductById}
                    onDelete={handleDeleteReview}
                />;
      case 'reports':
        return <ManageReportsPane 
                    productCtx={productCtx}
                    orderCtx={orderCtx}
                    qnaCtx={qnaCtx}
                    reviewCtx={reviewCtx}
                />;
      default:
        return <div className="text-center p-10 text-xl font-display text-gumball-purple">Select a section from the admin menu.</div>;
    }
  };

  return (
    <div className="md:flex bg-gumball-light-bg dark:bg-gumball-dark-deep"> {/* Removed h-[calc(100vh-5rem)] */}
      <AdminSidebar
        sections={ADMIN_SECTIONS}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        isMobileOpen={isMobileSidebarOpen}
        isDesktop={isDesktop}
        isDesktopCollapsed={isDesktopSidebarCollapsed}
        onToggleDesktopCollapse={toggleDesktopCollapse}
      />
      
      {isMobileSidebarOpen && !isDesktop && (
        <div 
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={toggleMobileSidebar}
            aria-hidden="true"
        ></div>
      )}

      <main className="flex-1 flex flex-col overflow-auto min-h-[calc(100vh-5rem)]"> {/* Added min-h to main content area to ensure it pushes footer */}
        <header className="p-4 bg-white dark:bg-gumball-dark-card shadow-md sticky top-0 z-20 flex items-center">
          {!isDesktop && (
            <Button variant="ghost" onClick={toggleMobileSidebar} className="mr-3 p-2 text-gumball-blue dark:text-gumball-light-bg" aria-label="Open sidebar">
              <HamburgerIcon className="w-6 h-6" />
            </Button>
          )}
          <h1 className="text-2xl font-display text-gumball-pink dark:text-gumball-pink/90">
            {ADMIN_SECTIONS.find(s => s.id === activeSection)?.name || 'Admin Panel'}
          </h1>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 flex-1"> {/* flex-1 for content to take available space */}
          {renderActiveSection()}
        </div>
      </main>

      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        product={editingProduct}
        productCtx={productCtx}
      />
      
      <AnswerFormModal
        isOpen={showAnswerModal}
        onClose={() => { setShowAnswerModal(false); setEditingAnswer(null); }}
        editingAnswerData={editingAnswer}
        qnaCtx={qnaCtx}
      />

      <OrderDetailsModal
          isOpen={showOrderModal}
          onClose={() => { setShowOrderModal(false); setViewingOrder(null);}}
          order={viewingOrder}
          onUpdateStatus={handleUpdateOrderStatus}
      />

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title || "Confirm Action"}
        message={modalConfig.message || "Are you sure?"}
        onConfirm={() => {
            if (modalConfig.onConfirmAction) modalConfig.onConfirmAction();
            setModalConfig({ isOpen: false });
        }}
        onCancel={() => setModalConfig({ isOpen: false })}
        confirmButtonText={modalConfig.confirmText}
        confirmButtonVariant={modalConfig.confirmVariant}
      />
    </div>
  );
};


// --- Dashboard Pane ---
const DashboardPane: React.FC = () => {
  const productCtx = useContext(ProductContext);
  const orderCtx = useContext(OrderContext);
  const qnaCtx = useContext(QnAContext);
  const reviewCtx = useContext(ReviewContext);
  
  const [newsQuery, setNewsQuery] = useState('');
  const [newsResults, setNewsResults] = useState<{text: string; sources?: GroundingChunk[] } | null>(null);
  const [isSearchingNews, setIsSearchingNews] = useState(false);

  const handleSearchNews = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsQuery.trim()) {
      toast.warn("Please enter a topic to search for news.");
      return;
    }
    setIsSearchingNews(true);
    setNewsResults(null);
    try {
      const results = await searchRecentEvents(newsQuery);
      setNewsResults(results);
      if(!results.text && (!results.sources || results.sources.length === 0)) {
        toast.info("No specific news found for that query, or the AI is pondering quietly.");
      }
    } catch (error) {
      toast.error("Failed to fetch news. Please try again later.");
      console.error(error);
    } finally {
      setIsSearchingNews(false);
    }
  };


  const stats = [
    { title: 'Total Products', value: productCtx?.products.length || 0, icon: <ProductsIcon className="w-8 h-8"/>, color: 'text-gumball-blue' },
    { title: 'Total Orders', value: orderCtx?.orders.length || 0, icon: <OrdersIcon className="w-8 h-8"/>, color: 'text-gumball-green' },
    { title: 'Pending Questions', value: qnaCtx?.questions.filter(q => q.answers.length === 0).length || 0, icon: <QnAIcon className="w-8 h-8"/>, color: 'text-gumball-yellow' },
    { title: 'Total Reviews', value: reviewCtx?.reviews.length || 0, icon: <ReviewsIcon className="w-8 h-8"/>, color: 'text-gumball-pink' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.title} className={`bg-white dark:bg-gumball-dark-card p-6 rounded-xl shadow-lg flex items-center space-x-4 border-l-4 ${stat.color.replace('text-', 'border-')}`}>
            <div className={`p-3 rounded-full bg-opacity-20 ${stat.color.replace('text-', 'bg-')} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-bold font-techno text-gumball-dark dark:text-gumball-light-bg">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gumball-dark-card p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-display text-gumball-purple dark:text-gumball-purple/90 mb-4 flex items-center">
            <AISparklesIcon className="w-6 h-6 mr-2 text-gumball-yellow" />
            Latest News (via AI Search)
          </h3>
          <form onSubmit={handleSearchNews} className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newsQuery}
                onChange={(e) => setNewsQuery(e.target.value)}
                placeholder="Search current events, tech news..."
                className={inputBaseClass + " flex-grow"}
            />
            <Button type="submit" variant="primary" isLoading={isSearchingNews}>Search</Button>
          </form>
          {isSearchingNews && <LoadingSpinner message="AI is searching for relevant news..." />}
          {newsResults && (
            <div className="mt-4 p-4 bg-gumball-light-bg dark:bg-gumball-dark rounded-md max-h-96 overflow-y-auto">
              <p className="text-gumball-dark dark:text-gumball-light-bg whitespace-pre-wrap">{newsResults.text || "No specific text found from AI, but check sources if available."}</p>
              {newsResults.sources && newsResults.sources.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-sm text-gumball-blue dark:text-gumball-blue/80 mb-1">Sources:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {newsResults.sources.map((source, idx) => (
                      source.web && <li key={idx} className="text-xs">
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-gumball-pink hover:underline dark:text-gumball-pink/80">
                          {source.web.title || source.web.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};


// --- Manage Products Pane ---
interface ManageProductsPaneProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAdd: () => void;
}
const ManageProductsPane: React.FC<ManageProductsPaneProps> = ({ products, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input 
          type="text" 
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={inputBaseClass + " sm:max-w-xs w-full"}
        />
        <Button onClick={onAdd} variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>Add New Product</Button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gumball-dark-card shadow-lg rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gumball-dark">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Likes</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gumball-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gumball-dark transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <img 
                    src={product.imageUrl || 'https://picsum.photos/seed/placeholder/50/50'} 
                    alt={product.name} 
                    className="w-12 h-12 object-cover rounded-md shadow-sm"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/placeholder_err/50/50')}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gumball-dark dark:text-gumball-light-bg">{product.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gumball-dark dark:text-gumball-light-bg">
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <>
                      <span className="line-through text-gray-400 dark:text-gray-500">${product.originalPrice.toFixed(2)}</span>
                      <br />
                      <span className="text-red-500 font-semibold">${product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-gumball-green">${product.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.stock}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.likes}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button onClick={() => onEdit(product)} variant="ghost" size="sm" className="text-gumball-blue hover:text-gumball-pink p-1"><EditIcon className="w-5 h-5"/></Button>
                  <Button onClick={() => onDelete(product.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></Button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- Product Form Modal ---
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  productCtx: IProductContextType | undefined;
}

const initialModalFormData: NewProductData = {
  name: '', 
  description: '', 
  price: 0, 
  originalPrice: undefined, 
  discountPercentage: undefined, 
  imageUrl: '', 
  category: '', 
  stock: 0, 
  keywords: [], 
  additionalImageUrls: [],
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const isBase64DataUrl = (value: any): value is string => {
    return typeof value === 'string' && value.startsWith('data:image');
};


const getInitialModalFormData = (p: Product | null): NewProductData => {
  if (p) {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      discountPercentage: p.discountPercentage,
      imageUrl: p.imageUrl, // This can be a URL or Base64
      category: p.category,
      stock: p.stock,
      keywords: Array.isArray(p.keywords) ? p.keywords : [],
      additionalImageUrls: Array.isArray(p.additionalImageUrls) ? p.additionalImageUrls : [], // Array of URLs or Base64
      likes: p.likes,
      averageRating: p.averageRating,
      reviewCount: p.reviewCount,
    };
  }
  return { ...initialModalFormData };
};


const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, product, productCtx }) => {
  const [formData, setFormData] = useState<NewProductData>(getInitialModalFormData(product));
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState<string[]>([]);
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (isOpen) { 
        const initialData = getInitialModalFormData(product);
        setFormData(initialData);
        // Set previews from initial data
        if (initialData.imageUrl) {
            setMainImagePreview(initialData.imageUrl); // Works for both URL and Base64
        } else {
            setMainImagePreview(null);
        }
        if (initialData.additionalImageUrls && initialData.additionalImageUrls.length > 0) {
            setAdditionalImagesPreview(initialData.additionalImageUrls); // Works for both URL and Base64
        } else {
            setAdditionalImagesPreview([]);
        }

    } else { // Reset previews when modal closes
        setMainImagePreview(null);
        setAdditionalImagesPreview([]);
    }
  }, [product, isOpen]);

  useEffect(() => {
    const op = formData.originalPrice;
    const sp = formData.price;

    if (op && typeof op === 'number' && op > 0 && typeof sp === 'number' && sp > 0 && op > sp) {
        const calculatedDiscount = ((op - sp) / op) * 100;
        setFormData(prev => ({ ...prev, discountPercentage: parseFloat(calculatedDiscount.toFixed(1)) }));
    } else {
        setFormData(prev => ({ ...prev, discountPercentage: undefined }));
    }
  }, [formData.originalPrice, formData.price]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | string[] | undefined = value;
  
    if (name === 'originalPrice' || name === 'price' || name === 'stock') {
      processedValue = value === '' ? undefined : parseFloat(value);
      if (name !== 'originalPrice' && isNaN(processedValue as number)) {
         processedValue = 0; 
      }
      if (name === 'originalPrice' && value === '') { 
        processedValue = undefined;
      }
    } else if (name === 'keywords') { // Keywords are still comma-separated strings
      processedValue = (value as string).split(',').map(s => s.trim()).filter(s => s);
    }
  
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleMainImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        setMainImagePreview(dataUrl);
      } catch (error) {
        toast.error("Failed to load main image preview.");
        console.error("Error converting main image to Base64:", error);
      }
    }
  };

  const handleAdditionalImagesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        // Append new files to existing ones if formData.additionalImageUrls already has some
        // This allows adding more images without losing previous selections in the same modal session
        const newFileUrls = await Promise.all(Array.from(files).map(file => fileToDataUrl(file)));
        
        setFormData(prev => {
            const existingUrls = Array.isArray(prev.additionalImageUrls) ? prev.additionalImageUrls : [];
            return { ...prev, additionalImageUrls: [...existingUrls, ...newFileUrls] };
        });
        setAdditionalImagesPreview(prev => [...prev, ...newFileUrls]);

      } catch (error) {
        toast.error("Failed to load some additional image previews.");
        console.error("Error converting additional images to Base64:", error);
      }
    }
  };
  
  const handleDeleteAdditionalImage = (indexToDelete: number) => {
    setFormData(prev => ({
        ...prev,
        additionalImageUrls: prev.additionalImageUrls?.filter((_, i) => i !== indexToDelete) || []
    }));
    setAdditionalImagesPreview(prev => prev.filter((_, i) => i !== indexToDelete));
    
    // Clear the file input to allow re-selection of the same files if needed,
    // and to prevent issues if a file from the *current* selection batch was removed.
    if (additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = "";
    }
    toast.info("Image removed from selection.");
  };


  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.warn("Please enter a product name first to generate a description.");
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const currentKeywords = formData.keywords || []; 
      const desc = await generateProductDescription(formData.name, currentKeywords);
      setFormData(prev => ({ ...prev, description: desc }));
      toast.success("AI description generated!");
    } catch (error) {
      toast.error("Failed to generate AI description.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((formData.price < 0 && formData.price !== undefined) || (formData.stock < 0 && formData.stock !== undefined) || (formData.originalPrice !== undefined && formData.originalPrice < 0)) {
        toast.error("Prices and stock cannot be negative.");
        return;
    }
    if (formData.originalPrice && formData.price > formData.originalPrice) {
      toast.warn("Selling price cannot be greater than original price if original price is set. Adjust prices or remove original price to clear discount.");
      return;
    }
    if (!formData.imageUrl) { // Check if main image URL (now potentially Base64) is present
        toast.error("Please provide a main image for the product.");
        return;
    }

    const dataToSave: NewProductData = {
      ...formData,
      keywords: Array.isArray(formData.keywords) ? formData.keywords : [],
      // imageUrl and additionalImageUrls are already Base64 strings or original URLs if not changed
      discountPercentage: (formData.originalPrice && formData.price && formData.originalPrice > formData.price) 
                          ? parseFloat((((formData.originalPrice - formData.price) / formData.originalPrice) * 100).toFixed(1)) 
                          : undefined,
      originalPrice: formData.originalPrice === 0 ? undefined : formData.originalPrice,
    };


    if (product && productCtx) { 
      const updatedProductData: Product = {
        ...product, 
        ...dataToSave, 
        id: product.id, 
        likes: product.likes, 
      };
      productCtx.updateProduct(updatedProductData);
      toast.success(`Product "${dataToSave.name}" updated.`);
    } else if (productCtx) { 
      productCtx.addProduct(dataToSave);
      toast.success(`Product "${dataToSave.name}" added.`);
    }
    
    // Reset file inputs after submission
    if(mainImageInputRef.current) mainImageInputRef.current.value = "";
    if(additionalImagesInputRef.current) additionalImagesInputRef.current.value = "";

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1 pr-3">
        <div>
          <label htmlFor="name" className={labelBaseClass}>Product Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputBaseClass} required />
        </div>
        
        <div>
          <label htmlFor="description" className={labelBaseClass}>Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={inputBaseClass} required />
          <Button type="button" onClick={handleGenerateDescription} isLoading={isGeneratingDesc} variant="ghost" size="sm" className="mt-1 text-xs text-gumball-blue" leftIcon={<AISparklesIcon className="w-4 h-4" />}>
            Generate with AI
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="originalPrice" className={labelBaseClass}>Original Price ($) <span className="text-xs text-gray-400">(Optional)</span></label>
              <input 
                type="number" 
                name="originalPrice" 
                id="originalPrice" 
                value={formData.originalPrice === undefined ? '' : formData.originalPrice} 
                onChange={handleChange} 
                className={inputBaseClass} 
                step="0.01" 
                min="0"
                placeholder="e.g., 99.99" 
              />
            </div>
            <div>
              <label htmlFor="price" className={labelBaseClass}>Selling Price ($)</label>
              <input 
                type="number" 
                name="price" 
                id="price" 
                value={formData.price} 
                onChange={handleChange} 
                className={inputBaseClass} 
                step="0.01" 
                min="0" 
                required 
              />
            </div>
        </div>
         {formData.discountPercentage !== undefined && formData.discountPercentage > 0 && (
          <div className="p-2 bg-gumball-yellow/20 dark:bg-gumball-yellow/10 rounded-md">
            <p className="text-sm font-medium text-gumball-dark dark:text-gumball-dark-deep">
              Calculated Discount: <span className="font-bold text-red-600">{formData.discountPercentage.toFixed(1)}%</span>
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="stock" className={labelBaseClass}>Stock Quantity</label>
                <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className={inputBaseClass} min="0" required />
            </div>
            <div>
                <label htmlFor="category" className={labelBaseClass}>Category</label>
                <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className={inputBaseClass} required />
            </div>
        </div>
        
        <div>
          <label htmlFor="mainImageFile" className={labelBaseClass}>Main Image</label>
          <input 
            type="file" 
            name="mainImageFile" 
            id="mainImageFile" 
            accept="image/*" 
            onChange={handleMainImageChange} 
            className={`${inputBaseClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gumball-pink/10 file:text-gumball-pink hover:file:bg-gumball-pink/20 dark:file:bg-gumball-pink/80 dark:file:text-white dark:hover:file:bg-gumball-pink`}
            ref={mainImageInputRef}
          />
          {mainImagePreview && (
            <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md inline-block">
              <img src={mainImagePreview} alt="Main image preview" className="h-24 w-auto object-contain rounded"/>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="additionalImageFiles" className={labelBaseClass}>Additional Images</label>
          <input 
            type="file" 
            name="additionalImageFiles" 
            id="additionalImageFiles" 
            accept="image/*" 
            multiple 
            onChange={handleAdditionalImagesChange} 
            className={`${inputBaseClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gumball-blue/10 file:text-gumball-blue hover:file:bg-gumball-blue/20 dark:file:bg-gumball-blue/80 dark:file:text-white dark:hover:file:bg-gumball-blue`}
            ref={additionalImagesInputRef}
          />
          {additionalImagesPreview.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {additionalImagesPreview.map((src, index) => (
                <div key={index} className="relative group p-1 border border-gray-200 dark:border-gray-700 rounded-md">
                    <img src={src} alt={`Additional preview ${index + 1}`} className="h-20 w-auto object-contain rounded"/>
                    <button
                        type="button"
                        onClick={() => handleDeleteAdditionalImage(index)}
                        className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all duration-150 z-10"
                        aria-label={`Remove additional image ${index + 1}`}
                        title="Remove image"
                    >
                        <CloseIcon className="w-3 h-3" />
                    </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 my-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-md">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong className="font-semibold">Important:</strong> Uploaded images are stored as Base64 in `localStorage`. 
                This is suitable for small numbers of images. For many large images, `localStorage` (5-10MB limit) can be quickly filled. 
                Consider image optimization before uploading.
            </p>
        </div>


        <div>
          <label htmlFor="keywords" className={labelBaseClass}>Keywords (comma-separated)</label>
          <input type="text" name="keywords" id="keywords" value={formData.keywords?.join(', ') || ''} onChange={handleChange} className={inputBaseClass} placeholder="e.g., technology, electronics, smart device" />
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{product ? 'Update Product' : 'Add Product'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// --- Manage Orders Pane ---
interface ManageOrdersPaneProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}
const ManageOrdersPane: React.FC<ManageOrdersPaneProps> = ({ orders, onViewDetails, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <input 
        type="text" 
        placeholder="Search orders by ID or Customer Name..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className={inputBaseClass + " w-full sm:max-w-md"}
      />
      <div className="overflow-x-auto bg-white dark:bg-gumball-dark-card shadow-lg rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gumball-dark">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gumball-dark-card divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gumball-dark transition-colors">
                <td 
                    className="px-4 py-3 text-sm font-mono text-gumball-blue dark:text-gumball-blue/80 break-all max-w-[10ch] xxs:max-w-[12ch] xs:max-w-[15ch] sm:max-w-[20ch] md:max-w-[25ch] lg:max-w-xs" 
                    title={order.id}
                >
                    {order.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gumball-dark dark:text-gumball-light-bg">{order.customerName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gumball-green">${order.totalPrice.toFixed(2)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                       order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                       order.status === 'Pending Approval' || order.status === 'Processing' || order.status === 'Preparing for Shipment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                       'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                   }`}>
                       {order.status}
                   </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <Button onClick={() => onViewDetails(order)} variant="ghost" size="sm" className="text-gumball-blue hover:text-gumball-pink p-1"><EyeIcon className="w-5 h-5"/></Button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Order Details Modal ---
interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, onUpdateStatus }) => {
    if (!order) return null;

    const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);

    useEffect(() => {
        if(order) setNewStatus(order.status);
    }, [order]);

    const handleStatusChange = () => {
        onUpdateStatus(order.id, newStatus);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: #${order.id.substring(0,12)}...`} size="lg">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-2">
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Total:</strong> <span className="text-gumball-green font-semibold">${order.totalPrice.toFixed(2)}</span></p>
                <p><strong>Billing Address:</strong> {order.billingAddress}</p>
                <p><strong>Phone:</strong> {order.phoneNumber}</p>
                <p><strong>State/Province:</strong> {order.stateProvince}</p>
                <p><strong>Neighborhood:</strong> {order.neighborhood}</p>
                
                <div className="mt-2">
                    <h4 className="font-semibold mb-1">Items:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm bg-gray-50 dark:bg-gumball-dark p-3 rounded-md">
                        {order.items.map(item => (
                            <li key={item.id}>{item.name} (x{item.quantity}) - ${item.price.toFixed(2)} each</li>
                        ))}
                    </ul>
                </div>

                <div className="mt-2">
                    <h4 className="font-semibold mb-1">Status History:</h4>
                     <ul className="space-y-1 text-xs bg-gray-50 dark:bg-gumball-dark p-3 rounded-md max-h-32 overflow-y-auto">
                        {order.statusHistory.slice().reverse().map((sh, idx) => ( 
                            <li key={idx}><strong>{sh.status}</strong> ({new Date(sh.timestamp).toLocaleString()}) {sh.notes && <span className="italic text-gray-500">- "{sh.notes}"</span>}</li>
                        ))}
                    </ul>
                </div>
                
                <div className="pt-3 border-t dark:border-gray-700">
                    <label htmlFor="orderStatus" className={labelBaseClass}>Update Order Status:</label>
                    <div className="flex gap-2 items-center">
                        <select 
                            id="orderStatus" 
                            value={newStatus} 
                            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                            className={inputBaseClass + " flex-grow"}
                        >
                            {ORDER_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <Button onClick={handleStatusChange} variant="secondary" size="sm" disabled={newStatus === order.status}>Update</Button>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={onClose} variant="primary">Close</Button>
            </div>
        </Modal>
    );
};


// --- Manage Q&A Pane ---
interface ManageQnAPaneProps {
  questions: ProductQuestion[];
  onEditAnswer: (questionId: string, answer: ProductAnswer) => void;
  onDeleteQuestion: (questionId: string) => void;
  addAnswerToQuestion: (questionId: string, responderName: string, answerText: string) => void;
}
const ManageQnAPane: React.FC<ManageQnAPaneProps> = ({ questions, onEditAnswer, onDeleteQuestion, addAnswerToQuestion }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const filteredQuestions = questions.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartAnswering = (questionId: string) => {
    setAnsweringQuestionId(questionId);
    setAnswerText('');
  };
  
  const handleAddAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (answeringQuestionId && answerText.trim()) {
      addAnswerToQuestion(answeringQuestionId, "Support Team", answerText);
      toast.success("Answer posted!");
      setAnsweringQuestionId(null);
      setAnswerText('');
    }
  };

  return (
    <div className="space-y-6">
       <input 
        type="text" 
        placeholder="Search questions by text, user, or product ID..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className={inputBaseClass + " w-full sm:max-w-md"}
      />
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
          <div key={q.id} className="bg-white dark:bg-gumball-dark-card p-4 rounded-lg shadow-md border-l-4 border-gumball-purple">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gumball-dark dark:text-gumball-light-bg">{q.questionText}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By: {q.userName} | Product ID: {q.productId === 'general' ? 'General' : q.productId} | Asked: {new Date(q.dateAsked).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => onDeleteQuestion(q.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"><TrashIcon className="w-5 h-5"/></Button>
            </div>
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600 ml-2">
              {q.answers.map(ans => (
                <div key={ans.id} className="bg-gray-50 dark:bg-gumball-dark p-2 rounded">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{ans.answerText}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">By: {ans.responderName} | Answered: {new Date(ans.dateAnswered).toLocaleDateString()}</p>
                  <Button onClick={() => onEditAnswer(q.id, ans)} variant="ghost" size="sm" className="text-xs text-gumball-blue p-0 mt-1">Edit</Button>
                </div>
              ))}
              {q.answers.length === 0 && answeringQuestionId !== q.id && (
                <Button onClick={() => handleStartAnswering(q.id)} variant="secondary" size="sm">Answer Question</Button>
              )}
              {answeringQuestionId === q.id && (
                <form onSubmit={handleAddAnswer} className="mt-2 space-y-2">
                  <textarea 
                    value={answerText} 
                    onChange={(e) => setAnswerText(e.target.value)} 
                    placeholder="Your answer..."
                    rows={2}
                    className={inputBaseClass}
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm">Post Answer</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAnsweringQuestionId(null)}>Cancel</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )) : (
            <p className="text-center py-10 text-gray-500 dark:text-gray-400">No questions found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

// --- Answer Form Modal ---
interface AnswerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAnswerData: { questionId: string; answer: ProductAnswer } | null;
  qnaCtx: IQnAContextType | undefined;
}
const AnswerFormModal: React.FC<AnswerFormModalProps> = ({ isOpen, onClose, editingAnswerData, qnaCtx }) => {
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    if (editingAnswerData) {
      setAnswerText(editingAnswerData.answer.answerText);
    }
  }, [editingAnswerData, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingAnswerData && qnaCtx) {
      qnaCtx.updateAnswerText(editingAnswerData.questionId, editingAnswerData.answer.id, answerText);
      toast.success("Answer updated.");
    }
    onClose();
  };
  
  if (!editingAnswerData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Answer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="answerText" className={labelBaseClass}>Answer Text:</label>
          <textarea name="answerText" id="answerText" value={answerText} onChange={(e) => setAnswerText(e.target.value)} rows={4} className={inputBaseClass} required />
        </div>
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Update Answer</Button>
        </div>
      </form>
    </Modal>
  );
};


// --- Manage Reviews Pane ---
interface ManageReviewsPaneProps {
  reviews: ProductReview[];
  getProductById: (productId: string) => Product | undefined;
  onDelete: (reviewId: string) => void;
}
const ManageReviewsPane: React.FC<ManageReviewsPaneProps> = ({ reviews, getProductById, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredReviews = reviews.filter(r => 
    r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (getProductById(r.productId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <input 
        type="text" 
        placeholder="Search reviews by reviewer, comment, product ID/Name..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className={inputBaseClass + " w-full sm:max-w-md"}
      />
      <div className="space-y-4">
        {filteredReviews.length > 0 ? filteredReviews.map(review => {
          const product = getProductById(review.productId);
          return (
            <div key={review.id} className="bg-white dark:bg-gumball-dark-card p-4 rounded-lg shadow-md border-l-4 border-gumball-yellow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {review.reviewerAvatar && <img src={review.reviewerAvatar} alt={review.reviewerName} className="w-8 h-8 rounded-full"/>}
                    <h4 className="font-semibold text-gumball-dark dark:text-gumball-light-bg">{review.reviewerName}</h4>
                    <StarRating rating={review.rating} starSize="w-4 h-4"/>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Product: {product?.name || review.productId} | Date: {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
                <Button onClick={() => onDelete(review.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"><TrashIcon className="w-5 h-5"/></Button>
              </div>
            </div>
          );
        }) : (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">No reviews found.</p>
        )}
      </div>
    </div>
  );
};

// --- CSV Helper Functions ---
const escapeCsvCell = (cellData: any): string => {
    let cell = String(cellData === null || cellData === undefined ? '' : cellData);
    if (cell.includes('"') || cell.includes(',') || cell.includes('\n') || cell.includes('\r')) {
        cell = cell.replace(/"/g, '""'); // Escape existing double quotes
        return `"${cell}"`; // Wrap in double quotes
    }
    return cell;
};

const arrayToCsvRow = (rowArray: any[]): string => {
    return rowArray.map(escapeCsvCell).join(',');
};

const downloadCsv = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        toast.error("CSV download not supported by your browser directly.");
    }
};

// --- Manage Reports Pane ---
interface ManageReportsPaneProps {
    productCtx: IProductContextType | undefined;
    orderCtx: OrderContextType | undefined;
    qnaCtx: IQnAContextType | undefined;
    reviewCtx: ReviewContextType | undefined;
}

const ManageReportsPane: React.FC<ManageReportsPaneProps> = ({ productCtx, orderCtx, qnaCtx, reviewCtx }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Default to previous month, or December of previous year if current month is January
    const defaultReportYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const defaultReportMonth = currentMonth === 1 ? 12 : currentMonth - 1;

    const [selectedYear, setSelectedYear] = useState<number>(defaultReportYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(defaultReportMonth);
    const [isGenerating, setIsGenerating] = useState(false);

    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i).sort();
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));

    const handleGenerateReport = () => {
        if (!productCtx || !orderCtx || !qnaCtx || !reviewCtx) {
            toast.error("Data contexts are not available. Cannot generate report.");
            return;
        }
        setIsGenerating(true);
        toast.info(`Generating report for ${months.find(m=>m.value === selectedMonth)?.name} ${selectedYear}...`);

        // Filter data for the selected month and year
        const targetMonth = selectedMonth - 1; // 0-indexed for Date object

        const monthlyOrders = orderCtx.orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.getFullYear() === selectedYear && orderDate.getMonth() === targetMonth;
        });

        const monthlyQuestions = qnaCtx.questions.filter(q => {
            const askedDate = new Date(q.dateAsked);
            return askedDate.getFullYear() === selectedYear && askedDate.getMonth() === targetMonth;
        });
        
        const monthlyAnsweredQuestions = monthlyQuestions.filter(q => q.answers.some(ans => {
            const answeredDate = new Date(ans.dateAnswered);
            return answeredDate.getFullYear() === selectedYear && answeredDate.getMonth() === targetMonth;
        })).length;


        const monthlyReviews = reviewCtx.reviews.filter(r => {
            const reviewDate = new Date(r.date);
            return reviewDate.getFullYear() === selectedYear && reviewDate.getMonth() === targetMonth;
        });

        // --- Report Data Aggregation ---
        let totalRevenue = 0;
        const productSales: { [productId: string]: { name: string, quantity: number, revenue: number } } = {};

        monthlyOrders.forEach(order => {
            totalRevenue += order.totalPrice;
            order.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.price * item.quantity;
            });
        });

        const averageOrderValue = monthlyOrders.length > 0 ? totalRevenue / monthlyOrders.length : 0;

        const topSellingProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        
        const detailedProductPerformance = Object.entries(productSales).map(([id, saleData]) => {
            const productInfo = productCtx.getProductById(id);
            return {
                id,
                name: saleData.name,
                unitsSold: saleData.quantity,
                revenue: saleData.revenue,
                currentStock: productInfo?.stock ?? 'N/A'
            };
        });

        const averageMonthlyRating = monthlyReviews.length > 0
            ? monthlyReviews.reduce((sum, r) => sum + r.rating, 0) / monthlyReviews.length
            : 0;

        // --- CSV Content Generation ---
        let csvContent = "";
        csvContent += `Techno Mart - Monthly Report\n`; // Updated App Name
        csvContent += `Report for: ${months.find(m=>m.value === selectedMonth)?.name} ${selectedYear}\n`;
        csvContent += `Generated On: ${new Date().toLocaleString()}\n\n`;

        csvContent += "Sales Summary\n";
        csvContent += arrayToCsvRow(["Metric", "Value"]) + "\n";
        csvContent += arrayToCsvRow(["Total Revenue", `$${totalRevenue.toFixed(2)}`]) + "\n";
        csvContent += arrayToCsvRow(["Total Orders", monthlyOrders.length]) + "\n";
        csvContent += arrayToCsvRow(["Average Order Value", `$${averageOrderValue.toFixed(2)}`]) + "\n\n";

        csvContent += "Top Selling Products (by Quantity)\n";
        csvContent += arrayToCsvRow(["Product Name", "Quantity Sold", "Total Revenue"]) + "\n";
        topSellingProducts.forEach(p => {
            csvContent += arrayToCsvRow([p.name, p.quantity, `$${p.revenue.toFixed(2)}`]) + "\n";
        });
        csvContent += "\n";

        csvContent += "Detailed Product Performance\n";
        csvContent += arrayToCsvRow(["Product ID", "Product Name", "Units Sold", "Revenue Generated", "Current Stock"]) + "\n";
        detailedProductPerformance.forEach(p => {
            csvContent += arrayToCsvRow([p.id, p.name, p.unitsSold, `$${p.revenue.toFixed(2)}`, p.currentStock]) + "\n";
        });
        csvContent += "\n";
        
        csvContent += "Q&A Summary\n";
        csvContent += arrayToCsvRow(["Metric", "Value"]) + "\n";
        csvContent += arrayToCsvRow(["New Questions Asked", monthlyQuestions.length]) + "\n";
        csvContent += arrayToCsvRow(["Questions Answered", monthlyAnsweredQuestions]) + "\n\n";
        
        csvContent += "Review Summary\n";
        csvContent += arrayToCsvRow(["Metric", "Value"]) + "\n";
        csvContent += arrayToCsvRow(["New Reviews Received", monthlyReviews.length]) + "\n";
        csvContent += arrayToCsvRow(["Average Rating of New Reviews", averageMonthlyRating.toFixed(2)]) + "\n\n";
        
        // Simulate processing time & download
        setTimeout(() => {
            downloadCsv(csvContent, `TechnoMart_Report_${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`);
            toast.success("Report generated and download started!");
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-gumball-dark-card p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-display text-gumball-purple dark:text-gumball-purple/90 mb-6">
                Generate Monthly Business Report
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
                <div>
                    <label htmlFor="reportYear" className={labelBaseClass}>Select Year:</label>
                    <select
                        id="reportYear"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className={inputBaseClass}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="reportMonth" className={labelBaseClass}>Select Month:</label>
                    <select
                        id="reportMonth"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className={inputBaseClass}
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.name}</option>
                        ))}
                    </select>
                </div>
                <Button
                    onClick={handleGenerateReport}
                    variant="primary"
                    size="md"
                    isLoading={isGenerating}
                    disabled={isGenerating}
                    className="w-full sm:w-auto"
                >
                    {isGenerating ? "Generating..." : "Generate & Download Report"}
                </Button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>The report will be downloaded as a CSV file, which can be opened in Excel, Google Sheets, or any spreadsheet software.</p>
                <p className="mt-2"><strong>Report includes:</strong> Sales summary, top products, product performance, Q&A activity, and review statistics for the selected month.</p>
            </div>
        </div>
    );
};
