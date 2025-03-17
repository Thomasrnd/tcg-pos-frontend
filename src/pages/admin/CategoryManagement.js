// src/pages/admin/CategoryManagement.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import categoryService from '../../api/category.service';

const CategoryManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const queryClient = useQueryClient();
  
  // Fetch all categories
  const { data, isLoading } = useQuery(
    'categories',
    () => categoryService.getAllCategories()
  );
  
  // Create category mutation
  const createMutation = useMutation(
    (categoryData) => categoryService.createCategory(categoryData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setSuccess('Category created successfully');
        setFormData({ name: '' });
        setShowForm(false);
        setError('');
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to create category');
      }
    }
  );
  
  // Update category mutation
  const updateMutation = useMutation(
    ({ id, data }) => categoryService.updateCategory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setSuccess('Category updated successfully');
        setFormData({ name: '' });
        setEditingCategory(null);
        setShowForm(false);
        setError('');
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to update category');
      }
    }
  );
  
  // Delete category mutation
  const deleteMutation = useMutation(
    (id) => categoryService.deleteCategory(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setSuccess('Category deleted successfully');
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  );
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleEdit = (category) => {
    setFormData({ name: category.name });
    setEditingCategory(category);
    setShowForm(true);
    setError('');
  };
  
  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '' });
    setError('');
  };
  
  const categories = data?.data || [];
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Product Categories</h1>
          {!showForm && (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Add New Category
            </Button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        
        {showForm && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelForm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {createMutation.isLoading || updateMutation.isLoading
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </Button>
              </div>
            </form>
          </Card>
        )}
        
        <Card>
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          {isLoading ? (
            <p className="text-center py-4">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-center py-4 text-gray-600">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(category)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CategoryManagement;