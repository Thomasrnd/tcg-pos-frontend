import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import categoryService from '../../api/category.service';
import productService from '../../api/product.service';
import { formatImageUrl } from '../../utils/format';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'TCG_CARD',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  
  // Fetch product data if in edit mode
  const { data: productData, isLoading: productLoading } = useQuery(
    ['product', id],
    () => productService.getProductById(id),
    {
      enabled: isEditMode,
      onSuccess: (response) => {
        const product = response.data;
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          stock: product.stock.toString(),
          category: product.category,
        });
        
        if (product.imageUrl) {
          setImagePreview(formatImageUrl(product.imageUrl));
        }
      },
    }
  );
  
  // Create product mutation
  const createProductMutation = useMutation(
    (data) => productService.createProduct(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        navigate('/admin/products');
      },
      onError: (error) => {
        console.error('Failed to create product:', error);
        setError(error.response?.data?.message || 'Failed to create product');
      },
    }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'categories',
    () => categoryService.getAllCategories()
  );
  
  // Update product mutation
  const updateProductMutation = useMutation(
    ({ id, data }) => productService.updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries(['product', id]);
        navigate('/admin/products');
      },
      onError: (error) => {
        console.error('Failed to update product:', error);
        setError(error.response?.data?.message || 'Failed to update product');
      },
    }
  );
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price || !formData.stock) {
      setError('Name, price, and stock are required');
      return;
    }
    
    // Prepare form data for API
    const productFormData = { ...formData };
    
    // Add image file if selected
    if (imageFile) {
      productFormData.productImage = imageFile;
    }
    
    // Create or update product
    if (isEditMode) {
      updateProductMutation.mutate({ id, data: productFormData });
    } else {
      createProductMutation.mutate(productFormData);
    }
  };
  
  const categories = categoriesData?.data || [];
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        
        {productLoading ? (
          <div className="flex justify-center">
            <p className="text-gray-600">Loading product data...</p>
          </div>
        ) : (
          <Card>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* Product Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (Rp) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Stock */}
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                {/* Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-40 h-40 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                
                {/* Error message */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                {/* Submit buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/admin/products')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                  >
                    {createProductMutation.isLoading || updateProductMutation.isLoading
                      ? 'Saving...'
                      : isEditMode
                      ? 'Update Product'
                      : 'Create Product'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductForm;