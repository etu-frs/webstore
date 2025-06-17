import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductQuestion } from '../types';
import { Button } from '../components/Button';
import { CartContext, ProductContext, WishlistContext, LikedProductsContext, QnAContext } from '../App';
// import { getFunFact } from '../services/geminiService'; // Removed getFunFact import
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'react-toastify';


const GeneralQnASection: React.FC = () => {
  const qnaCtx = useContext(QnAContext);
  const [newQuestionText, setNewQuestionText] = useState('');
  
  if (!qnaCtx) return <p>Loading Q&A...</p>;

  const generalQuestions = qnaCtx.questions.filter(q => q.productId === 'general')
                                .sort((a,b) => new Date(b.dateAsked).getTime() - new Date(a.dateAsked).getTime())
                                .slice(0,3);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText.trim() === '') {
        toast.warn("Please type your question first.");
        return;
    }
    qnaCtx.addQuestion('general', "Valued Customer", newQuestionText);
    toast.info(`Your question has been submitted.`);
    setNewQuestionText('');
  };

  return (
    <section className="py-16 bg-gumball-blue/5 dark:bg-gumball-blue/10 rounded-xl shadow-inner mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-display text-gumball-purple dark:text-gumball-purple/90 mb-10 text-center">
          Have Questions for Our Team?
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          {generalQuestions.length > 0 ? generalQuestions.map(qa => (
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
            <p className="text-center text-gray-600 dark:text-gray-400">No general questions answered yet. Be the first to ask!</p>
          )}
          
          <form onSubmit={handleAskQuestion} className="mt-10 bg-gumball-light-bg dark:bg-gumball-dark p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-techno text-gumball-yellow dark:text-gumball-yellow/80 mb-4">Ask Your Question</h3>
            <textarea 
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Type your general question here..." 
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md mb-4 dark:bg-gumball-dark-card dark:text-gumball-light-bg dark:placeholder-gray-400"
              aria-label="Your general question text"
              required
            />
            <Button type="submit" variant="primary" size="lg">Submit Question</Button>
          </form>
        </div>
      </div>
    </section>
  );
};


