import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-gray-100">
      {/* Admin Button in Top Right Corner */}
      <div className="absolute top-4 right-4">
        <Link to="/admin/login">
          <Button variant="secondary" className="text-sm px-3 py-1">
            Admin
          </Button>
        </Link>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="text-center mb-12">
          <Logo size="large" />
          <h2 className="mt-4 text-xl text-gray-600">Wanna order something?</h2>
        </div>
        
        <div className="flex flex-col items-center">
          <Link to="/order">
            <Button variant="primary" className="w-48 h-16 text-xl">
              Get In!
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;