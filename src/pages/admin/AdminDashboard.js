import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import orderService from '../../api/order.service';
import { formatIDR } from '../../utils/format';

const AdminDashboard = () => {
  // Fetch sales summary
  const { data: salesData, isLoading: salesLoading } = useQuery(
    'salesSummary',
    () => orderService.getSalesSummary(),
    {
      refetchInterval: 60000 // Refetch every minute
    }
  );
  
  // Fetch pending orders count
  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    'pendingOrders',
    () => orderService.getPendingOrdersCount(),
    { refetchInterval: 10000 } // Refetch every 10 seconds
  );
  
  const summary = salesData?.data || {};
  const pendingOrders = pendingData?.data?.count || 0;

  // Format month name
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const date = new Date(monthStr + '-01');
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
        
        {/* Daily Stats Overview */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">Daily Sales</p>
              {salesLoading ? (
                <p className="text-lg">Loading...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {formatIDR(summary.dailyTotalSales || 0)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Resets at midnight</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">Orders Completed Today</p>
              {salesLoading ? (
                <p className="text-lg">Loading...</p>
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {summary.dailyTotalOrders || 0}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Resets at midnight</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">Pending Orders</p>
              {pendingLoading ? (
                <p className="text-lg">Loading...</p>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-orange-500">
                    {pendingOrders}
                  </p>
                  {pendingOrders > 0 && (
                    <Link to="/admin/orders">
                      <Button className="mt-2" variant="primary" size="sm">
                        View Orders
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
        
        {/* Top Products */}
        <Card title={`Top Selling Products (${formatMonth(summary.timeInfo?.month)})`} className="mb-8">
          <p className="text-xs text-gray-500 mb-4">Resets on the first day of each month</p>
          
          {salesLoading ? (
            <p className="text-center py-4">Loading top products...</p>
          ) : summary.topSellingProducts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
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
                  {summary.topSellingProducts.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatIDR(product.totalAmount)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-600">
              No sales data available for this month yet.
            </p>
          )}
        </Card>
        
        {/* Recent Orders */}
        <Card title="Recent Orders">
          {salesLoading ? (
            <p className="text-center py-4">Loading recent orders...</p>
          ) : summary.recentOrders?.length > 0 ? (
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatIDR(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link to={`/admin/orders/${order.id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-600">
              No completed orders yet.
            </p>
          )}
        </Card>
      </div>
      
      <div className="flex space-x-4">
        <Link to="/admin/products">
          <Button variant="primary">
            Manage Products
          </Button>
        </Link>
        <Link to="/admin/orders">
          <Button variant="secondary">
            View All Orders
          </Button>
        </Link>
        <Link to="/admin/reports">
          <Button variant="success">
            Generate Reports
          </Button>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;