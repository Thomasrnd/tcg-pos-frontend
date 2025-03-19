// src/pages/customer/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('BANK_TRANSFER');
  const navigate = useNavigate();
  
  const totalAmount = calculateTotal();
  
  // Fetch available payment methods
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery(
    'paymentMethods',
    () => orderService.getPaymentMethods()
  );
  
  const paymentMethods = paymentMethodsData?.data?.methods || [];
  
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
        
        // For payment methods that require proof (like bank transfer), upload it
        const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
        if (selectedMethod?.requiresProof && paymentFile) {
          try {
            console.log('Uploading payment proof for order:', orderId);
            const uploadResult = await uploadPaymentProofMutation.mutateAsync({
              orderId: orderId,
              file: paymentFile
            });
            console.log('Payment proof uploaded successfully:', uploadResult);
          } catch (err) {
            console.error('Failed to upload payment proof:', err);
            setError('Order created but failed to upload payment proof. Please contact support.');
            return;
          }
        }
        
        // Clear cart and redirect
        clearCart();
        alert(`Order Completed! Please collect your items at the cashier. Your Order ID: ${orderId}`);
        navigate('/order/products');
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
  
  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
    // If switching to a method that doesn't need proof, clear any uploaded file
    const methodRequiresProof = paymentMethods.find(m => m.id === e.target.value)?.requiresProof;
    if (!methodRequiresProof) {
      setPaymentFile(null);
      setFilePreview(null);
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
    
    // Check if payment proof is required but not provided
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    if (selectedMethod?.requiresProof && !paymentFile) {
      setError('Please upload payment proof before placing your order');
      return;
    }
    
    // Format order data
    const orderData = {
      customerName,
      paymentMethod: selectedPaymentMethod,
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
  
  // Determine if selected payment method requires proof
  const selectedMethodRequiresProof = paymentMethods.find(m => m.id === selectedPaymentMethod)?.requiresProof;
  
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
          
          {/* Payment Section */}
          <Card title="Payment" className="h-fit">
            <form onSubmit={handleSubmit}>
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Payment Method: <span className="text-red-500">*</span>
                </label>
                {paymentMethodsLoading ? (
                  <div className="text-sm text-gray-500">Loading payment methods...</div>
                ) : (
                  <div className="space-y-2">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center">
                        <input
                          type="radio"
                          id={`method-${method.id}`}
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={handlePaymentMethodChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`method-${method.id}`} className="ml-2 block text-sm text-gray-700">
                          {method.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Payment Instructions */}
              {selectedPaymentMethod === 'BANK_TRANSFER' && (
                <div className="mb-4">
                  <p className="font-medium text-gray-700 mb-2">Bank Transfer Instructions:</p>
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
              )}
              
              {selectedPaymentMethod === 'CASH' && (
                <div className="mb-4">
                  <p className="font-medium text-gray-700 mb-2">Cash Payment Instructions:</p>
                  <p className="text-gray-600 mb-4">
                    Please prepare {formatIDR(totalAmount)} in cash. 
                    You'll pay directly at the cashier when you pick up your items.
                  </p>
                </div>
              )}
              
              {/* Payment Proof Upload (only for methods that require it) */}
              {selectedMethodRequiresProof && (
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
                      Payment proof is required for bank transfer
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
              )}
              
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
                    (selectedMethodRequiresProof && !paymentFile)
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