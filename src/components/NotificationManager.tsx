import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from './ui';

export default function NotificationManager() {
  const { user } = useAuth();
  const { permissionState, requestPermission, checkAllNotifications } = useNotifications(user?.id);
  const [showBanner, setShowBanner] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (permissionState.supported && permissionState.permission === 'default') {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [permissionState]);

  useEffect(() => {
    if (user && permissionState.permission === 'granted') {
      checkAllNotifications();

      const interval = setInterval(() => {
        checkAllNotifications();
      }, 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, permissionState.permission]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowBanner(false);
      await checkAllNotifications();
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    const result = await checkAllNotifications();
    setChecking(false);

    if (result.materials === 0 && result.orders === 0) {
      new Notification('Все в порядке!', {
        body: 'Нет срочных уведомлений',
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-192x192.svg',
      });
    }
  };

  if (!permissionState.supported) {
    return null;
  }

  if (showBanner && permissionState.permission === 'default') {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Включить уведомления?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Получайте уведомления о низких остатках материалов и истекающих сроках заказов
            </p>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnableNotifications}
                className="flex-1"
              >
                Включить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="flex-1"
              >
                Не сейчас
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionState.permission === 'granted') {
    return (
      <button
        onClick={handleCheckNow}
        disabled={checking}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        title="Проверить уведомления"
      >
        <Bell className={`h-6 w-6 ${checking ? 'animate-pulse' : ''}`} />
      </button>
    );
  }

  if (permissionState.permission === 'denied') {
    return (
      <div className="fixed bottom-4 right-4 w-14 h-14 bg-gray-400 dark:bg-gray-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 opacity-50 cursor-not-allowed"
        title="Уведомления заблокированы"
      >
        <BellOff className="h-6 w-6" />
      </div>
    );
  }

  return null;
}
