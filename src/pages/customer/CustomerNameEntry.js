import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useCart } from '../../contexts/CartContext';

const CustomerNameEntry = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { setCustomer } = useCart();
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    
    // Validate name (only allow letters, numbers, and spaces)
    if (!/^[a-zA-Z0-9 ]+$/.test(trimmedName)) {
      setError('Name can only contain letters, numbers, and spaces');
      return;
    }
    
    // Validate name length
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError('Name must be between 2 and 50 characters');
      return;
    }
    
    setCustomer(trimmedName);
    navigate('/order/products');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-8">
        <Logo size="large" />
        <h2 className="mt-2 text-xl text-gray-600">Welcome to our TCG Shop!</h2>
      </div>
      
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Please enter your name to continue
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
            {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              Back
            </Button>
            <Button type="submit" variant="primary">
              Continue to Order
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerNameEntry;