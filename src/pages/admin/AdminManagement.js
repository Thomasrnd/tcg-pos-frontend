// src/pages/admin/AdminManagement.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import adminManagementService from '../../api/admin-management.service';

const AdminManagement = () => {
  const { isMasterAdmin } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  // Fetch all admins
  const { data, isLoading } = useQuery('admins', adminManagementService.getAllAdmins, {
    enabled: isMasterAdmin()
  });

  // Create admin mutation
  const createMutation = useMutation(
    (adminData) => adminManagementService.createAdmin(adminData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admins');
        setSuccess('Admin created successfully');
        setNewAdmin({ username: '', password: '' });
        setShowCreateForm(false);
        setError('');
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to create admin');
      }
    }
  );

  // Delete admin mutation
  const deleteMutation = useMutation(
    (adminId) => adminManagementService.deleteAdmin(adminId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admins');
        setSuccess('Admin deleted successfully');
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to delete admin');
      }
    }
  );

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    
    if (!newAdmin.username || !newAdmin.password) {
      setError('Username and password are required');
      return;
    }
    
    createMutation.mutate(newAdmin);
  };

  const handleDeleteAdmin = (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      deleteMutation.mutate(adminId);
    }
  };

  // Redirect if not a master admin
  if (!isMasterAdmin()) {
    return (
      <AdminLayout>
        <Card className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-4">
            You do not have permission to access this page.
            Only master admin can manage other admins.
          </p>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm}
          >
            Add New Admin
          </Button>
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

        {/* Create Admin Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Admin</h2>
            <form onSubmit={handleCreateAdmin}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewAdmin({ username: '', password: '' });
                    setError('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isLoading}
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Admin List */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Add Admin</h2>
          {isLoading ? (
            <p className="text-center py-4">Loading admins...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
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
                  {data?.data?.length > 0 ? (
                    data.data.map((admin) => (
                      <tr key={admin.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{admin.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            disabled={deleteMutation.isLoading}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No admin users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminManagement;