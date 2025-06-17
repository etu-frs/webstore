import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OrderContext } from '../App';
import { Order, OrderStatusUpdate } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';

const getStatusIcon = (status: OrderStatusUpdate['status']): string => {
  switch (status) {
    case 'Pending Approval': return '📝';
    case 'Processing': return '⚙️';
    case 'Preparing for Shipment': return '📦';
    case 'Shipped': return '🚚';
    case 'Delivered': return '✅';
    default: return '❓';
  }
};

export const TrackOrderPage: React.FC = () => {
  const { orderId: orderIdFromUrl } = useParams<{ orderId?: string }>();
  const orderCtx = useContext(OrderContext);
  const navigate = useNavigate();

  const [searchedOrderId, setSearchedOrderId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputOrderId, setInputOrderId] = useState<string>('');
  const [attemptedSearch, setAttemptedSearch] = useState<boolean>(false);

  useEffect(() => {
    if (!orderCtx) {
      setIsLoading(false);
      setCurrentOrder(null);
      setSearchedOrderId(null);
      setInputOrderId('');
      setAttemptedSearch(false);
      return; 
    }

    if (orderIdFromUrl) {
      setIsLoading(true);
      setCurrentOrder(null);
      setSearchedOrderId(orderIdFromUrl);
      setInputOrderId(orderIdFromUrl);
      setAttemptedSearch(true);

      const timerId = setTimeout(() => {
        try {
          if (!orderCtx) { 
            console.error("TrackOrderPage: OrderContext became undefined during search timeout.");
            setCurrentOrder(null);
            return;
          }
          const foundOrder = orderCtx.getOrderById(orderIdFromUrl);
          setCurrentOrder(foundOrder || null);
        } catch (e) {
          console.error(`TrackOrderPage: Error fetching/setting order for ${orderIdFromUrl}:`, e);
          setCurrentOrder(null);
        } finally {
          setIsLoading(false);
        }
      }, 700); 

      return () => {
        clearTimeout(timerId);
      };
    } else {
      setCurrentOrder(null);
      setSearchedOrderId(null);
      setInputOrderId('');
      setIsLoading(false);
      setAttemptedSearch(false);
    }
  }, [orderIdFromUrl, orderCtx]);

  const handleTrackOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOrderId = inputOrderId.trim();
    if (trimmedOrderId) {
      navigate(`/track-order/${trimmedOrderId}`);
    } else {
      navigate('/track-order/');
    }
  };

  if (!orderCtx && !isLoading) { // Ensure isLoading is also checked
    return <LoadingSpinner message="Order system is initializing..." />;
  }

  if (isLoading) {
    return <LoadingSpinner message={`Searching for order #${searchedOrderId || '...'}...`} />;
  }

  if (currentOrder && searchedOrderId) {
    return (
      <div className="container mx-auto p-4 md:p-8 animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-display text-gumball-pink dark:text-gumball-pink/90 mb-8 text-center">
          Order Tracking: <span className="text-gumball-blue dark:text-gumball-blue/80">#{currentOrder.id.substring(0, 12)}...</span>
        </h1>
        <div className="bg-white dark:bg-gumball-dark-card shadow-xl rounded-xl p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="font-techno text-xl text-gumball-dark dark:text-gumball-light-bg mb-1">Order ID:</h2>
              <p className="text-lg dark:text-gray-300">{currentOrder.id}</p>
            </div>
            <div>
              <h2 className="font-techno text-xl text-gumball-dark dark:text-gumball-light-bg mb-1">Customer:</h2>
              <p className="text-lg dark:text-gray-300">{currentOrder.customerName}</p>
            </div>
            <div>
              <h2 className="font-techno text-xl text-gumball-dark dark:text-gumball-light-bg mb-1">Order Date:</h2>
              <p className="text-lg dark:text-gray-300">{new Date(currentOrder.orderDate).toLocaleString()}</p>
            </div>
            <div>
              <h2 className="font-techno text-xl text-gumball-dark dark:text-gumball-light-bg mb-1">Total Price:</h2>
              <p className="text-lg font-semibold text-gumball-green">${currentOrder.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <h2 className="text-2xl font-techno text-gumball-purple dark:text-gumball-purple/80 mb-6">Order Status Timeline</h2>
          <div className="space-y-6 relative pl-8 border-l-2 border-gumball-pink/50 dark:border-gumball-pink/30">
            {currentOrder.statusHistory.map((update, index) => (
              <div key={index} className="relative pl-4 py-2">
                <div className={`absolute -left-[1.6rem] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xl shadow-md
                  ${index === currentOrder.statusHistory.length - 1 ? 'bg-gumball-green text-white animate-bounceOnce' : 'bg-gumball-pink text-white'}`}>
                  {getStatusIcon(update.status)}
                </div>
                <div className={`p-4 rounded-lg shadow-md ${index === currentOrder.statusHistory.length - 1 ? 'bg-gumball-green/10 dark:bg-gumball-green/5 border-l-4 border-gumball-green dark:border-gumball-green/70' : 'bg-gray-50 dark:bg-gumball-dark'}`}>
                  <p className={`font-display text-xl ${index === currentOrder.statusHistory.length - 1 ? 'text-gumball-green' : 'text-gumball-blue dark:text-gumball-blue/80'}`}>{update.status}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{new Date(update.timestamp).toLocaleString()}</p>
                  {update.notes && <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{update.notes}"</p>}
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-techno text-gumball-purple dark:text-gumball-purple/80 mt-10 mb-4">Items in this Order</h2>
          <div className="space-y-3">
              {currentOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gumball-dark rounded-md shadow-sm">
                      <div>
                          <p className="font-semibold dark:text-gray-200">{item.name} <span className="text-xs text-gray-500 dark:text-gray-400">(x{item.quantity})</span></p>
                      </div>
                      <p className="text-gumball-dark dark:text-gray-200">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
              ))}
          </div>

          <div className="mt-12 text-center">
            <Button as={Link} to="/" variant="primary" size="lg">
              Continue Shopping
            </Button>
             <Button as={Link} to="/track-order" variant="ghost" className="mt-4 ml-3" onClick={() => {
                setInputOrderId(''); 
                setAttemptedSearch(false);
                setCurrentOrder(null);
                setSearchedOrderId(null);
             }}>
              Track Another Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  let messageElement: React.ReactNode = null;
  if (attemptedSearch && searchedOrderId && !currentOrder && !isLoading) {
    messageElement = (
      <p className="mb-4 text-lg text-red-500">
        Order <strong className="font-semibold">{searchedOrderId}</strong> was not found. 
        Please check the Order ID and try again.
      </p>
    );
  } else if (!attemptedSearch && !isLoading) { 
    messageElement = (
      <p className="mb-4 text-lg text-gumball-dark dark:text-gumball-light-bg/80">Please enter your Order ID to track its status.</p>
    );
  }

  return (
    <div className="text-center py-10 animate-fadeIn">
      <img src="https://picsum.photos/seed/trackorder/200/150?gravity=center" alt="Order tracking illustration" className="mx-auto mb-6 rounded-lg shadow-lg opacity-80 dark:opacity-70" />
      <h1 className="text-4xl font-display text-gumball-purple dark:text-gumball-purple/80 mb-6">Track Your Order</h1>
      {messageElement}
      <form onSubmit={handleTrackOrderSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 p-4 bg-white/50 dark:bg-gumball-dark-card/50 rounded-lg shadow-md">
        <input
          type="text"
          value={inputOrderId}
          onChange={(e) => { setInputOrderId(e.target.value); }}
          placeholder="Enter Order ID (e.g., ORD-XYZ)"
          className="flex-grow p-3 border-2 border-gumball-purple dark:border-gumball-purple/70 focus:ring-gumball-pink focus:border-gumball-pink shadow-md rounded-lg text-lg font-techno dark:bg-gumball-dark dark:text-gumball-light-bg dark:placeholder-gray-400"
          aria-label="Order ID"
        />
        <Button type="submit" variant="primary" size="lg" className="font-techno text-lg">
          Track
        </Button>
      </form>
       <Button as={Link} to="/" variant="ghost" className="mt-8 text-gumball-blue hover:text-gumball-pink dark:text-gumball-blue/80 dark:hover:text-gumball-pink/80">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
        Back to Shopping
      </Button>
    </div>
  );
};