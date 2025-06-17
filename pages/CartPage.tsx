import React, { useContext, useState } from 'react'; // Added useState
import { Link } from 'react-router-dom';
import { CartContext } from '../App';
import { Button } from '../components/Button';
import { CartItem } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal'; // Import ConfirmationModal
import { toast } from 'react-toastify'; // Import toast

export const CartPage: React.FC = () => {
  const cartCtx = useContext(CartContext);

  // State for ConfirmationModal
  const [modalConfig, setModalConfig] = useState<{
      isOpen: boolean;
      title?: string;
      message?: React.ReactNode;
      onConfirmAction?: () => void;
      confirmText?: string;
      confirmVariant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  }>({ isOpen: false });

  if (!cartCtx) {
    return <p className="text-center text-xl text-gumball-pink dark:text-gumball-pink/80">Cart is currently unavailable. Please try again.</p>;
  }

  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = cartCtx;

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Trigger confirmation for removing item when quantity becomes 0 or less
      handleRemoveItemAttempt(item.id, item.name);
    } else if (newQuantity > item.stock) {
        updateQuantity(item.id, item.stock); 
    }
    else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemoveItemAttempt = (itemId: string, itemName: string) => {
    setModalConfig({
        isOpen: true,
        title: "Confirm Remove Item",
        message: (
            <>
                Are you sure you want to remove <strong className="font-semibold">{itemName}</strong> from your cart?
            </>
        ),
        onConfirmAction: () => {
            removeFromCart(itemId);
            toast.info(`"${itemName}" removed from your cart.`);
        },
        confirmText: "Remove Item",
        confirmVariant: "danger"
    });
  };

  const handleClearCartAttempt = () => {
    if (cart.length === 0) {
        toast.info("Your cart is already empty!");
        return;
    }
    setModalConfig({
        isOpen: true,
        title: "Confirm Clear Cart",
        message: "Are you sure you want to remove all items from your cart? This action cannot be undone.",
        onConfirmAction: () => {
            clearCart();
            toast.info("Cart has been cleared!");
        },
        confirmText: "Clear Cart",
        confirmVariant: "danger"
    });
  };


  if (cart.length === 0) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <img 
            src="https://picsum.photos/seed/emptycart/300/200" 
            alt="Empty Cart" 
            className="mx-auto mb-8 rounded-lg shadow-lg hover:animate-wiggleSoft dark:opacity-80" 
        />
        <h2 className="text-4xl font-display text-gumball-purple dark:text-gumball-purple/80 mb-4">Your Shopping Cart is Empty</h2>
        <p className="text-lg text-gumball-dark dark:text-gumball-light-bg/80 mb-8">Browse our products and add items to your cart.</p>
        <Button variant="primary" size="lg" as={Link} to="/">
            Shop Now
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fadeIn">
      <h1 className="text-5xl font-display text-gumball-blue dark:text-gumball-blue/90 mb-8 text-center">Your Shopping Cart</h1>
      
      <div className="bg-white dark:bg-gumball-dark-card shadow-xl rounded-lg p-6 mb-8">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4 shadow-sm" />
              <div>
                <h3 className="text-lg font-semibold text-gumball-dark dark:text-gumball-light-bg">{item.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)} each</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button size="sm" variant="ghost" onClick={() => handleQuantityChange(item, item.quantity - 1)} aria-label="Decrease quantity" disabled={item.quantity <=1 && cart.length === 1 && item.quantity === 1}> {/* Disable if it's the last item and quantity is 1 to force removal via explicit button */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
              </Button>
              <input 
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
                className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-md p-1 focus:ring-gumball-pink focus:border-gumball-pink dark:bg-gumball-dark dark:text-gumball-light-bg"
                min="1"
                max={item.stock}
                aria-label={`Quantity for ${item.name}`}
              />
              <Button size="sm" variant="ghost" onClick={() => handleQuantityChange(item, item.quantity + 1)} aria-label="Increase quantity" disabled={item.quantity >= item.stock}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </Button>
            </div>
            <p className="font-techno text-lg text-gumball-green md:w-24 text-right my-2 md:my-0">${(item.price * item.quantity).toFixed(2)}</p>
            <Button variant="danger" size="sm" onClick={() => handleRemoveItemAttempt(item.id, item.name)} aria-label={`Remove ${item.name} from cart`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-gumball-yellow/20 dark:bg-gumball-yellow/10 p-6 rounded-lg shadow-xl">
        <div>
            <Button variant="ghost" onClick={handleClearCartAttempt} className="text-red-500 hover:bg-red-100/50 dark:hover:bg-red-700/30">
            Clear Cart
            </Button>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <p className="text-2xl font-techno text-gumball-dark dark:text-gumball-light-bg">
            Total: <span className="text-gumball-green">${getTotalPrice().toFixed(2)}</span>
          </p>
          <Button 
            as={Link}
            to="/checkout"
            variant="secondary" 
            size="lg" 
            className="mt-4 font-display w-full md:w-auto"
            disabled={cart.length === 0}
            >
            Proceed to Checkout
          </Button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title || "Confirm Action"}
        message={modalConfig.message || "Are you sure you want to proceed?"}
        onConfirm={() => {
            if (modalConfig.onConfirmAction) {
                modalConfig.onConfirmAction();
            }
            setModalConfig({ isOpen: false }); // Close modal
        }}
        onCancel={() => setModalConfig({ isOpen: false })}
        confirmButtonText={modalConfig.confirmText || "Confirm"}
        confirmButtonVariant={modalConfig.confirmVariant || "danger"}
    />
    </div>
  );
};