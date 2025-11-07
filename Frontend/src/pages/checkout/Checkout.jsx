import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout } from '../../services/api';
import { CartContext } from '../../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, loadCart, loading: cartLoading } = useContext(CartContext);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      const response = await checkout();
      setOrderSuccess({
        orderId: response.data.order.id,
        trackingId: response.data.order.trackingId,
        totalAmount: response.data.order.totalAmount
      });
      // Reload cart to clear items after successful checkout
      await loadCart();
    } catch (error) {
      if (error.response?.data?.unavailableItems) {
        const unavailable = error.response.data.unavailableItems;
        setError(
          `Some items are not available:\n${unavailable.map(item => 
            `${item.name}: Requested ${item.requested}, Available ${item.available}`
          ).join('\n')}`
        );
      } else {
        setError(error.response?.data?.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  if (cartLoading) {
    return (
      <div className="checkout-container">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="checkout-container">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h1>Order Placed Successfully!</h1>
            <div className="order-details">
              <div className="detail-row">
                <span>Order ID:</span>
                <span>{orderSuccess.orderId}</span>
              </div>
              <div className="detail-row">
                <span>Tracking ID:</span>
                <span className="tracking-id">{orderSuccess.trackingId}</span>
              </div>
              <div className="detail-row">
                <span>Total Amount:</span>
                <span>₹{(parseFloat(orderSuccess.totalAmount) || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="success-actions">
              <button onClick={() => navigate('/orders')} className="btn-primary">
                View Orders
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="container">
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Browse Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        
        {error && (
          <div className="error-message" style={{ whiteSpace: 'pre-line' }}>
            {error}
          </div>
        )}

        <div className="checkout-content">
          <div className="order-items">
            <h2>Order Items</h2>
            {cartItems.map((item) => {
              const price = parseFloat(item.price) || 0;
              return (
              <div key={item.id} className="checkout-item">
                <div className="checkout-item-info">
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  {item.stock < item.quantity && (
                    <div className="stock-warning">
                      ⚠ Only {item.stock} available in stock
                    </div>
                  )}
                </div>
                <div className="checkout-item-price">
                  ₹{(price * item.quantity).toFixed(2)}
                </div>
              </div>
              );
            })}
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="summary-section">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="btn-place-order"
            >
              {processing ? 'Processing...' : 'Place Order'}
            </button>
            <p className="payment-note">
              * Payment is assumed to be completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

