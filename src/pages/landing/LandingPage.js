import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center mb-12">
        <Logo size="large" />
        <h2 className="mt-4 text-xl text-gray-600">Trading Card Game Shop POS System</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <Link to="/order">
          <Button variant="primary" className="w-48 h-32 text-xl">
            Customer
          </Button>
        </Link>
        
        <Link to="/admin/login">
          <Button variant="secondary" className="w-48 h-32 text-xl">
            Admin
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;