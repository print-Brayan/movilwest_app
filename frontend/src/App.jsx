import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Inventario from './components/Inventario';
import Recargas from './components/Recargas';
import Caja from './components/Caja';
import AgregarProducto from './components/AgregarProducto';
import DashboardLayout from './components/DashboardLayout';
import { PrivateRoute, PublicRoute } from './components/RouteGuard';

const Dashboard = lazy(() => import('./components/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={(
            <PrivateRoute>
              <DashboardLayout>
                <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Cargando dashboard...</div>}>
                  <Dashboard />
                </Suspense>
              </DashboardLayout>
            </PrivateRoute>
          )}
        />

        {/* Login solo para usuarios sin sesión */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rutas privadas: requieren token */}
        <Route element={<PrivateRoute />}>
          <Route path="/inventario" element={<DashboardLayout><Inventario /></DashboardLayout>} />
          <Route path="/recargas" element={<DashboardLayout><Recargas /></DashboardLayout>} />
          <Route path="/agregar-producto" element={<AgregarProducto />} />
        </Route>

        <Route path="/caja" element={
          <PrivateRoute>
            <DashboardLayout>
              <Caja />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;