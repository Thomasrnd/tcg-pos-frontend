// src/pages/admin/PaymentSettings.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import paymentSettingsService from '../../api/payment-settings.service';
import { formatImageUrl } from '../../utils/format';

const PaymentSettings = () => {
  const { isMasterAdmin } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [qrisImageFile, setQrisImageFile] = useState(null);
  const [qrisImagePreview, setQrisImagePreview] = useState(null);
  const queryClient = useQueryClient();

  // Fetch payment method settings
  const { data, isLoading } = useQuery(
    'paymentMethodSettings',
    paymentSettingsService.getAllPaymentMethodSettings,
    {
      enabled: isMasterAdmin(),
      refetchOnWindowFocus: false
    }
  );

  // Update payment method setting mutation
  const updateSettingMutation = useMutation(
    ({ id, data }) => paymentSettingsService.updatePaymentMethodSetting(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethodSettings');
        setSuccess('Payment method settings updated successfully');
        setError('');
        setEditingId(null);
        setEditData({});
      },
      onError: (error) => {
        console.error('Failed to update payment method setting:', error);
        setError(error.response?.data?.message || 'Failed to update payment method setting');
        setSuccess('');
      }
    }
  );

  // Upload QRIS image mutation
  const uploadQrisImageMutation = useMutation(
    ({ id, file }) => {
      const formData = new FormData();
      formData.append('qrisImage', file);
      
      return paymentSettingsService.uploadQrisImage(id, formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethodSettings');
        setSuccess('QRIS image uploaded successfully');
        setQrisImageFile(null);
        setQrisImagePreview(null);
      },
      onError: (error) => {
        console.error('Failed to upload QRIS image:', error);
        setError(error.response?.data?.message || 'Failed to upload QRIS image');
      }
    }
  );

  // Handle toggle enabled status
  const handleToggleEnabled = (setting) => {
    updateSettingMutation.mutate({
      id: setting.id,
      data: {
        isEnabled: !setting.isEnabled
      }
    });
  };

  // Start editing a payment method
  const handleEdit = (setting) => {
    setEditingId(setting.id);
    setEditData({
      name: setting.name,
      description: setting.description,
      isEnabled: setting.isEnabled,
      requiresProof: setting.requiresProof,
      sortOrder: setting.sortOrder,
      bankName: setting.bankName || '',
      accountNumber: setting.accountNumber || '',
      accountHolder: setting.accountHolder || ''
    });
  };

  // Handle QRIS image change
  const handleQrisImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrisImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrisImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload QRIS image
  const handleUploadQrisImage = () => {
    if (!qrisImageFile) {
      setError('Please select a QRIS image to upload');
      return;
    }
    
    uploadQrisImageMutation.mutate({
      id: editingId,
      file: qrisImageFile
    });
  };

  // Save the edited payment method
  const handleSave = () => {
    updateSettingMutation.mutate({
      id: editingId,
      data: editData
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setQrisImageFile(null);
    setQrisImagePreview(null);
  };

  // Redirect if not a master admin
  if (!isMasterAdmin()) {
    return (
      <AdminLayout>
        <Card className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-4">
            You do not have permission to access this page.
            Only master admin can manage payment settings.
          </p>
        </Card>
      </AdminLayout>
    );
  }

  const settings = data?.data || [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Method Settings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <Card>
          <p className="mb-4 text-gray-600">Configure payment methods and details for customer checkout.</p>
          
          {isLoading ? (
            <p className="text-center py-4">Loading settings...</p>
          ) : (
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  {editingId === setting.id ? (
                    // Edit mode
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Edit Payment Method</h3>
                        <div className="space-x-2">
                          <Button
                            variant="secondary"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={updateSettingMutation.isLoading}
                          >
                            {updateSettingMutation.isLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={editData.name}
                            disabled={true}
                            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                          />
                          <p className="text-sm text-amber-600 font-medium mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Payment method names cannot be changed
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editData.description || ''}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            value={editData.sortOrder}
                            onChange={(e) => setEditData({...editData, sortOrder: parseInt(e.target.value) || 0})}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`enabled-${setting.id}`}
                              checked={editData.isEnabled}
                              onChange={(e) => setEditData({...editData, isEnabled: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`enabled-${setting.id}`} className="ml-2 block text-sm text-gray-700">
                              Enabled
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`proof-${setting.id}`}
                              checked={editData.requiresProof}
                              onChange={(e) => setEditData({...editData, requiresProof: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`proof-${setting.id}`} className="ml-2 block text-sm text-gray-700">
                              Requires Proof
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bank account details for Bank Transfer */}
                      {setting.method === 'BANK_TRANSFER' && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-md font-medium mb-2">Bank Account Details</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bank Name
                              </label>
                              <input
                                type="text"
                                value={editData.bankName || ''}
                                onChange={(e) => setEditData({...editData, bankName: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="e.g. BCA, Mandiri, BRI"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Number
                              </label>
                              <input
                                type="text"
                                value={editData.accountNumber || ''}
                                onChange={(e) => setEditData({...editData, accountNumber: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="e.g. 1234567890"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Holder Name
                              </label>
                              <input
                                type="text"
                                value={editData.accountHolder || ''}
                                onChange={(e) => setEditData({...editData, accountHolder: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="e.g. John Doe"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* QRIS Image Upload */}
                      {setting.method === 'QRIS' && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-md font-medium mb-2">QRIS Image</h4>
                          <div className="space-y-3">
                            {setting.qrisImageUrl && (
                              <div className="mb-2">
                                <p className="text-sm font-medium mb-1">Current QRIS Image:</p>
                                <img 
                                  src={formatImageUrl(setting.qrisImageUrl)} 
                                  alt="QRIS Code" 
                                  className="max-w-xs h-auto border rounded"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload New QRIS Image
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleQrisImageChange}
                                className="w-full text-sm text-gray-500 p-2 border border-gray-300 rounded"
                              />
                            </div>
                            {qrisImagePreview && (
                              <div>
                                <p className="text-sm font-medium mb-1">Preview:</p>
                                <img
                                  src={qrisImagePreview}
                                  alt="QRIS Preview"
                                  className="max-w-xs h-auto border rounded"
                                />
                              </div>
                            )}
                            <div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={handleUploadQrisImage}
                                disabled={!qrisImageFile || uploadQrisImageMutation.isLoading}
                              >
                                {uploadQrisImageMutation.isLoading ? 'Uploading...' : 'Upload QRIS Image'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">{setting.name}</h3>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                          
                          {/* Show bank details if it's a bank transfer */}
                          {setting.method === 'BANK_TRANSFER' && (
                            <div className="mt-2 text-sm">
                              {(setting.bankName || setting.accountNumber || setting.accountHolder) ? (
                                <div className="bg-gray-50 p-2 rounded">
                                  {setting.bankName && <p><span className="font-medium">Bank:</span> {setting.bankName}</p>}
                                  {setting.accountNumber && <p><span className="font-medium">Account:</span> {setting.accountNumber}</p>}
                                  {setting.accountHolder && <p><span className="font-medium">Name:</span> {setting.accountHolder}</p>}
                                </div>
                              ) : (
                                <p className="text-yellow-600">No bank account details configured</p>
                              )}
                            </div>
                          )}
                          
                          {/* Show QRIS image if it's QRIS */}
                          {setting.method === 'QRIS' && (
                            <div className="mt-2 text-sm">
                              {setting.qrisImageUrl ? (
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="font-medium mb-1">QRIS Image:</p>
                                  <img
                                    src={formatImageUrl(setting.qrisImageUrl)}
                                    alt="QRIS Code"
                                    className="w-32 h-auto border rounded"
                                  />
                                </div>
                              ) : (
                                <p className="text-yellow-600">No QRIS image configured</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={setting.isEnabled}
                              onChange={() => handleToggleEnabled(setting)}
                              className="h-5 w-5 text-blue-600"
                              id={`toggle-${setting.id}`}
                            />
                            <label htmlFor={`toggle-${setting.id}`} className="ml-2 text-sm">
                              {setting.isEnabled ? 'Enabled' : 'Disabled'}
                            </label>
                          </div>
                          
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(setting)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PaymentSettings;