import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import categoryService from '../../api/category.service';
import Toast from '../../components/common/Toast';
import { useCart } from '../../contexts/CartContext';
import productService from '../../api/product.service';
import { formatIDR, formatImageUrl } from '../../utils/format';

const ProductCatalog = () => {
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Fetch products
  const { data, isLoading, error } = useQuery('products', () => 
    productService.getAllProducts({ inStock: 'true' })
  );
  
  // Fetch categories
  const { data: categoriesData } = useQuery('categories', () => categoryService.getAllCategories());
  const categories = [
    { id: 'ALL', name: 'All Products' },
    ...(categoriesData?.data?.map(cat => ({ id: cat.id.toString(), name: cat.name })) || [])
  ];
  
  // Filter products by category
  const filteredProducts = data?.data?.filter(product => 
    filter === 'ALL' || product.categoryId.toString() === filter
  ) || [];
  
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Show toast notification
    setToast({
      visible: true,
      message: `${product.name} added to cart`,
      type: 'success'
    });
  };
  
  const closeToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };
  
  return (
    <CustomerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Catalog</h1>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {isLoading && <p className="text-gray-600">Loading products...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Failed to load products. Please try again.
          </div>
        )}
        
        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="h-full flex flex-col">
              <div className="flex-1">
                {product.imageUrl ? (
                  <img
                    src={formatImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4 rounded">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                
                <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <p className="text-blue-600 font-bold mb-2">{formatIDR(product.price)}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {product.stock > 10 
                    ? 'In Stock' 
                    : `Only ${product.stock} left`}
                </p>
              </div>
              
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                disabled={product.stock <= 0}
              >
                Add to Cart
              </Button>
            </Card>
          ))}
        </div>
        
        {filteredProducts.length === 0 && !isLoading && (
          <p className="text-gray-600 my-8 text-center">No products found in this category.</p>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/order')}>
          Change Customer
        </Button>
        <Button variant="primary" onClick={() => navigate('/order/cart')}>
          View Cart
        </Button>
      </div>
      
      {/* Toast notification */}
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </CustomerLayout>
  );
};

export default ProductCatalog;