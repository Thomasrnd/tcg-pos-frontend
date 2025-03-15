import apiClient from './client';

const getAllProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

const createProduct = async (productData) => {
  // Use FormData for file uploads
  const formData = new FormData();
  
  Object.keys(productData).forEach(key => {
    if (key === 'productImage' && productData[key]) {
      formData.append(key, productData[key]);
    } else if (productData[key] !== undefined) {
      formData.append(key, productData[key]);
    }
  });
  
  const response = await apiClient.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

const updateProduct = async (id, productData) => {
  // Use FormData for file uploads
  const formData = new FormData();
  
  Object.keys(productData).forEach(key => {
    if (key === 'productImage' && productData[key]) {
      formData.append(key, productData[key]);
    } else if (productData[key] !== undefined) {
      formData.append(key, productData[key]);
    }
  });
  
  const response = await apiClient.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

const productService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;