export const HomePage: React.FC = () => {
  const productCtx = useContext(ProductContext);
  const cartCtx = useContext(CartContext);
  const wishlistCtx = useContext(WishlistContext);
  const likedProductsCtx = useContext(LikedProductsContext); 
  const navigate = useNavigate();

  // Removed funFact and isLoadingFact states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showWishlist, setShowWishlist] = useState<boolean>(false);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [sortOption, setSortOption] = useState<string>('default');

  // Removed useEffect for fetching fun fact

  const categories = useMemo(() => {
    if (!productCtx) return ['All Categories'];
    const uniqueCategories = Array.from(new Set(productCtx.products.map(p => p.category)));
    return ['All Categories', ...uniqueCategories.sort()];
  }, [productCtx]);

  const sortOptionsList = [
    { value: 'default', label: "Default Sorting" },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A-Z' },
    { value: 'name_desc', label: 'Name: Z-A' },
    { value: 'likes_desc', label: 'Most Liked First' },
    { value: 'rating_desc', label: 'Highest Rated First'},
  ];

  const productsToDisplay = useMemo(() => {
    if (!productCtx) return [];
    let currentProducts = [...productCtx.products]; 

    if (showWishlist && wishlistCtx) {
      currentProducts = currentProducts.filter(p => wishlistCtx.isProductWished(p.id));
    }

    if (selectedCategory !== 'All Categories') {
      currentProducts = currentProducts.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      currentProducts = currentProducts.filter(product =>
        product.name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    switch (sortOption) {
      case 'price_asc':
        currentProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        currentProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        currentProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        currentProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'likes_desc':
        currentProducts.sort((a,b) => b.likes - a.likes);
        break;
      case 'rating_desc':
        currentProducts.sort((a,b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
        break;
      default:
        break;
    }
    return currentProducts;
  }, [productCtx, searchTerm, showWishlist, wishlistCtx, selectedCategory, sortOption]);


  if (!productCtx || !cartCtx || !wishlistCtx || !likedProductsCtx) { 
    return <LoadingSpinner message="Loading products..." />;
  }
  
  const handleHeroCTAClick = () => {
    const productSection = document.getElementById('product-grid-section');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="animate-fadeIn">
      <section className="text-center py-24 md:py-32 bg-gradient-to-br from-gumball-pink via-gumball-purple to-gumball-blue rounded-xl shadow-2xl mb-12 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-display text-white drop-shadow-2xl mb-6 leading-tight">
            Discover Innovative Technology
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-techno text-white/95 mb-12">
            Explore a wide range of cutting-edge gadgets for your modern lifestyle.
          </p>
          <Button
            onClick={handleHeroCTAClick}
            variant="secondary" 
            size="lg"
            className="font-display text-2xl md:text-3xl px-10 py-5 !rounded-full shadow-lg transform hover:scale-110 active:scale-95 hover:shadow-gumball-yellow/40 dark:hover:shadow-gumball-yellow/30"
          >
            Shop Gadgets
          </Button>
        </div>
      </section>
      
      <section id="product-grid-section" className="mb-8 px-2 mt-16">
        <div className="flex flex-col sm:flex-row gap-4 items-center flex-wrap mb-8">
            <input
            type="text"
            placeholder="Search for products..."
            className="w-full sm:flex-1 p-3.5 rounded-lg border-2 border-gumball-purple focus:ring-gumball-pink focus:border-gumball-pink shadow-md text-lg font-techno dark:bg-gumball-dark-card dark:border-gumball-purple/70 dark:text-gumball-light-bg dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search products"
            />
            <div className="w-full sm:w-auto">
                <label htmlFor="category-filter" className="sr-only">Filter by Category</label>
                <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3.5 rounded-lg border-2 border-gumball-purple focus:ring-gumball-pink focus:border-gumball-pink shadow-md text-lg font-techno bg-white dark:bg-gumball-dark-card dark:border-gumball-purple/70 dark:text-gumball-light-bg"
                    aria-label="Filter by Category"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="w-full sm:w-auto">
                <label htmlFor="sort-options" className="sr-only">Sort products by</label>
                <select
                    id="sort-options"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full p-3.5 rounded-lg border-2 border-gumball-purple focus:ring-gumball-pink focus:border-gumball-pink shadow-md text-lg font-techno bg-white dark:bg-gumball-dark-card dark:border-gumball-purple/70 dark:text-gumball-light-bg"
                    aria-label="Sort products by"
                >
                    {sortOptionsList.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <Button 
            onClick={() => setShowWishlist(!showWishlist)}
            variant={showWishlist ? "secondary" : "primary"}
            className="w-full sm:w-auto font-techno py-3 px-5 text-lg"
            aria-pressed={showWishlist}
            >
            {showWishlist ? "Show All" : `Wishlist (${wishlistCtx.wishlist.length})`}
            </Button>
        </div>

        {productsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {productsToDisplay.map((product) => (
                <ProductCard key={product.id} product={product} /> 
            ))}
            </div>
        ) : (
            <div className="text-center text-2xl font-display text-gumball-purple dark:text-gumball-purple/80 py-10 min-h-[200px] flex flex-col justify-center items-center">
                <img src="https://picsum.photos/seed/noresults/200/150?grayscale" alt="No results" className="rounded-lg shadow-md mb-4 opacity-70 dark:opacity-50"/>
            {showWishlist && wishlistCtx.wishlist.length === 0 
                ? "Your wishlist is empty. Add some products!"
                : searchTerm || selectedCategory !== 'All Categories'
                ? "No products match your search criteria."
                : "No products available at the moment. Please check back later."
            }
            </div>
        )}
      </section>

      <GeneralQnASection />

    </div>
  );
};