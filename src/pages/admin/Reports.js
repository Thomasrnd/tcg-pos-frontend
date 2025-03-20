// src/pages/admin/Reports.js
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import reportService from '../../api/report.service';
import { formatIDR, formatImageUrl } from '../../utils/format';

const Reports = () => {
  // State for daily report
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dailyReportData, setDailyReportData] = useState(null);
  const [noSalesDaily, setNoSalesDaily] = useState(false);

  // Mutation for fetching daily report data
  const dailyReportMutation = useMutation(
    (date) => reportService.getDailySalesReport(date),
    {
      onSuccess: (data) => {
        if (data.data.productSales.length === 0) {
          setNoSalesDaily(true);
          setDailyReportData(null);
        } else {
          setDailyReportData(data.data);
          setNoSalesDaily(false);
        }
      },
      onError: (error) => {
        console.error('Failed to fetch daily report:', error);
      }
    }
  );

  const handleGenerateDailyReport = () => {
    dailyReportMutation.mutate(selectedDate);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render daily sales report
  const renderDailyReport = () => {
    if (dailyReportMutation.isLoading) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600">Generating daily report...</p>
        </div>
      );
    }
    
    if (noSalesDaily) {
      return (
        <Card>
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Sales Data</h3>
            <p className="text-gray-600">
              There were no sales recorded on {formatDate(selectedDate)}.
            </p>
          </div>
        </Card>
      );
    }
    
    if (dailyReportData) {
      return (
        <div className="space-y-6">
          <Card title={`Daily Sales Report for ${formatDate(selectedDate)}`}>
            {/* Summary */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-1">Total Sales</h3>
                <p className="text-2xl font-bold text-blue-700">{formatIDR(dailyReportData.totalSales)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-1">Orders Completed</h3>
                <p className="text-2xl font-bold text-green-700">{dailyReportData.totalOrders}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800 mb-1">Items Sold</h3>
                <p className="text-2xl font-bold text-purple-700">{dailyReportData.totalItems}</p>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Methods</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {dailyReportData.paymentMethods.map(method => (
                  <div
                    key={method.method}
                    className={`p-4 rounded-lg ${
                      method.method === 'BANK_TRANSFER' ? 'bg-purple-50' :
                      method.method === 'CASH' ? 'bg-green-50' :
                      method.method === 'QRIS' ? 'bg-blue-50' :
                      method.method === 'E_WALLET' ? 'bg-indigo-50' :
                      'bg-gray-50'
                    }`}
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      {method.name}
                    </h4>
                    <p className="text-2xl font-bold">
                      {formatIDR(method.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {method.count} order{method.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Category Sales Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {dailyReportData.categorySales && dailyReportData.categorySales.map(category => (
                  <div
                    key={category.name}
                    className="bg-blue-50 p-4 rounded-lg"
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-1">{category.name}</h4>
                    <p className="text-2xl font-bold">{formatIDR(category.revenue)}</p>
                    <p className="text-sm text-gray-500">{category.itemsSold} items sold</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Sales Table */}
            <h3 className="text-lg font-medium text-gray-800 mb-3">Product Sales</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyReportData.productSales.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.imageUrl ? (
                            <img
                              src={formatImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatIDR(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantitySold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatIDR(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Orders List */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyReportData.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.paymentMethod === 'BANK_TRANSFER' ? 'bg-purple-100 text-purple-800' :
                            order.paymentMethod === 'CASH' ? 'bg-green-100 text-green-800' :
                            order.paymentMethod === 'QRIS' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                            {order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' :
                            order.paymentMethod === 'CASH' ? 'Cash' :
                            order.paymentMethod === 'QRIS' ? 'QRIS' :
                            order.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatIDR(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      );
    }
    
    return null;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sales Reports</h1>

        {/* Date Selection */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Button
                onClick={handleGenerateDailyReport}
                disabled={dailyReportMutation.isLoading}
              >
                {dailyReportMutation.isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Report Results */}
        {renderDailyReport()}
      </div>
    </AdminLayout>
  );
};

export default Reports;