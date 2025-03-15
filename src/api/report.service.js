import apiClient from './client';

const getProductSalesReport = async (params = {}) => {
  const response = await apiClient.get('/orders/analytics/product-sales', { params });
  return response.data;
};

const getDailySalesReport = async (date) => {
  const response = await apiClient.get('/orders/analytics/daily-sales', { 
    params: { date } 
  });
  return response.data;
};

const reportService = {
  getProductSalesReport,
  getDailySalesReport,
};

export default reportService;