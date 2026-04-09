import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getEmployeeByInviteToken,
  joinEmployeeByToken,
  Employee,
} from '../services/employeeService';

export default function EmployeeRegister() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [inviteToken]);

  const loadEmployee = async () => {
    if (!inviteToken) {
      setError('Недействительная ссылка приглашения');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await getEmployeeByInviteToken(inviteToken);

    if (fetchError || !data) {
      setError('Приглашение не найдено или уже использовано');
    } else if (data.joined) {
      setError('Это приглашение уже было использовано');
    } else {
      setEmployee(data);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (!employee || !inviteToken) return;

    setSubmitting(true);

    const { error: signUpError } = await signUp(employee.email, password, employee.full_name);

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    const newUserId = session.session?.user?.id;

    if (!newUserId) {
      setError('Не удалось получить идентификатор пользователя');
      setSubmitting(false);
      return;
    }

    const { error: joinError } = await joinEmployeeByToken(inviteToken, newUserId);

    if (joinError) {
      setError('Не удалось присоединиться к системе');
      setSubmitting(false);
    } else {
      navigate('/dashboard');
    }
  };


  if (!employee || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Недействительная ссылка
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="text-orange-600 dark:text-burgundy-400 hover:text-orange-700 dark:hover:text-burgundy-300 font-medium transition-colors duration-200"
              >
                Вернуться к входу
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full mb-4">
              <span className="text-3xl">🦉</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Регистрация сотрудника</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Добро пожаловать, <strong>{employee.full_name}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl text-sm">
              <p>
                <strong>Email:</strong> {employee.email}
              </p>
              <p className="mt-1 text-xs">Создайте пароль для входа в систему</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-500 focus:border-transparent transition-all duration-200 shadow-sm focus:shadow-md"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Подтвердите пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-500 focus:border-transparent transition-all duration-200 shadow-sm focus:shadow-md"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-rose-600 dark:hover:from-burgundy-700 dark:hover:to-burgundy-800 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.97] flex items-center justify-center shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
