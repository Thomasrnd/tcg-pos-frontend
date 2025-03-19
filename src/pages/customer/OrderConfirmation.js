// src/pages/customer/OrderConfirmation.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import CustomerLayout from '../../layouts/CustomerLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import orderService from '../../api/order.service';
import { formatIDR } from '../../utils/format';

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);
  
  const { data, isLoading, error } = useQuery(['order', id], () => 
    orderService.getOrderById(id)
  );
  
  const order = data?.data;
  
  useEffect(() => {
    // For debugging
    console.log("OrderConfirmation component mounted with ID:", id);
    console.log("showPopup state:", showPopup);
  }, [id, showPopup]);
  
  // Close popup and navigate to product catalog
  const handleContinueShopping = () => {
    console.log("Continue shopping clicked");
    setShowPopup(false);
    navigate('/order/products');
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'CASH':
        return 'Cash';
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'E_WALLET':
        return 'E-Wallet';
      default:
        return method;
    }
  };
  
  return (
    <CustomerLayout>
      {/* Collection Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <svg 
                className="mx-auto h-16 w-16 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Completed!</h2>
            <p className="text-gray-600 mb-6">
              Please collect your items at the cashier. 
              Show your order ID: <span className="font-bold">{id}</span>
            </p>
            <Button 
              variant="primary" 
              className="w-full"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
      
      <div className="max-w-lg mx-auto">
        <Card className="text-center mb-6">
          <div className="py-6">
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h2>
            <p className="text-gray-600 mb-4">
              Your order has been placed and is being processed.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Order ID: <span className="font-medium">{id}</span>
            </p>
          </div>
        </Card>
        
        {isLoading ? (
          <p className="text-center text-gray-600">Loading order details...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Failed to load order details.
          </div>
        ) : order ? (
          <Card title="Order Details">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-700">Customer:</p>
                <p>{order.customerName}</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-700">Payment Method:</p>
                <p>{getPaymentMethodName(order.paymentMethod)}</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-700">Status:</p>
                <p>
                  {order.status === 'PENDING' && 'Pending'}
                  {order.status === 'PAYMENT_UPLOADED' && 'Payment Proof Uploaded'}
                  {order.status === 'PAYMENT_VERIFIED' && 'Payment Verified'}
                  {order.status === 'COMPLETED' && 'Completed'}
                  {order.status === 'CANCELLED' && 'Cancelled'}
                </p>
              </div>
              
              <div>
                <p className="font-medium text-gray-700 mb-2">Items:</p>
                {order.orderItems.map(item => (
                  <div key={item.id} className="flex justify-between mb-2">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>{formatIDR(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatIDR(order.totalAmount)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-medium text-gray-700 mb-2">Instructions:</p>
                {order.paymentMethod === 'CASH' ? (
                  <p className="text-gray-600">
                    Your order will be processed immediately.
                    Please proceed to the cashier to pay {formatIDR(order.totalAmount)} and collect your items.
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Your order will be processed as soon as your payment is verified.
                    Please proceed to the cashier to collect your items.
                  </p>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <p className="text-center text-gray-600">Order not found.</p>
        )}
        
        <div className="mt-6 text-center">
          <Button variant="primary" onClick={handleContinueShopping}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default OrderConfirmation;