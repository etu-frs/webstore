import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Button } from './Button';
import { CartContext, WishlistContext, ProductContext, LikedProductsContext } from '../App';
import { toast } from 'react-toastify';
import { StarRating } from './StarRating'; // Import StarRating

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

const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 ml-2" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const cartCtx = useContext(CartContext);
  const wishlistCtx = useContext(WishlistContext);
  const productCtx = useContext(ProductContext);
  const likedProductsCtx = useContext(LikedProductsContext); 

  const [animateLikeVisual, setAnimateLikeVisual] = useState(false); 
  const [isAddedToCartRecently, setIsAddedToCartRecently] = useState(false);


  const currentProductState = productCtx?.products.find(p => p.id === product.id) || product;

  useEffect(() => {
    if (animateLikeVisual) {
      const timer = setTimeout(() => setAnimateLikeVisual(false), 600); 
      return () => clearTimeout(timer);
    }
  }, [animateLikeVisual]);

  if (!cartCtx || !wishlistCtx || !productCtx || !likedProductsCtx) {
    return <p>Error: Contexts not available</p>;
  }
  
  const { addToCart } = cartCtx;
  const { toggleWishlistItem } = wishlistCtx;
  const { incrementProductLike, decrementProductLike } = productCtx;
  const { toggleProductLikeState, isProductLikedByUser } = likedProductsCtx;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    
    const newLikeStatus = toggleProductLikeState(currentProductState.id);

    if (newLikeStatus === 'liked') {
      incrementProductLike(currentProductState.id);
    } else {
      decrementProductLike(currentProductState.id);
    }
    
    toggleWishlistItem(currentProductState.id); 
    setAnimateLikeVisual(true); 
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    if (currentProductState.stock > 0 && !isAddedToCartRecently) {
      addToCart(currentProductState);
      toast.success(`${currentProductState.name} added to cart.`);
      setIsAddedToCartRecently(true);
      setTimeout(() => setIsAddedToCartRecently(false), 2500); // Reset after a while
    } else if (currentProductState.stock <= 0) {
      toast.warn(`${currentProductState.name} is out of stock.`);
    }
  };
  
  const isLikedByCurrentUserSession = isProductLikedByUser(currentProductState.id);
  const hasDiscount = currentProductState.originalPrice && currentProductState.price && currentProductState.originalPrice > currentProductState.price;

  return (
    <Link 
        to={`/product/${currentProductState.id}`} 
        className="block bg-white dark:bg-gumball-dark-card rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-[0_8px_30px_rgba(233,30,99,0.3)] hover:scale-105 flex flex-col justify-between animate-fadeIn border-4 border-transparent hover:border-gumball-pink/70 group"
        aria-label={`View details for ${currentProductState.name}`}
    >
      <div className="relative">
        {hasDiscount && currentProductState.discountPercentage && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-sm font-bold px-3.5 py-2 rounded-br-lg rounded-tl-lg z-10 transform -translate-x-[1px] -translate-y-[1px] animate-radiantPulse">
            -{currentProductState.discountPercentage.toFixed(0)}%
          </div>
        )}
        <div className="overflow-hidden rounded-t-lg"> {/* Ensure this div also gets rounded corners if image is missing border radius */}
            <img 
                src={currentProductState.imageUrl} 
                alt={currentProductState.name} 
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110" 
                onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300?grayscale')}
            />
        </div>
        <button 
          onClick={handleHeartClick}
          className="absolute top-2 right-2 flex items-center space-x-1.5 p-2 bg-white/80 dark:bg-gumball-dark/80 rounded-full z-10 focus:outline-none group/likebutton hover:bg-white dark:hover:bg-gumball-dark-card"
          aria-label="Toggle Like and Wishlist"
        >
          <HeartIcon 
            filled={isLikedByCurrentUserSession} 
            className={`group-hover/likebutton:scale-125 transition-transform duration-200 ${animateLikeVisual ? 'animate-bounceOnce' : ''}`}
          />
          <span 
            key={currentProductState.likes} 
            className={`text-sm font-bold text-gumball-pink font-display ${animateLikeVisual ? 'animate-popBriefly' : ''}`} 
            aria-label={`Total likes: ${currentProductState.likes}`}
          >
            {currentProductState.likes}
          </span>
        </button>
        <div className="p-5">
          <h3 className="text-xl md:text-2xl font-display text-gumball-blue group-hover:text-gumball-pink transition-colors mb-2 truncate dark:text-gumball-blue/90 dark:group-hover:text-gumball-pink/90" title={currentProductState.name}>{currentProductState.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 font-body text-sm mb-3 h-10 overflow-hidden">{currentProductState.description}</p>
          
          {currentProductState.averageRating !== undefined && currentProductState.averageRating >= 0 && (
            <div className="flex items-center space-x-1.5 mb-2">
              <StarRating rating={currentProductState.averageRating} starSize="w-4 h-4" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({currentProductState.reviewCount || 0} review{currentProductState.reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}
          
          <div className="flex items-baseline space-x-2 mb-1">
            {hasDiscount && currentProductState.originalPrice && (
              <p className="font-techno text-lg text-gray-400 dark:text-gray-500 line-through">
                ${currentProductState.originalPrice.toFixed(2)}
              </p>
            )}
            <p className={`font-techno text-2xl ${hasDiscount ? 'text-red-500' : 'text-gumball-green'}`}>
              ${currentProductState.price.toFixed(2)}
            </p>
          </div>

        </div>
      </div>
      <div className="p-5 pt-0 mt-auto">
        <p className="text-xs text-center text-gumball-blue dark:text-gumball-blue/80 group-hover:text-gumball-pink dark:group-hover:text-gumball-pink/90 transition-colors cursor-pointer mt-1 mb-3">
            Rate & Review
        </p>
        <Button 
          onClick={handleAddToCartClick} 
          variant={isAddedToCartRecently ? "secondary" : "primary"}
          className="w-full font-techno"
          aria-label={`Add ${currentProductState.name} to cart`}
          disabled={currentProductState.stock === 0 || isAddedToCartRecently}
        >
          {isAddedToCartRecently ? (
            <>Added <CheckIcon className="w-5 h-5 ml-2" /></>
          ) : currentProductState.stock > 0 ? (
            <>Add to Cart <PlusIcon /></>
          ) : (
            'Out of Stock'
          )}
        </Button>
      </div>
    </Link>
  );
};