import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import CustomerLayout from '../../layouts/CustomerLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useCart } from '../../contexts/CartContext';
import orderService from '../../api/order.service';
import { formatIDR } from '../../utils/format';

const Checkout = () => {
  const { cartItems, customerName, calculateTotal, clearCart } = useCart();
  const [paymentFile, setPaymentFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const totalAmount = calculateTotal();
  
  // Redirect to products if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/order/products');
    }
  }, [cartItems, navigate]);
  
  // Upload payment proof mutation
  const uploadPaymentProofMutation = useMutation(
    ({ orderId, file }) => orderService.uploadPaymentProof(orderId, file),
    {
      onError: (error) => {
        console.error('Failed to upload payment proof:', error);
        console.error('Error response:', error.response?.data);
      }
    }
  );

  // Create order mutation
  const createOrderMutation = useMutation(
    (orderData) => orderService.createOrder(orderData),
    {
      onSuccess: async (data) => {
        console.log('Order created successfully:', data);
        
        // Check if we have a valid order ID
        if (!data.data || !data.data.id) {
          console.error('Invalid order data received:', data);
          setError('Order was created but no order ID was received. Please contact support.');
          return;
        }
        
        const orderId = data.data.id;
        
        // Upload payment proof
        try {
          console.log('Uploading payment proof for order:', orderId);
          const uploadResult = await uploadPaymentProofMutation.mutateAsync({
            orderId: orderId,
            file: paymentFile
          });
          console.log('Payment proof uploaded successfully:', uploadResult);
          
          // Only clear cart and redirect on successful upload
          clearCart();
          alert(`Order Completed! Please collect your items at the cashier. Your Order ID: ${orderId}`);
          navigate('/order/products');
        } catch (err) {
          console.error('Failed to upload payment proof:', err);
          setError('Order created but failed to upload payment proof. Please contact support.');
        }
      },
      onError: (error) => {
        console.error('Failed to create order:', error);
        console.error('Error response:', error.response?.data);
        setError(error.response?.data?.message || 'Failed to create order. Please try again.');
      }
    }
  );
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentFile(file);
      setError(''); // Clear any previous errors
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate customer name
    if (!customerName) {
      setError('Customer name is required');
      return;
    }
    
    // Validate cart
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    // Validate payment proof
    if (!paymentFile) {
      setError('Please upload payment proof before placing your order');
      return;
    }
    
    // Format order data
    const orderData = {
      customerName,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };
    
    console.log('Submitting order with data:', orderData);
    
    // Create order
    createOrderMutation.mutate(orderData);
  };
  
  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <CustomerLayout showBackButton={true}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card title="Order Summary" className="h-fit">
            <div className="mb-4">
              <p className="font-medium text-gray-700 mb-2">Customer:</p>
              <p>{customerName}</p>
            </div>
            
            <div className="mb-4">
              <p className="font-medium text-gray-700 mb-2">Items:</p>
              {cartItems.map(item => (
                <div key={item.productId} className="flex justify-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatIDR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{formatIDR(totalAmount)}</span>
              </div>
            </div>
          </Card>
          
          {/* Payment Proof Upload */}
          <Card title="Payment" className="h-fit">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <p className="font-medium text-gray-700 mb-2">Payment Instructions:</p>
                <p className="text-gray-600 mb-2">
                  Please transfer the total amount to the following account:
                </p>
                <div className="bg-gray-100 p-4 rounded mb-4">
                  <p className="font-medium">Bank: BCA</p>
                  <p className="font-medium">Account: 5931065361</p>
                  <p className="font-medium">Name: Vincentius Geoffrey</p>
                  <p className="font-medium">Amount: {formatIDR(totalAmount)}</p>
                </div>
                <p className="text-gray-600 mb-4">
                  After making the payment, please upload your payment proof below.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Payment Proof: <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {!paymentFile && (
                  <p className="mt-1 text-sm text-red-500">
                    Payment proof is required to place an order
                  </p>
                )}
                {filePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <img
                      src={filePreview}
                      alt="Payment proof preview"
                      className="max-w-xs h-auto rounded border"
                    />
                  </div>
                )}
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/order/cart')}
                >
                  Back to Cart
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    createOrderMutation.isLoading || 
                    uploadPaymentProofMutation.isLoading || 
                    !paymentFile
                  }
                >
                  {createOrderMutation.isLoading || uploadPaymentProofMutation.isLoading
                    ? 'Processing...'
                    : 'Place Order'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Checkout;