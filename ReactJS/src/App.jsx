import HomePage from "./components/pages/home.jsx";
import LoginPage from "./components/pages/login.jsx";
import RegisterPage from "./components/pages/register.jsx";
import ForgotPasswordPage from "./components/pages/forgot-password.jsx";
import UserProfile from "./components/pages/user-profile.jsx";
import UserEditProfile from "./components/pages/user-edit-profile.jsx";
import AdminProfile from "./components/pages/admin-profile.jsx";
import AdminEditProfile from "./components/pages/admin-edit-profile.jsx";
import AdminOrdersPage from "./components/pages/admin-orders.jsx";
import ProductDetail from "./components/pages/product-detail.jsx";
import Header from "./components/layout/hearder.jsx";
import Footer from "./components/layout/footer.jsx";
import Products from "./components/pages/products.jsx";
import CartPage from "./components/pages/cart.jsx";
import CheckoutPage from "./components/pages/checkout.jsx";
import OrderHistoryPage from "./components/pages/orderHistory.jsx";
import RewardsPage from "./components/pages/rewards.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";
import PaymentSuccessPage from "./components/pages/PaymentSuccess.jsx";
import PaymentFailedPage from "./components/pages/PaymentFailed.jsx";

// Manager imports
import ManagerDashboard from "./components/pages/Manager/dashboard.jsx";
import ManagerProducts from "./components/pages/Manager/products.jsx";
import ManagerProductEdit from "./components/pages/Manager/product-edit.jsx";
import ManagerBrands from "./components/pages/Manager/brands.jsx";
import ManagerOrders from "./components/pages/Manager/orders.jsx";
import ManagerVouchers from "./components/pages/Manager/vouchers.jsx";
import ManagerPromotions from "./components/pages/Manager/promotions.jsx";
import ManagerCancellations from "./components/pages/Manager/cancellations.jsx";

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const showHeaderFooter = !authRoutes.includes(location.pathname) && !location.pathname.startsWith('/payment') && !location.pathname.startsWith('/manager');

  return (
    <>
      {showHeaderFooter && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment-succes" element={<PaymentSuccessPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout/:orderId" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/history" element={<OrderHistoryPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/edit-profile" element={<UserEditProfile />} />
        </Route>
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/edit-profile" element={<AdminEditProfile />} />
          <Route path="/admin/edit-profile/:userId" element={<AdminEditProfile />} />
        </Route>

        {/* Manager Routes */}
        <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']} />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/products" element={<ManagerProducts />} />
          <Route path="/manager/products/new" element={<ManagerProductEdit />} />
          <Route path="/manager/products/edit/:id" element={<ManagerProductEdit />} />
          <Route path="/manager/brands" element={<ManagerBrands />} />
          <Route path="/manager/orders" element={<ManagerOrders />} />
          <Route path="/manager/vouchers" element={<ManagerVouchers />} />
          <Route path="/manager/promotions" element={<ManagerPromotions />} />
          <Route path="/manager/cancellations" element={<ManagerCancellations />} />
        </Route>
      </Routes>
      {showHeaderFooter && <Footer />}
    </>
  );
}

export default App;
