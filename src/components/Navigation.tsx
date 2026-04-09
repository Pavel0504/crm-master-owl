import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Box,
  ShoppingBag,
  Users as UsersIcon,
  ShoppingCart,
  Store,
  FolderTree,
  Truck,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Calendar,
  ListTodo,
  Info,
  ChevronLeft,
  ChevronRight,
  UserCog,
  ChefHat,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateShop } from '../services/shopService';
import { getEmployeeByUserId, Employee } from '../services/employeeService';


const allNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { path: '/planner', icon: Calendar, label: 'Планировщик' },
  { path: '/purchases', icon: ListTodo, label: 'Будущие покупки' },
  { path: '/shop', icon: Store, label: 'Магазин' },
  { path: '/categories', icon: FolderTree, label: 'Категории' },
  { path: '/suppliers', icon: Truck, label: 'Поставщики' },
  { path: '/materials', icon: Package, label: 'Материалы' },
  { path: '/inventory', icon: Box, label: 'Инвентарь' },
  { path: '/products', icon: ShoppingBag, label: 'Изделия' },
  { path: '/clients', icon: UsersIcon, label: 'Клиенты' },
  { path: '/orders', icon: ShoppingCart, label: 'Заказы' },
  { path: '/employees', icon: UserCog, label: 'Сотрудники' },
  { path: '/recipes', icon: ChefHat, label: 'Рецепты' },
  { path: '/about', icon: Info, label: 'О программе' },
];

export default function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [shopName, setShopName] = useState('Master Owl');
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allowedNavItems, setAllowedNavItems] = useState(allNavItems);

  useEffect(() => {
    if (user) {
      loadShopName();
      loadEmployeeAccess();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  const loadShopName = async () => {
    if (!user) return;

    const { data } = await getOrCreateShop(user.id);
    if (data) {
      if (data.name && data.name.trim() !== '') {
        setShopName(data.name);
      } else {
        setShopName('Master Owl');
      }

      if (data.logo && data.logo.trim() !== '') {
        setShopLogo(data.logo);
      } else {
        setShopLogo(null);
      }
    }
  };

  const loadEmployeeAccess = async () => {
    if (!user) return;

    const { data: employeeData } = await getEmployeeByUserId(user.id);

    if (employeeData) {
      setEmployee(employeeData);

      if (employeeData.role === 'admin') {
        setAllowedNavItems(allNavItems);
      } else {
        const filtered = allNavItems.filter((item) =>
          employeeData.allowed_pages.includes(item.path)
        );
        setAllowedNavItems(filtered);
      }
    } else {
      setAllowedNavItems(allNavItems);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg transition-all duration-200 press-effect hover:shadow-xl"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700 dark:text-gray-300 transition-transform duration-200" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300 transition-transform duration-200" />
        )}
      </button>

      {isCollapsed && (
        <button
          onClick={handleToggleCollapse}
          className="hidden lg:flex fixed top-4 left-0 z-40 h-12 w-8 bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 rounded-r-xl items-center justify-center shadow-lg hover:w-10 transition-all duration-300 ease-spring hover:shadow-xl"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl z-40
          transition-all duration-300 ease-spring
          flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-0 lg:-translate-x-full' : 'lg:w-[21rem] lg:translate-x-0'}
          w-64
          ${isCollapsed ? 'lg:overflow-hidden' : 'overflow-y-auto scrollbar-thin'}
        `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {shopLogo ? (
                  <img src={shopLogo} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🦉</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {shopName}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">CRM System</p>
              </div>
            </div>
            <button
              onClick={handleToggleCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ease-spring ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white shadow-md shadow-orange-500/20 dark:shadow-burgundy-700/30'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Темная тема</span>
              </>
            ) : (
              <>
                <Sun className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Светлая тема</span>
              </>
            )}
          </button>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 animate-overlay-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
