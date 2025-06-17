import React, { useContext, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import { CartContext, OrderContext } from '../App';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

interface CheckoutFormData {
  customerName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  stateProvince: string; // New
  phoneNumber: string;   // New
  neighborhood: string;  // New
  paymentMethod: 'creditCard' | 'loyaltyPoints' | 'giftCardBalance';
}

// Location Icon for the button
const LocationPinIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);


export const CheckoutPage: React.FC = () => {
  const cartCtx = useContext(CartContext);
  const orderCtx = useContext(OrderContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: 'Valued Customer', 
    cardNumber: '**** **** **** 1234',
    expiryDate: '12/27',
    cvv: '***',
    billingAddress: '123 Main Street, Anytown', 
    stateProvince: 'CA', 
    phoneNumber: '555-0123', 
    neighborhood: 'Central District', 
    paymentMethod: 'creditCard',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  if (!cartCtx || !orderCtx) {
    return <LoadingSpinner message="Loading Checkout..." />;
  }

  const { cart, getTotalPrice } = cartCtx;

  if (cart.length === 0 && !isLoading && !showOrderSuccessModal) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-display text-gumball-purple dark:text-gumball-purple/80">Your Cart is Empty!</h2>
        <p className="my-4 dark:text-gray-300">Add some products before checking out.</p>
        <Button as={Link} to="/" variant="primary">Go Shopping</Button>
      </div>
    );
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAutoFillAddress = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoadingLocation(true);
    toast.info("Requesting location permission...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        toast.success("Location pinpointed! Fetching address...");

        try {
          // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key for basic use)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.statusText}`);
          }
          const data = await response.json();
          
          let addressString = data.display_name || "Could not determine full address.";
          let state = data.address?.state || '';
          let district = data.address?.suburb || data.address?.borough || data.address?.district || '';

          setFormData(prev => ({
            ...prev,
            billingAddress: addressString,
            stateProvince: state,
            neighborhood: district,
          }));
          toast.success("Address auto-filled! Please verify.");

        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error("Could not fetch address details. Please enter manually.");
           setFormData(prev => ({
            ...prev,
            billingAddress: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (Manual entry recommended)`,
          }));
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Address can't be auto-filled.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable. Try again or enter manually.");
            break;
          case error.TIMEOUT:
            toast.error("The request to get user location timed out. Please try again.");
            break;
          default:
            toast.error("An unknown error occurred while getting location.");
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };


  const handleSubmitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty! Add some products first.");
      return;
    }
    // Basic validation example
    if (!formData.customerName.trim() || !formData.billingAddress.trim() || !formData.phoneNumber.trim() || !formData.stateProvince.trim() || !formData.neighborhood.trim()) {
        toast.warn("Please fill in all required address fields, including Phone, State, and Neighborhood.");
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newOrder = orderCtx.addOrder(
        formData.customerName, 
        cart, 
        getTotalPrice(),
        formData.billingAddress,
        formData.stateProvince,
        formData.phoneNumber,
        formData.neighborhood
      );
      setPlacedOrderId(newOrder.id);
      setIsLoading(false);
      setShowOrderSuccessModal(true);
    }, 2500);
  };
  
  const inputBaseClass = "mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-gumball-pink focus:border-gumball-pink dark:bg-gumball-dark dark:text-gumball-light-bg dark:placeholder-gray-400";


  return (
    <div className="container mx-auto p-4 md:p-8 animate-fadeIn">
      <h1 className="text-5xl font-display text-gumball-pink dark:text-gumball-pink/90 mb-8 text-center">Checkout</h1>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-[100]">
            <LoadingSpinner message="Processing your order..." color="text-gumball-yellow" size="lg" />
            <p className="text-gumball-yellow font-techno mt-4">Please wait a moment.</p>
        </div>
      )}

      {showOrderSuccessModal && placedOrderId && (
        <Modal isOpen={showOrderSuccessModal} onClose={() => {
          setShowOrderSuccessModal(false);
          navigate('/'); 
        }} title="Order Placed Successfully!">
          <div className="text-center">
            <p className="text-2xl font-display text-gumball-green mb-4">Success!</p>
            <p className="text-lg mb-2 dark:text-gray-200">Your order <strong className="text-gumball-pink break-all">{placedOrderId}</strong> has been placed successfully!</p>
            <p className="mb-6 dark:text-gray-300">You can track its progress.</p>
            <Button onClick={() => {
              setShowOrderSuccessModal(false);
              navigate(`/track-order/${placedOrderId}`);
            }} variant="secondary" className="mr-2 mb-2 sm:mb-0">
              Track Your Order
            </Button>
            <Button onClick={() => {
              setShowOrderSuccessModal(false);
              navigate('/');
            }} variant="primary">
              Continue Shopping
            </Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-gumball-dark-card p-6 rounded-xl shadow-lg order-last lg:order-first">
          <h2 className="text-2xl font-techno text-gumball-blue dark:text-gumball-blue/90 mb-6 border-b-2 pb-2 border-gumball-blue/30 dark:border-gumball-blue/50">Your Order Summary</h2>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-semibold dark:text-gray-200">{item.name} <span className="text-xs text-gray-500 dark:text-gray-400">(x{item.quantity})</span></p>
                <p className="text-xs text-gumball-pink dark:text-gumball-pink/80">${item.price.toFixed(2)} each</p>
              </div>
              <p className="font-semibold dark:text-gray-200">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t-2 border-gumball-blue/30 dark:border-gumball-blue/50">
            <p className="flex justify-between text-lg font-techno dark:text-gray-200">
              Subtotal: <span>${getTotalPrice().toFixed(2)}</span>
            </p>
            <p className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              Shipping: <span className="text-gumball-green">FREE (Standard Shipping)</span>
            </p>
            <p className="flex justify-between text-2xl font-display text-gumball-green mt-2">
              TOTAL: <span>${getTotalPrice().toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gumball-dark-card p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-techno text-gumball-purple dark:text-gumball-purple/90 mb-6">Delivery Information</h2>
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="customerName" id="customerName" value={formData.customerName} onChange={handleInputChange} required className={inputBaseClass} placeholder="e.g., John Doe"/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className={inputBaseClass} placeholder="e.g., 555-123-4567"/>
                </div>
                <div>
                    <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 dark:text-gray-300">State / Province</label>
                    <input type="text" name="stateProvince" id="stateProvince" value={formData.stateProvince} onChange={handleInputChange} required className={inputBaseClass} placeholder="e.g., California"/>
                </div>
            </div>

            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neighborhood / District</label>
              <input type="text" name="neighborhood" id="neighborhood" value={formData.neighborhood} onChange={handleInputChange} required className={inputBaseClass} placeholder="e.g., Downtown District"/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Street Address</label>
                <Button 
                    type="button" 
                    onClick={handleAutoFillAddress} 
                    variant="ghost" 
                    size="sm"
                    leftIcon={<LocationPinIcon />}
                    isLoading={isLoadingLocation}
                    disabled={isLoadingLocation}
                    className="text-xs"
                >
                    {isLoadingLocation ? "Locating..." : "Use My Location"}
                </Button>
              </div>
              <textarea name="billingAddress" id="billingAddress" value={formData.billingAddress} onChange={handleInputChange} required rows={3} className={inputBaseClass} placeholder="e.g., 123 Main St, Apt 4B, Anytown, CA 90210"/>
            </div>
            
            <h3 className="text-2xl font-techno text-gumball-purple dark:text-gumball-purple/90 mb-0 pt-4 border-t border-gray-200 dark:border-gray-700">Payment Details</h3>
            
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
              <input type="text" name="cardNumber" id="cardNumber" value={formData.cardNumber} onChange={handleInputChange} required className={inputBaseClass} placeholder="0000-0000-0000-0000"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date (MM/YY)</label>
                <input type="text" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required className={inputBaseClass} placeholder="MM/YY"/>
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                <input type="text" name="cvv" id="cvv" value={formData.cvv} onChange={handleInputChange} required className={inputBaseClass} placeholder="123"/>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <div className="flex flex-wrap gap-3">
                {(['creditCard', 'loyaltyPoints', 'giftCardBalance'] as const).map(method => (
                  <Button 
                    key={method}
                    type="button"
                    variant={formData.paymentMethod === method ? 'secondary' : 'ghost'}
                    onClick={() => setFormData(prev => ({...prev, paymentMethod: method}))}
                  >
                    {method === 'creditCard' ? 'Card' : method === 'loyaltyPoints' ? 'Loyalty Points' : 'Gift Card Balance'}
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full font-display text-xl" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? 'Processing Transaction...' : 'Place Order'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};