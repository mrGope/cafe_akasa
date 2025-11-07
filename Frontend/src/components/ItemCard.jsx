import React, { useState, useContext } from 'react';
import { FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { addToCart, updateCartItem, removeFromCart } from '../services/api';
import { CartContext } from '../context/CartContext';
import './ItemCard.css';

const ItemCard = ({ item, index = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageError, setImageError] = useState(false);
  const { cartItems, loadCart } = useContext(CartContext);

  // Find if this item is in the cart and get its quantity
  const cartItem = cartItems.find(cartItem => cartItem.item_id === item.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async () => {
    setLoading(true);
    setMessage('');
    try {
      await addToCart(item.id, 1);
      // setMessage('Added to cart!');
      loadCart(); // Reload cart to update count
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add to cart');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      // Remove from cart if quantity becomes 0
      setLoading(true);
      try {
        await removeFromCart(item.id);
        loadCart();
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to remove from cart');
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await updateCartItem(item.id, newQuantity);
      loadCart();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update cart');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isOutOfStock = item.stock === 0;
  const price = parseFloat(item.price) || 0;

  return (
    <div 
      className={`item-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="item-image">
        <img 
          src={imageError ? `https://source.unsplash.com/400x300/?${encodeURIComponent(item.name)}` : (item.image_url || `https://source.unsplash.com/400x300/?${encodeURIComponent(item.name)}`)} 
          alt={item.name}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {isOutOfStock && <div className="stock-badge">Out of Stock</div>}
        <div className="image-overlay"></div>
      </div>
      <div className="item-info">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description || 'Delicious item'}</p>
        <div className="item-footer">
          <span className="item-price">₹{price.toFixed(2)}</span>
          <span className="item-stock">
            <span className="stock-icon">📦</span> {item.stock} left
          </span>
        </div>
        {cartQuantity > 0 ? (
          <div className="item-quantity-controls">
            <button
              onClick={() => handleQuantityChange(cartQuantity - 1)}
              className="quantity-btn"
              disabled={loading || isOutOfStock}
            >
              <FiMinus />
            </button>
            <span className="quantity">{cartQuantity}</span>
            <button
              onClick={() => handleQuantityChange(cartQuantity + 1)}
              className="quantity-btn"
              disabled={loading || isOutOfStock || cartQuantity >= item.stock}
            >
              <FiPlus />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={loading || isOutOfStock}
            className={`btn-add-cart ${message && !message.includes('Failed') ? 'success' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding...
              </>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <FiShoppingCart className="cart-icon" />
                Add to Cart
              </>
            )}
          </button>
        )}
        {message && (
          <div className={`message ${message.includes('Failed') ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;

