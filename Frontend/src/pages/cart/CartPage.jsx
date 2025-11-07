import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { updateCartItem, removeFromCart } from '../../services/api';
import { CartContext } from '../../context/CartContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, loadCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove from cart if quantity becomes 0
      setLoading(true);
      try {
        await removeFromCart(itemId);
        await loadCart();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to remove item');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      await updateCartItem(itemId, newQuantity);
      await loadCart();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update cart');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      setLoading(true);
      try {
        await removeFromCart(itemId);
        await loadCart();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to remove item');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="container">
          <h1 className="page-title">Your Cart</h1>
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
    <div className="cart-container">
      <div className="container">
        <h1 className="page-title">Your Cart</h1>
        {error && <div className="error-message">{error}</div>}
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => {
              const price = parseFloat(item.price) || 0;
              return (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-description">{item.description || 'Delicious item'}</p>
                  <div className="cart-item-price">₹{price.toFixed(2)}</div>
                  {item.stock < item.quantity && (
                    <div className="stock-warning">
                      Only {item.stock} available in stock
                    </div>
                  )}
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)}
                      className="quantity-btn"
                      disabled={loading}
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                      className="quantity-btn"
                      disabled={item.quantity >= item.stock || loading}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ₹{(price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemove(item.item_id)}
                    className="btn-remove"
                    disabled={loading}
                  >
                    <FiTrash2 />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-checkout"
            >
              <FiShoppingCart />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

