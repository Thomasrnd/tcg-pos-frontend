import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useCart } from '../../contexts/CartContext';
import { formatIDR, formatImageUrl } from '../../utils/format';

const ShoppingCart = () => {
  const { cartItems, updateQuantity, removeFromCart, calculateTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const totalAmount = calculateTotal();
  
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };
  
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };
  
  const handleContinueShopping = () => {
    navigate('/order/products');
  };
  
  const handleCheckout = () => {
    navigate('/order/checkout');
  };
  
  return (
    <CustomerLayout showBackButton={true}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <Card className="text-center py-8">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button onClick={handleContinueShopping}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.imageUrl ? (
                              <img
                                src={formatImageUrl(item.imageUrl)}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatIDR(item.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="bg-gray-200 px-2 py-1 rounded-l"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4 py-1 bg-gray-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="bg-gray-200 px-2 py-1 rounded-r"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatIDR(item.price * item.quantity)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleContinueShopping}>
                  Continue Shopping
                </Button>
                <Button variant="danger" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
              
              <Card className="p-4 md:w-64">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatIDR(totalAmount)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-blue-600">{formatIDR(totalAmount)}</span>
                </div>
                <Button variant="primary" className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ShoppingCart;