
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductContext, CartContext, WishlistContext, LikedProductsContext, QnAContext, ReviewContext } from '../App';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Product, ProductReview, ProductQuestion, ProductAnswer } from '../types';
import { toast } from 'react-toastify';
import { StarRating, InteractiveStarRating } from '../components/StarRating';
// MOCK_QUESTIONS and MOCK_REVIEWS are now managed by Contexts, initialized from constants.ts

const HeartIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-colors duration-200 ${filled ? 'text-gumball-pink' : 'text-gray-400 dark:text-gray-500'} ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);


export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const productCtx = useContext(ProductContext);
  const cartCtx = useContext(CartContext);
  const wishlistCtx = useContext(WishlistContext);
  const likedProductsCtx = useContext(LikedProductsContext);
  const qnaCtx = useContext(QnAContext);
  const reviewCtx = useContext(ReviewContext);

  const [isAddedToCartRecently, setIsAddedToCartRecently] = useState(false);
  const [animateLikeVisual, setAnimateLikeVisual] = useState(false);
  
  const product = useMemo(() => {
    if (!productId || !productCtx) return undefined;
    return productCtx.getProductById(productId);
  }, [productId, productCtx]);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(product?.imageUrl);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('Valued Customer'); 


  useEffect(() => {
    if (product) {
      setSelectedImageUrl(product.imageUrl);
    }
  }, [product]);

  useEffect(() => {
    if (animateLikeVisual) {
      const timer = setTimeout(() => setAnimateLikeVisual(false), 600);
      return () => clearTimeout(timer);
    }
  }, [animateLikeVisual]);
  
  useEffect(() => {
    setIsAddedToCartRecently(false);
  }, [productId]);


  const relatedProducts = useMemo(() => {
    if (!product || !productCtx) return [];
    return productCtx.products
      .filter(p => p.id !== product.id && p.category === product.category)
      .sort(() => 0.5 - Math.random()) 
      .slice(0, 3);
  }, [product, productCtx]);

  if (!productCtx || !cartCtx || !wishlistCtx || !likedProductsCtx || !qnaCtx || !reviewCtx) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <img 
            src="https://picsum.photos/seed/notfound/300/200?blur=2" 
            alt="Product Not Found" 
            className="mx-auto mb-8 rounded-lg shadow-lg opacity-75 dark:opacity-60" 
        />
        <h2 className="text-4xl font-display text-gumball-purple dark:text-gumball-purple/80 mb-4">Product Not Found</h2>
        <p className="text-lg text-gumball-dark dark:text-gumball-light-bg/80 mb-8">
          The requested product could not be found. It may have been removed or the link is incorrect.
        </p>
        <Button as={Link} to="/" variant="primary" size="lg">
          Back to Store
        </Button>
      </div>
    );
  }
  
  const currentProductState = productCtx.products.find(p => p.id === product.id) || product;
  const allImageUrls = [currentProductState.imageUrl, ...(currentProductState.additionalImageUrls || [])].filter(url => url);


  const productReviews = reviewCtx.reviews.filter(review => review.productId === currentProductState.id)
                                   .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const productQuestions = qnaCtx.questions.filter(question => question.productId === currentProductState.id)
                                    .sort((a,b) => new Date(b.dateAsked).getTime() - new Date(a.dateAsked).getTime());


  const handleAddToCart = () => {
    if (currentProductState.stock > 0 && !isAddedToCartRecently) {
      cartCtx.addToCart(currentProductState);
      toast.success(`${currentProductState.name} added to cart.`);
      setIsAddedToCartRecently(true);
      setTimeout(() => setIsAddedToCartRecently(false), 2500); 
    } else if (currentProductState.stock <= 0) {
      toast.warn(`${currentProductState.name} is out of stock.`);
    }
  };
  
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const newLikeStatus = likedProductsCtx.toggleProductLikeState(currentProductState.id);

    if (newLikeStatus === 'liked') {
      productCtx.incrementProductLike(currentProductState.id);
    } else {
      productCtx.decrementProductLike(currentProductState.id);
    }
    
    wishlistCtx.toggleWishlistItem(currentProductState.id);
    setAnimateLikeVisual(true);
  };

  const isLikedByCurrentUserSession = likedProductsCtx.isProductLikedByUser(currentProductState.id);
  const hasDiscount = currentProductState.originalPrice && currentProductState.price && currentProductState.originalPrice > currentProductState.price;


  const openLightbox = () => {
    if (selectedImageUrl) {
        setIsLightboxOpen(true);
    }
  };
  const closeLightbox = () => setIsLightboxOpen(false);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
        toast.warn("Please type your question before submitting.");
        return;
    }
    qnaCtx.addQuestion(currentProductState.id, "Valued Customer", newQuestionText);
    toast.info(`Your question about "${currentProductState.name}" has been submitted.`);
    setNewQuestionText('');
  };

  const handleWriteReview = (e: React.FormEvent) => {
    e.preventDefault();
     if (!newReviewText.trim()) {
        toast.warn("Please write your review before submitting.");
        return;
    }
    reviewCtx.addReview(currentProductState.id, reviewerName, newReviewRating, newReviewText);
    toast.success(`Thank you for your review. It has been submitted.`);
    setNewReviewText('');
    setNewReviewRating(5);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fadeIn">
      <div className="mb-6">
        <Button as={Link} to="/" variant="ghost" leftIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>}>
          Back to Products
        </Button>
      </div>

      <div className="bg-white dark:bg-gumball-dark-card rounded-xl shadow-2xl p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery Section */}
          <div className="md:sticky md:top-24 self-start">
            <div 
                className="mb-4 cursor-zoom-in relative" // Added relative for sash
                onClick={openLightbox}
                role="button"
                aria-label="View larger image"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox();}}
            >
              {hasDiscount && currentProductState.discountPercentage && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-br-lg rounded-tl-lg z-10 transform -translate-x-0.5 -translate-y-0.5 animate-radiantPulse">
                  -{currentProductState.discountPercentage.toFixed(0)}%
                </div>
              )}
              <img
                src={selectedImageUrl || 'https://picsum.photos/600/600?grayscale&blur=1'}
                alt={currentProductState.name}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-lg border-4 border-gumball-yellow/50 dark:border-gumball-yellow/30"
                onError={(e) => (e.currentTarget.src = 'https://picsum.photos/600/600?grayscale&blur=1')}
              />
            </div>
            {allImageUrls.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
                {allImageUrls.map((url, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:opacity-100 hover:border-gumball-pink
                                ${selectedImageUrl === url ? 'border-gumball-pink scale-105 opacity-100' : 'border-gray-300 dark:border-gray-600 opacity-70'}`}
                    onClick={() => setSelectedImageUrl(url)}
                    role="button"
                    aria-label={`View image ${index + 1}`}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedImageUrl(url);}}
                  >
                    <img
                      src={url}
                      alt={`${currentProductState.name} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display='none')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-display text-gumball-pink dark:text-gumball-pink/90 mb-3">{currentProductState.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Category: <span className="font-semibold text-gumball-purple dark:text-gumball-purple/80">{currentProductState.category}</span></p>
            
            {currentProductState.averageRating !== undefined && currentProductState.averageRating >= 0 && (
              <div className="flex items-center space-x-1.5 mb-4">
                <StarRating rating={currentProductState.averageRating} starSize="w-5 h-5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({currentProductState.averageRating.toFixed(1)} from {currentProductState.reviewCount || 0} review{currentProductState.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <p className="font-body text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">{currentProductState.description}</p>
            
            <div className="flex items-center justify-between mb-1"> {/* Adjusted margin */}
                <div className="flex items-baseline space-x-3"> {/* Container for prices */}
                    {hasDiscount && currentProductState.originalPrice && (
                        <p className="font-techno text-3xl text-gray-400 dark:text-gray-500 line-through">
                            ${currentProductState.originalPrice.toFixed(2)}
                        </p>
                    )}
                    <p className={`font-techno text-5xl ${hasDiscount ? 'text-red-500' : 'text-gumball-green'}`}>
                        ${currentProductState.price.toFixed(2)}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleHeartClick}
                        className="flex items-center space-x-1.5 p-2.5 bg-gray-100 dark:bg-gumball-dark rounded-full z-10 focus:outline-none group/likebutton hover:bg-gray-200 dark:hover:bg-gumball-dark-deep transition-colors"
                        aria-label="Toggle Like and Wishlist"
                    >
                        <HeartIcon 
                            filled={isLikedByCurrentUserSession} 
                            className={`w-7 h-7 group-hover/likebutton:scale-110 transition-transform duration-200 ${animateLikeVisual ? 'animate-bounceOnce' : ''}`}
                        />
                         <span 
                            key={currentProductState.likes} 
                            className={`text-lg font-bold text-gumball-pink font-display ${animateLikeVisual ? 'animate-popBriefly' : ''}`} 
                            aria-label={`Total likes: ${currentProductState.likes}`}
                        >
                            {currentProductState.likes}
                        </span>
                    </button>
                </div>
            </div>
             {wishlistCtx.isProductWished(currentProductState.id) && (
                <p className="text-sm text-gumball-pink dark:text-gumball-pink/80 mb-1 italic">This item is in your Wishlist.</p>
            )}
             {isLikedByCurrentUserSession && !wishlistCtx.isProductWished(currentProductState.id) && (
                 <p className="text-sm text-gumball-pink dark:text-gumball-pink/80 mb-1 italic">You liked this product.</p>
             )}

            <p className={`text-lg font-semibold mt-4 mb-6 ${currentProductState.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {currentProductState.stock > 0 ? `${currentProductState.stock} units available.` : 'Temporarily Out of Stock'}
            </p>

            <Button
              onClick={handleAddToCart}
              variant={isAddedToCartRecently ? "secondary" : "primary"}
              size="lg"
              className="w-full font-display text-xl py-4"
              disabled={currentProductState.stock === 0 || isAddedToCartRecently}
            >
              {isAddedToCartRecently ? (
                <>Added to Cart <CheckIcon className="w-6 h-6 ml-2" /></>
              ) : currentProductState.stock > 0 ? (
                'Add to Cart'
              ) : (
                'Out of Stock'
              )}
            </Button>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                <p><span className="font-semibold">Keywords:</span> {currentProductState.keywords?.join(', ') || 'General Product Information'}</p>
                 <p><span className="font-semibold">Product ID:</span> {currentProductState.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-12 pt-10 border-t-2 border-dashed border-gumball-yellow dark:border-gumball-yellow/50">
        <h2 className="text-3xl font-display text-gumball-blue dark:text-gumball-blue/90 mb-8 text-center">
          Customer Reviews
        </h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          {productReviews.length > 0 ? productReviews.map(review => (
            <div key={review.id} className="bg-white dark:bg-gumball-dark-card p-5 rounded-lg shadow-lg border-l-4 border-gumball-pink dark:border-gumball-pink/70">
              <div className="flex items-start space-x-3 mb-2">
                {review.reviewerAvatar && <img src={review.reviewerAvatar} alt={review.reviewerName} className="w-10 h-10 rounded-full object-cover" />}
                <div>
                  <h4 className="font-semibold text-gumball-dark dark:text-gumball-light-bg">{review.reviewerName}</h4>
                  <StarRating rating={review.rating} starSize="w-5 h-5" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-1 leading-relaxed">{review.comment}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
            </div>
          )) : (
            <p className="text-center text-gray-600 dark:text-gray-400">No reviews for this product yet. Be the first to share your thoughts.</p>
          )}

          <form onSubmit={handleWriteReview} className="mt-8 bg-gumball-light-bg dark:bg-gumball-dark p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-techno text-gumball-purple dark:text-gumball-purple/80 mb-3">Write Your Review</h3>
            <div className="mb-3">
                <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name:</label>
                <input 
                    type="text" 
                    id="reviewerName" 
                    value={reviewerName} 
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gumball-dark-card dark:text-gumball-light-bg dark:placeholder-gray-400"
                    placeholder="e.g., John D." 
                />
            </div>
            <div className="mb-4">
              <label htmlFor="reviewRating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Rating:</label>
              <InteractiveStarRating rating={newReviewRating} setRating={setNewReviewRating} interactive={true} />
            </div>
            <textarea 
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="Share your experience with this product..." 
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-3 dark:bg-gumball-dark-card dark:text-gumball-light-bg dark:placeholder-gray-400"
              aria-label="Your review text"
              required
            />
            <Button type="submit" variant="secondary">Submit Review</Button>
          </form>
        </div>
      </div>

      {/* Q&A Section (Product Specific) */}
      <div className="mt-12 pt-10 border-t-2 border-dashed border-gumball-green dark:border-gumball-green/50">
        <h2 className="text-3xl font-display text-gumball-yellow dark:text-gumball-yellow/90 mb-8 text-center">
          Questions & Answers
        </h2>
        <div className="space-y-8 max-w-3xl mx-auto">
          {productQuestions.length > 0 ? productQuestions.map(qa => (
            <div key={qa.id} className="bg-white dark:bg-gumball-dark-card p-5 rounded-lg shadow-lg border-l-4 border-gumball-green dark:border-gumball-green/70">
              <div className="mb-3">
                <p className="font-semibold text-gumball-dark dark:text-gumball-light-bg"><span className="text-gumball-purple dark:text-gumball-purple/80">Q:</span> {qa.questionText}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Asked by: {qa.userName} on {new Date(qa.dateAsked).toLocaleDateString()}</p>
              </div>
              {qa.answers.length > 0 ? qa.answers.map(ans => (
                <div key={ans.id} className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 py-2 bg-gumball-light-bg/50 dark:bg-gumball-dark/50 rounded-r-md">
                  <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold text-gumball-green dark:text-gumball-green/80">A:</span> {ans.answerText}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Answered by: {ans.responderName} on {new Date(ans.dateAnswered).toLocaleDateString()}</p>
                </div>
              )) : (
                <p className="ml-4 text-sm text-gray-500 dark:text-gray-400 italic">Our team is reviewing this question...</p>
              )}
            </div>
          )) : (
            <p className="text-center text-gray-600 dark:text-gray-400">No questions about this product yet. Be the first to ask.</p>
          )}
          
          <form onSubmit={handleAskQuestion} className="mt-8 bg-gumball-light-bg dark:bg-gumball-dark p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-techno text-gumball-yellow dark:text-gumball-yellow/80 mb-3">Ask a Question About This Product</h3>
            <textarea 
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Type your question here..." 
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-3 dark:bg-gumball-dark-card dark:text-gumball-light-bg dark:placeholder-gray-400"
              aria-label="Your question text"
              required
            />
            <Button type="submit" variant="primary">Ask Question</Button>
          </form>
        </div>
      </div>


      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t-2 border-dashed border-gumball-blue dark:border-gumball-blue/50">
          <h2 className="text-3xl font-display text-gumball-blue dark:text-gumball-blue/90 mb-8 text-center">You Might Also Like...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(rp => (
              <div 
                key={rp.id} 
                className="bg-white dark:bg-gumball-dark-card rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border-2 border-transparent hover:border-gumball-pink/50 dark:hover:border-gumball-pink/30"
                onClick={() => navigate(`/product/${rp.id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/product/${rp.id}`);}}
              >
                <img 
                    src={rp.imageUrl} 
                    alt={rp.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300?grayscale')}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gumball-dark dark:text-gumball-light-bg truncate mb-1" title={rp.name}>{rp.name}</h3>
                  {rp.averageRating !== undefined && rp.averageRating >= 0 && (
                    <div className="flex items-center space-x-1 mb-1">
                      <StarRating rating={rp.averageRating} starSize="w-4 h-4" />
                       <span className="text-xs text-gray-500 dark:text-gray-400">({rp.reviewCount || 0})</span>
                    </div>
                  )}
                  <p className="font-techno text-xl text-gumball-green mb-2">${rp.price.toFixed(2)}</p>
                  <Button 
                    as={Link} 
                    to={`/product/${rp.id}`} 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-gumball-blue dark:text-gumball-blue/80"
                    aria-label={`View details for ${rp.name}`}
                    onClick={(e) => e.stopPropagation()} 
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
       {isLightboxOpen && selectedImageUrl && (
        <Modal isOpen={isLightboxOpen} onClose={closeLightbox} title="" size="xl">
          <div className="p-0 flex justify-center items-center max-h-[90vh]">
            <img 
                src={selectedImageUrl} 
                alt={`${currentProductState.name} - zoomed view`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
// No longer need to export MOCK_QUESTIONS and MOCK_REVIEWS from here
// as they are managed by contexts initialized from constants.ts
