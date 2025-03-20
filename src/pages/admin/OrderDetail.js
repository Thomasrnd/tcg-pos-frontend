// src/pages/admin/OrderDetail.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import orderService from '../../api/order.service';
import { formatIDR, formatImageUrl } from '../../utils/format';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch order details
  const { data, isLoading, refetch } = useQuery(
    ['order', id],
    () => orderService.getOrderById(id),
    {
      refetchInterval: 5000, // Refetch every 5 seconds to check for updates
    }
  );
  
  const order = data?.data;
  
  // Verify payment mutation
  const verifyPaymentMutation = useMutation(
    () => orderService.verifyPayment(id),
    {
      onSuccess: () => {
        setSuccess('Payment verified successfully');
        queryClient.invalidateQueries(['order', id]);
        refetch();
      },
      onError: (error) => {
        console.error('Failed to verify payment:', error);
        setError(error.response?.data?.message || 'Failed to verify payment');
      },
    }
  );

  // Complete order mutation
  const completeOrderMutation = useMutation(
    () => orderService.completeOrder(id),
    {
      onSuccess: () => {
        // Show alert and redirect to orders page
        alert('Order has been completed successfully!');
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries('orders');
        navigate('/admin/orders');
      },
      onError: (error) => {
        console.error('Failed to complete order:', error);
        setError(error.response?.data?.message || 'Failed to complete order');
      },
    }
  );

  // Cancel order mutation
  const cancelOrderMutation = useMutation(
    () => orderService.cancelOrder(id),
    {
      onSuccess: () => {
        // Show alert and redirect to orders page
        alert('Order has been cancelled!');
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries('orders');
        navigate('/admin/orders');
      },
      onError: (error) => {
        console.error('Failed to cancel order:', error);
        setError(error.response?.data?.message || 'Failed to cancel order');
      },
    }
  );

  const handleVerifyPayment = () => {
    setError('');
    setSuccess('');
    verifyPaymentMutation.mutate();
  };

  const handleCompleteOrder = () => {
    setError('');
    setSuccess('');
    completeOrderMutation.mutate();
  };

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setError('');
      setSuccess('');
      cancelOrderMutation.mutate();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAYMENT_UPLOADED: 'bg-orange-100 text-orange-800',
      PAYMENT_VERIFIED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      PENDING: 'Pending',
      PAYMENT_UPLOADED: 'Payment Uploaded',
      PAYMENT_VERIFIED: 'Payment Verified',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const styles = {
      BANK_TRANSFER: 'bg-purple-100 text-purple-800',
      CASH: 'bg-green-100 text-green-800',
      QRIS: 'bg-blue-100 text-blue-800',
      E_WALLET: 'bg-indigo-100 text-indigo-800',
    };
    
    const labels = {
      BANK_TRANSFER: 'Bank Transfer',
      CASH: 'Cash',
      QRIS: 'QRIS',
      E_WALLET: 'E-Wallet',
    };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[method] || 'bg-gray-100 text-gray-800'}`}>
        {labels[method] || method}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Order #{id}</h1>
          <Button variant="secondary" onClick={() => navigate('/admin/orders')}>
            Back to Orders
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading order details...</p>
          </div>
        ) : !order ? (
          <Card>
            <p className="text-center py-4 text-gray-600">Order not found</p>
          </Card>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Details */}
              <div className="lg:col-span-2">
                <Card title="Order Details">
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Payment Method:</span>
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Customer:</span>
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Amount:</span>
                      <span className="font-bold">{formatIDR(order.totalAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Items:</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.orderItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  {item.product.imageUrl ? (
                                    <img
                                      src={formatImageUrl(item.product.imageUrl)}
                                      alt={item.product.name}
                                      className="w-8 h-8 object-cover rounded mr-2"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded mr-2"></div>
                                  )}
                                  <span className="text-sm">{item.product.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {formatIDR(item.product.price)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                {formatIDR(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Order Actions and Payment Proof */}
              <div>
                {/* Payment Details */}
                {(order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'QRIS') && order.paymentProof ? (
                  <Card title={`${order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'QRIS'} Payment Proof`} className="mb-6">
                    <div className="flex flex-col items-center">
                      <img
                        src={formatImageUrl(order.paymentProof.fileUrl)}
                        alt="Payment proof"
                        className="w-full max-w-xs rounded border mb-2"
                      />
                      <p className="text-xs text-gray-500 mb-2">
                        Uploaded: {formatDate(order.paymentProof.createdAt)}
                      </p>
                    </div>
                  </Card>
                ) : (order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'QRIS') && order.status === 'PENDING' ? (
                  <Card title="Payment Status" className="mb-6">
                    <p className="text-center py-2 text-gray-600">
                      Customer has not uploaded payment proof yet.
                    </p>
                  </Card>
                ) : order.paymentMethod === 'CASH' ? (
                  <Card title="Cash Payment" className="mb-6">
                    <p className="text-center py-2 text-gray-600">
                      This is a cash payment order.
                      {order.status === 'PAYMENT_VERIFIED' && 
                        " Customer will pay at pickup."}
                    </p>
                  </Card>
                ) : null}
                
                {/* Order Actions */}
                <Card title="Actions">
                  <div className="space-y-2">
                    {/* Payment verification actions for methods requiring proof */}
                    {(order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'QRIS') && order.status === 'PAYMENT_UPLOADED' && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleVerifyPayment}
                        disabled={verifyPaymentMutation.isLoading}
                      >
                        {verifyPaymentMutation.isLoading ? 'Processing...' : `Verify ${
                          order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'QRIS'
                        } Payment`}
                      </Button>
                    )}
                    
                    {/* Cash payment specific actions */}
                    {order.paymentMethod === 'CASH' && order.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleVerifyPayment}
                        disabled={verifyPaymentMutation.isLoading}
                      >
                        {verifyPaymentMutation.isLoading ? 'Processing...' : 'Confirm Cash Payment'}
                      </Button>
                    )}
                    
                    {/* Common actions for all payment methods */}
                    {order.status === 'PAYMENT_VERIFIED' && (
                      <Button
                        variant="success"
                        className="w-full"
                        onClick={handleCompleteOrder}
                        disabled={completeOrderMutation.isLoading}
                      >
                        {completeOrderMutation.isLoading ? 'Processing...' : 'Complete Order'}
                      </Button>
                    )}
                    
                    {(order.status === 'PENDING' || order.status === 'PAYMENT_UPLOADED' || order.status === 'PAYMENT_VERIFIED') && (
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleCancelOrder}
                        disabled={cancelOrderMutation.isLoading}
                      >
                        {cancelOrderMutation.isLoading ? 'Processing...' : 'Cancel Order'}
                      </Button>
                    )}
                    
                    {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                      <p className="text-center py-2 text-gray-600">
                        No actions available for this order status.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;