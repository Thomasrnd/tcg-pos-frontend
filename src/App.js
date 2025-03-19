import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Import pages
import LandingPage from './pages/landing/LandingPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import OrderList from './pages/admin/OrderList';
import OrderDetail from './pages/admin/OrderDetail';
import AdminManagement from './pages/admin/AdminManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import CustomerNameEntry from './pages/customer/CustomerNameEntry';
import ProductCatalog from './pages/customer/ProductCatalog';
import ShoppingCart from './pages/customer/ShoppingCart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import ProtectedRoute from './components/common/ProtectedRoute';
import Reports from './pages/admin/Reports';
import PaymentSettings from './pages/admin/PaymentSettings';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/new" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/:id" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/admin/admins" element={
                <ProtectedRoute>
                  <AdminManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute>
                  <CategoryManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/payment-settings" element={
                <ProtectedRoute>
                  <PaymentSettings />
                </ProtectedRoute>
              } />

              {/* Customer Routes */}
              <Route path="/order" element={<CustomerNameEntry />} />
              <Route path="/order/products" element={<ProductCatalog />} />
              <Route path="/order/cart" element={<ShoppingCart />} />
              <Route path="/order/checkout" element={<Checkout />} />
              <Route path="/order/confirmation/:id" element={<OrderConfirmation />} />

              {/* Redirect unknown routes to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;