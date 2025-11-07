import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrderHistory, getOrderDetails } from '../../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrderHistory();
      setOrders(response.data);
    } catch (error) {
      setError('Failed to load order history. Please try again.');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (orderId) => {
    if (selectedOrder === orderId && orderDetails) {
      setSelectedOrder(null);
      setOrderDetails(null);
      return;
    }

    setSelectedOrder(orderId);
    setLoadingDetails(true);
    try {
      const response = await getOrderDetails(orderId);
      setOrderDetails(response.data);
    } catch (error) {
      alert('Failed to load order details');
      console.error('Error loading order details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="container">
          <div className="loading">Loading order history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="container">
        <h1 className="page-title">Order History</h1>
        
        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="btn-primary">Browse Items</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header" onClick={() => handleOrderClick(order.id)}>
                  <div className="order-info">
                    <div className="order-id">Order #{order.id}</div>
                    <div className="order-tracking">Tracking ID: {order.tracking_id}</div>
                    <div className="order-date">
                      {new Date(order.order_date).toLocaleString()}
                    </div>
                  </div>
                  <div className="order-summary">
                    <div className="order-total">₹{(parseFloat(order.total_amount) || 0).toFixed(2)}</div>
                    <div
                      className="order-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </div>
                  </div>
                  <div className="order-toggle">
                    {selectedOrder === order.id ? '▼' : '▶'}
                  </div>
                </div>

                {selectedOrder === order.id && (
                  <div className="order-details">
                    {loadingDetails ? (
                      <div className="loading-details">Loading details...</div>
                    ) : orderDetails ? (
                      <div className="details-content">
                        <h3>Order Items</h3>
                        <div className="order-items-list">
                          {orderDetails.items.map((item) => {
                            const price = parseFloat(item.price) || 0;
                            return (
                            <div key={item.item_id} className="order-item">
                              <div className="order-item-info">
                                <img
                                  src={item.image_url || 'https://via.placeholder.com/60'}
                                  alt={item.name}
                                  className="order-item-image"
                                />
                                <div>
                                  <div className="order-item-name">{item.name}</div>
                                  <div className="order-item-quantity">
                                    Quantity: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="order-item-price">
                                ₹{(price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                            );
                          })}
                        </div>
                        <div className="order-total-section">
                          <div className="total-row">
                            <span>Total Amount:</span>
                            <span>₹{(parseFloat(orderDetails.total_amount) || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

