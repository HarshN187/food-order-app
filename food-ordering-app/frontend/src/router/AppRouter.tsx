import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { Login } from '../pages/Login';
import { Unauthorized } from '../pages/Unauthorized';
import { Restaurants } from '../pages/Restaurants';
import { RestaurantDetail } from '../pages/RestaurantDetail';
import { Orders } from '../pages/Orders';
import { OrderDetail } from '../pages/OrderDetail';
import { PaymentMethods } from '../pages/PaymentMethods';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<MainLayout />}>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             {/* All Roles */}
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            
            {/* Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/payments" element={<PaymentMethods />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/restaurants" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
