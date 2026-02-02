import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getEmployeeByUserId, ALL_PAGES } from '../services/employeeService';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui';

export default function NoAccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [firstAllowedPage, setFirstAllowedPage] = useState<string>('/dashboard');

  useEffect(() => {
    if (user) {
      loadFirstAllowedPage();
    }
  }, [user]);

  const loadFirstAllowedPage = async () => {
    if (!user) return;

    const { data: employee } = await getEmployeeByUserId(user.id);

    if (employee) {
      if (employee.role === 'admin') {
        setFirstAllowedPage('/dashboard');
      } else if (employee.allowed_pages.length > 0) {
        setFirstAllowedPage(employee.allowed_pages[0]);
      } else {
        setFirstAllowedPage('/about');
      }
    }
  };

  const handleReturn = () => {
    navigate(firstAllowedPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-rose-50 dark:from-gray-900 dark:via-burgundy-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-full mb-6">
            <span className="text-3xl">🦉</span>
          </div>

          <div className="mb-6">
            <ShieldOff className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Данная страница недоступна. Свяжитесь с вашим администратором для получения доступа.
            </p>
          </div>

          <Button variant="primary" onClick={handleReturn} fullWidth>
            Вернуться
          </Button>
        </div>
      </div>
    </div>
  );
}
