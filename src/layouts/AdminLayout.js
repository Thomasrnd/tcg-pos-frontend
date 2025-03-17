// src/layouts/AdminLayout.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import Logo from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../api/order.service';

const AdminLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: pendingData } = useQuery(
    'pendingOrdersCount',
    () => orderService.getPendingOrdersCount(),
    { 
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchIntervalInBackground: true
    }
  );

  const pendingCount = pendingData?.data?.count || 0;
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };
  
  // Base navigation items for all admins
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'chart-pie' },
    { name: 'Products', path: '/admin/products', icon: 'cube' },
    { name: 'Orders', path: '/admin/orders', icon: 'shopping-cart' },
    { name: 'Reports', path: '/admin/reports', icon: 'document-report' },
  ];
  
  // Add Admin Management link for master admin
  if (isMasterAdmin()) {
    navItems.push({ name: 'Add Admin', path: '/admin/admins', icon: 'user-group' });
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="flex-shrink-0">
                <Logo size="small" />
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(item.path)} ${
                        item.name === 'Orders' ? 'relative' : ''
                      }`}
                    >
                      {item.name}
                      {item.name === 'Orders' && pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <div className="flex items-center">
                    <span className="mr-3">
                      {currentUser?.username}
                      {isMasterAdmin() && (
                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          Master
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-blue-700 p-1 rounded-full hover:bg-blue-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-blue-700 p-2 rounded-md inline-flex items-center justify-center hover:bg-blue-800"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon for menu */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)} ${
                    item.name === 'Orders' ? 'relative' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                  {item.name === 'Orders' && pendingCount > 0 && (
                    <span className="absolute top-2 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-blue-700">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium">
                    {currentUser?.username}
                    {isMasterAdmin() && (
                      <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                        Master
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
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

export default AdminLayout;