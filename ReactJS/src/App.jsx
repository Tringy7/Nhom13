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
import VnPayReturn from "./components/pages/VnPayReturn.jsx";

// ── Admin imports ──────────────────────────────────────────────────────────
import AdminLayout from "./components/layout/AdminLayout.jsx";
import AdminDashboardPage from "./components/pages/admin/AdminDashboardPage.jsx";
import AdminUsersPage from "./components/pages/admin/AdminUsersPage.jsx";
import AdminManagerPage from "./components/pages/admin/AdminManagerPage.jsx";
import AdminShipperPage from "./components/pages/admin/AdminShipperPage.jsx";
import AdminOrderPage from "./components/pages/admin/AdminOrderPage.jsx";
import AdminCancelRequestPage from "./components/pages/admin/AdminCancelRequestPage.jsx";
import AdminRevenuePage from "./components/pages/admin/AdminRevenuePage.jsx";
import AdminSettingsPage from "./components/pages/admin/AdminSettingsPage.jsx";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/forgot-password"];

  // Ẩn Header/Footer ở trang auth, payment VÀ toàn bộ trang /admin/*
  const showHeaderFooter =
    !authRoutes.includes(location.pathname) &&
    !location.pathname.startsWith("/payment") &&
    !location.pathname.startsWith("/admin");

  return (
    <>
      {showHeaderFooter && <Header />}
      <Routes>
        {/* ── Public Routes ──────────────────────────────────────────── */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/home"           element={<HomePage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/product/:id"    element={<ProductDetail />} />
        <Route path="/products"       element={<Products />} />
        <Route path="/payment/success"      element={<PaymentSuccessPage />} />
        <Route path="/payment/failed"       element={<PaymentFailedPage />} />
        <Route path="/payment/vnpay-return" element={<VnPayReturn />} />

        {/* ── User Protected Routes ───────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart"         element={<CartPage />} />
          <Route path="/checkout/new" element={<CheckoutPage />} />
          <Route path="/orders"       element={<OrderHistoryPage />} />
          <Route path="/history"      element={<OrderHistoryPage />} />
          <Route path="/rewards"      element={<RewardsPage />} />
          <Route path="/user/profile"      element={<UserProfile />} />
          <Route path="/user/edit-profile" element={<UserEditProfile />} />
        </Route>

        {/* ── Admin Routes (dùng ProtectedRoute có sẵn + AdminLayout) ─── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"      element={<AdminDashboardPage />} />
            <Route path="users"          element={<AdminUsersPage />} />
            <Route path="managers"       element={<AdminManagerPage />} />
            <Route path="shippers"       element={<AdminShipperPage />} />
            <Route path="orders"         element={<AdminOrderPage />} />
            <Route path="cancel-requests" element={<AdminCancelRequestPage />} />
            <Route path="revenue"        element={<AdminRevenuePage />} />
            <Route path="settings"       element={<AdminSettingsPage />} />

            {/* Giữ lại route cũ đã có */}
            <Route path="profile"        element={<AdminProfile />} />
            <Route path="edit-profile"   element={<AdminEditProfile />} />
            <Route path="edit-profile/:userId" element={<AdminEditProfile />} />
          </Route>
        </Route>
      </Routes>
      {showHeaderFooter && <Footer />}
    </>
  );
}

export default App;
