import { useEffect, useState } from 'react';
import { BuildingOfficeIcon, ShoppingBagIcon, ClipboardDocumentListIcon, UserIcon } from '@heroicons/react/24/outline';
import authService from '../services/authService';

interface DashboardStats {
  totalCompanies: number;
  totalProducts: number;
  totalInventoryItems: number;
  userRole: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalProducts: 0,
    totalInventoryItems: 0,
    userRole: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Simulación de carga de estadísticas
    setTimeout(() => {
      setStats({
        totalCompanies: 5,
        totalProducts: 25,
        totalInventoryItems: 120,
        userRole: authService.isAdmin() ? 'Administrador' : 'Usuario Externo'
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido{user?.first_name ? `, ${user.first_name}` : ''}. Aquí tienes un resumen de tu sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Empresas</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalCompanies}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <ShoppingBagIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Productos</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <ClipboardDocumentListIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Items en Inventario</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalInventoryItems}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <UserIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rol de Usuario</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.userRole}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/companies" 
            className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-primary-600 mb-1">Gestionar Empresas</h3>
            <p className="text-sm text-gray-500">Añadir, editar o eliminar información de empresas.</p>
          </a>
          
          <a 
            href="/products" 
            className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-primary-600 mb-1">Gestionar Productos</h3>
            <p className="text-sm text-gray-500">Administrar el catálogo de productos disponibles.</p>
          </a>
          
          <a 
            href="/inventories" 
            className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-primary-600 mb-1">Generar Reportes</h3>
            <p className="text-sm text-gray-500">Crear y enviar reportes de inventario en PDF.</p>
          </a>
        </div>
      </div>
    </div>
  );
} 