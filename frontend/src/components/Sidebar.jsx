import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Smartphone, Zap, LogOut, X, Wallet } from 'lucide-react';
import { clearSession } from '../utils/auth';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Caja Diaria', path: '/caja', icon: Wallet },
    { name: 'Inventario', path: '/inventario', icon: Smartphone },
    { name: 'Recargas', path: '/recargas', icon: Zap },
  ];

  const cerrarSesion = () => {
    clearSession();
    navigate('/login', { replace: true });
    onClose?.();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity duration-200 lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] transform flex-col bg-gray-900 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logotipo / Cabecera del menú */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide text-white">Movilwest</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="flex flex-1 flex-col space-y-2 px-4 py-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => onClose?.()}
                className={`group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-400'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Botón de salida en la parte inferior */}
        <div className="mt-auto border-t border-gray-800 p-4">
          <button
            onClick={cerrarSesion}
            className="group flex w-full items-center gap-x-3 rounded-lg p-3 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5 shrink-0 text-gray-400 transition-colors duration-200 group-hover:text-red-400" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}