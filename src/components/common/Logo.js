import React from 'react';

const Logo = ({ size = 'medium' }) => {
  const sizes = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  };
  
  return (
    <div className={`font-bold ${sizes[size]} text-blue-600`}>
      TCG Shop
    </div>
  );
};

export default Logo;