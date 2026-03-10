import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, MainLayout } from '../components/layout';
import { Login, Unauthorized, Restaurants, RestaurantDetail, Orders, OrderDetail, PaymentMethods } from '../pages';

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
