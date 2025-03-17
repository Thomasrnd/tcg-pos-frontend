// src/api/admin-management.service.js
import apiClient from './client';

const getAllAdmins = async () => {
  const response = await apiClient.get('/admin/all');
  return response.data;
};

const createAdmin = async (adminData) => {
  const response = await apiClient.post('/admin/create', adminData);
  return response.data;
};

const deleteAdmin = async (adminId) => {
  const response = await apiClient.delete(`/admin/${adminId}`);
  return response.data;
};

const adminManagementService = {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
};

export default adminManagementService;