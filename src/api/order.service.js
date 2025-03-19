// src/api/order.service.js

import apiClient from './client';

const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

const uploadPaymentProof = async (orderId, file) => {
  const formData = new FormData();
  formData.append('paymentProof', file);
  
  const response = await apiClient.post(`/orders/${orderId}/payment-proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

const getOrderById = async (id) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

// New function to get available payment methods
const getPaymentMethods = async () => {
  const response = await apiClient.get('/orders/payment-methods/available');
  return response.data;
};

// Admin Only
const getAllOrders = async (params = {}) => {
  const response = await apiClient.get('/orders', { params });
  return response.data;
};

const verifyPayment = async (orderId) => {
  const response = await apiClient.post(`/orders/${orderId}/verify`);
  return response.data;
};

const completeOrder = async (orderId) => {
  const response = await apiClient.post(`/orders/${orderId}/complete`);
  return response.data;
};

const cancelOrder = async (orderId) => {
  const response = await apiClient.post(`/orders/${orderId}/cancel`);
  return response.data;
};

const getPendingOrdersCount = async () => {
  const response = await apiClient.get('/orders/notifications/pending-count');
  return response.data;
};

const getSalesSummary = async (params = {}) => {
  const response = await apiClient.get('/orders/analytics/sales-summary', { params });
  return response.data;
};

const orderService = {
  createOrder,
  uploadPaymentProof,
  getOrderById,
  getAllOrders,
  verifyPayment,
  completeOrder,
  cancelOrder,
  getPendingOrdersCount,
  getSalesSummary,
  getPaymentMethods,
};

export default orderService;