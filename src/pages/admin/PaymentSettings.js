// src/pages/admin/PaymentSettings.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import paymentSettingsService from '../../api/payment-settings.service';

const PaymentSettings = () => {
  const { isMasterAdmin } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      },
      onError: (error) => {
        console.error('Failed to update payment method setting:', error);
        setError(error.response?.data?.message || 'Failed to update payment method setting');
        setSuccess('');
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

  // Helper function to show payment method status
  const getPaymentMethodInfo = (method) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return { label: 'Bank Transfer', requiresProof: 'Yes' };
      case 'CASH':
        return { label: 'Cash', requiresProof: 'No' };
      case 'CREDIT_CARD':
        return { label: 'Credit Card', requiresProof: 'No' };
      case 'E_WALLET':
        return { label: 'E-Wallet', requiresProof: 'No' };
      default:
        return { label: method, requiresProof: 'Unknown' };
    }
  };

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
          <p className="mb-4 text-gray-600">Configure which payment methods are available to customers during checkout.</p>
          
          {isLoading ? (
            <p className="text-center py-4">Loading settings...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enabled
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {settings.map((setting) => {
                    const methodInfo = getPaymentMethodInfo(setting.method);
                    return (
                      <tr key={setting.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {setting.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {setting.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setting.isEnabled}
                              onChange={() => handleToggleEnabled(setting)}
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PaymentSettings;