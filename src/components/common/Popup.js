import React from 'react';
import Button from './Button';

const Popup = ({ isOpen, onClose, title, message, buttonText = 'OK' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
        {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
        <p className="text-gray-600 mb-6">{message}</p>
        <Button 
          variant="primary" 
          className="w-full"
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default Popup;