import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePages";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuthSync } from "./hooks/useAuthSync";
import "./index.css";
import { ProductList } from "./pages/ProductListPage";
import { ProductDetail } from "./pages/ProductDetailPage";
import { AdminRoute } from "./components/auth/AdminRoute";
import { Dashboard } from "./pages/admin/Dashboard";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProductPage } from "./pages/admin/products/ProductPage";
import { UserList } from "./pages/admin/ีusers/UserList";
import { OrderList } from "./pages/admin/order/AdminOrderList";
import CartPage from "./pages/CartPage";
import { UserLayout } from "./components/ui/UserLayout";
import CheckoutPage from "./pages/CheckOutPage";
import LoginPage from "./pages/LoginPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

function App() {
  useAuthSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          {/* --- Protected Route --- */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="users" element={<UserList />} />
          <Route path="orders" element={<OrderList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
