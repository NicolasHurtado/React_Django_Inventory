import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';
import authService from './services/authService';

// Lazy load de las páginas para mejorar el rendimiento
import { lazy, Suspense } from 'react';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CompaniesPage = lazy(() => import('./pages/companies/CompaniesPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const InventoriesPage = lazy(() => import('./pages/inventories/InventoriesPage'));

// Componente de carga mientras se cargan los componentes lazy
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Componente para rutas protegidas
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente para rutas de admin
interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Inicializar el token de autenticación desde localStorage si existe
    authService.initAuthHeader();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Redirigir a login si se accede a la raíz */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas protegidas dentro del layout principal */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          } />
          
          <Route path="companies" element={
            <Suspense fallback={<LoadingFallback />}>
              <CompaniesPage />
            </Suspense>
          } />
          
          <Route path="products" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProductsPage />
            </Suspense>
          } />
          
          <Route path="inventories" element={
            <Suspense fallback={<LoadingFallback />}>
              <InventoriesPage />
            </Suspense>
          } />
        </Route>
        
        {/* Ruta de fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
