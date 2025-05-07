import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, HomeIcon, BuildingOfficeIcon, ShoppingBagIcon, ClipboardDocumentListIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  current: boolean;
}

const NavItem = ({ to, icon, label, current }: NavItemProps) => {
  const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-md transition-all";
  const activeClasses = "bg-primary-700 text-white";
  const inactiveClasses = "text-gray-600 hover:bg-primary-50 hover:text-primary-700";
  
  return (
    <Link
      to={to}
      className={`${baseClasses} ${current ? activeClasses : inactiveClasses}`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigation = [
    { to: "/dashboard", icon: <HomeIcon />, label: "Inicio" },
    { to: "/companies", icon: <BuildingOfficeIcon />, label: "Empresas" },
    { to: "/products", icon: <ShoppingBagIcon />, label: "Productos" },
    { to: "/inventories", icon: <ClipboardDocumentListIcon />, label: "Inventario" },
  ];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserName(
        currentUser.username
          ? `${currentUser.username}`
          : currentUser.email
      );
      setUserRole(currentUser.role == 'ADMIN' ? 'Administrador' : 'Usuario Externo');
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Cierra el menú de usuario si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-0
      `}>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold text-primary-700">Lite Thinking</h1>
          <button 
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavItem 
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              current={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <div className="w-6 h-6">
              <ArrowRightOnRectangleIcon />
            </div>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center px-4">
          <button 
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="ml-auto relative" data-user-menu>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="bg-primary-100 p-2 rounded-full">
                <UserIcon className="w-5 h-5 text-primary-700" />
              </div>
              <span>{userName || 'Usuario'}</span>
            </button>

            {/* Menú desplegable de usuario */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-2 text-xs text-gray-500">
                  <div className="font-medium text-gray-900">{userName}</div>
                  <div>{userRole}</div>
                </div>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 