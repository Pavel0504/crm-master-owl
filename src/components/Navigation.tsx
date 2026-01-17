import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Box,
  ShoppingBag,
  Users,
  ShoppingCart,
  Store,
  FolderTree,
  Sun,
  Moon,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { path: '/shop', icon: Store, label: 'Магазин' },
  { path: '/categories', icon: FolderTree, label: 'Категории' },
  { path: '/materials', icon: Package, label: 'Материалы' },
  { path: '/inventory', icon: Box, label: 'Инвентарь' },
  { path: '/products', icon: ShoppingBag, label: 'Изделия' },
  { path: '/clients', icon: Users, label: 'Клиенты' },
  { path: '/orders', icon: ShoppingCart, label: 'Заказы' },
];

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-40
          transition-transform duration-300 ease-in-out
          w-64 flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-800 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🦉</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Master Owl</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">CRM System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-5 w-5" />
                <span className="font-medium">Темная тема</span>
              </>
            ) : (
              <>
                <Sun className="h-5 w-5" />
                <span className="font-medium">Светлая тема</span>
              </>
            )}
          </button>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
