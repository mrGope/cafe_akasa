import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHome, FiPackage, FiLogOut, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user ? "/home" : "/"} className="navbar-brand">
          <div className="brand-content">
            <img 
              src="https://assets.akasaair.com/f/167793/179x46/745ea0caf8/logo_white_tag-1.svg" 
              alt="Akasa Air Logo" 
              className="akasa-logo"
            />
            <h2>Cafe Akasa</h2>
          </div>
        </Link>
        <div className="navbar-right">
          <div className="navbar-links">
            {user ? (
              <>
                <Link to="/home" className="nav-link">
                  <FiHome className="nav-icon" />
                  <span>Home</span>
                </Link>
                <Link to="/cart" className="nav-link cart-link">
                  <div className="cart-icon-wrapper">
                    <FiShoppingCart className="nav-icon" />
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                  </div>
                  <span>Cart</span>
                </Link>
                <Link to="/orders" className="nav-link">
                  <FiPackage className="nav-icon" />
                  <span>Orders</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link btn-register">Register</Link>
              </>
            )}
          </div>
          {user && (
            <div className="navbar-user-section">
              <div className="nav-user">
                <FiUser className="user-icon" />
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

