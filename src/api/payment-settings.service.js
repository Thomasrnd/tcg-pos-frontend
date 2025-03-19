// src/api/payment-settings.service.js
import apiClient from './client';

const getAllPaymentMethodSettings = async () => {
  const response = await apiClient.get('/payment-settings');
  return response.data;
};

const updatePaymentMethodSetting = async (id, data) => {
  const response = await apiClient.put(`/payment-settings/${id}`, data);
  return response.data;
};

const getPaymentMethodDetail = async (method) => {
  const response = await apiClient.get(`/payment-settings/method/${method}`);
  return response.data;
};

const paymentSettingsService = {
  getAllPaymentMethodSettings,
  updatePaymentMethodSetting,
  getPaymentMethodDetail,
};

export default paymentSettingsService;