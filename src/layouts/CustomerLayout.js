import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { useCart } from '../contexts/CartContext';
import { formatIDR } from '../utils/format';

const CustomerLayout = ({ children, showBackButton = false }) => {
  const { cartItems, customerName, calculateTotal } = useCart();
  const navigate = useNavigate();
  
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = calculateTotal();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and back button */}
            <div className="flex items-center">
              {showBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  className="mr-3 px-2 py-1 bg-blue-700 rounded hover:bg-blue-800 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <Link to="/" className="flex-shrink-0">
                <Logo size="small" />
              </Link>
            </div>
            
            {/* Right side - Customer name and cart */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{customerName}</span>
              </div>
              
              <Link to="/order/cart" className="flex items-center px-3 py-2 rounded hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium hidden sm:inline">{itemCount} items ({formatIDR(cartTotal)})</span>
                <span className="font-medium sm:hidden">{itemCount}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;