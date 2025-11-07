import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const register = (email, password) => {
  return api.post('/auth/register', { email, password });
};

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Items API
export const getCategories = () => {
  return api.get('/items/categories');
};

export const getItems = (categoryId) => {
  const url = categoryId && categoryId !== 'All' && categoryId !== '0' 
    ? `/items?category=${categoryId}` 
    : '/items';
  return api.get(url);
};

// Cart API
export const getCart = () => {
  return api.get('/cart');
};

export const addToCart = (itemId, quantity) => {
  return api.post('/cart', { itemId, quantity });
};

export const updateCartItem = (itemId, quantity) => {
  return api.put(`/cart/${itemId}`, { quantity });
};

export const removeFromCart = (itemId) => {
  return api.delete(`/cart/${itemId}`);
};

// Orders API
export const checkout = () => {
  return api.post('/orders/checkout');
};

export const getOrderHistory = () => {
  return api.get('/orders');
};

export const getOrderDetails = (orderId) => {
  return api.get(`/orders/${orderId}`);
};

export default api;

