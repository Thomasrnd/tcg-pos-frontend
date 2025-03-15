import apiClient from './client';

const login = async (credentials) => {
  const response = await apiClient.post('/admin/login', credentials);
  return response.data;
};

const register = async (userData) => {
  const response = await apiClient.post('/admin/register', userData);
  return response.data;
};

const getProfile = async () => {
  const response = await apiClient.get('/admin/profile');
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await apiClient.put('/admin/profile', profileData);
  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
};

export default authService;