import { useEffect, useState } from 'react';
import { Bolt Database } from '../lib/supabase';

export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
}

export function useNotifications(userId: string | undefined) {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: 'default',
    supported: false,
  });
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState({
        permission: Notification.permission,
        supported: true,
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setServiceWorkerRegistration(registration);
      });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermissionState({
      permission,
      supported: true,
    });

    return permission === 'granted';
  };

  const getMoscowTime = (): Date => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const moscowTime = new Date(utc + (3600000 * 3));
    return moscowTime;
  };

  const checkMaterialsLowStock = async () => {
    if (!userId || Notification.permission !== 'granted') return;

    const { data: materials } = await Bolt Database
      .from('materials')
      .select('id, name, initial_volume, remaining_volume, archived')
      .eq('user_id', userId)
      .eq('archived', false);

    if (!materials) return;

    const lowStockMaterials = materials.filter((material) => {
      const percentage = (material.remaining_volume / material.initial_volume) * 100;
      return percentage < 40 && percentage > 0;
    });

    for (const material of lowStockMaterials) {
      const percentage = Math.round(
        (material.remaining_volume / material.initial_volume) * 100
      );

      if (serviceWorkerRegistration) {
        await serviceWorkerRegistration.showNotification('Низкий остаток материала!', {
          body: `${material.name}: осталось ${percentage}%`,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-192x192.svg',
          tag: `material-${material.id}`,
          requireInteraction: false,
          silent: false,
          data: {
            materialId: material.id,
            materialName: material.name,
            percentage,
          },
          actions: [
            {
              action: 'add-to-purchase',
              title: 'В закупку',
            },
            {
              action: 'archive-material',
              title: 'В архив',
            },
          ],
        });
      } else {
        new Notification('Низкий остаток материала!', {
          body: `${material.name}: осталось ${percentage}%`,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-192x192.svg',
          tag: `material-${material.id}`,
          requireInteraction: false,
          silent: false,
        });
      }
    }

    return lowStockMaterials.length;
  };

  const checkOrdersDeadline = async () => {
    if (!userId || Notification.permission !== 'granted') return;

    const moscowToday = getMoscowTime();
    moscowToday.setHours(0, 0, 0, 0);
    
    const twoDaysLater = new Date(moscowToday);
    twoDaysLater.setDate(moscowToday.getDate() + 2);

    const todayStr = moscowToday.toISOString().split('T')[0];
    const twoDaysLaterStr = twoDaysLater.toISOString().split('T')[0];

    const { data: orders } = await Bolt Database
      .from('orders')
      .select('id, order_number, deadline, status')
      .eq('user_id', userId)
      .in('status', ['В процессе', 'На утверждении'])
      .gte('deadline', todayStr)
      .lte('deadline', twoDaysLaterStr);

    if (!orders) return;

    orders.forEach((order) => {
      const deadline = new Date(order.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - moscowToday.getTime()) / (1000 * 60 * 60 * 24));

      let message = '';
      if (daysLeft === 0) {
        message = `Заказ №${order.order_number}: срок истекает сегодня!`;
      } else if (daysLeft === 1) {
        message = `Заказ №${order.order_number}: срок истекает завтра!`;
      } else if (daysLeft === 2) {
        message = `Заказ №${order.order_number}: осталось 2 дня до срока!`;
      }

      if (message) {
        new Notification('Скоро истекает срок заказа!', {
          body: message,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-192x192.svg',
          tag: `order-${order.id}`,
          requireInteraction: true,
          silent: false,
        });
      }
    });

    return orders.length;
  };

  const checkTasksDeadline = async () => {
    if (!userId || Notification.permission !== 'granted') return;

    const moscowToday = getMoscowTime();
    moscowToday.setHours(0, 0, 0, 0);

    const tomorrow = new Date(moscowToday);
    tomorrow.setDate(moscowToday.getDate() + 1);

    const todayStr = moscowToday.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: tasks } = await Bolt Database
      .from('tasks')
      .select('id, title, end_date, completed')
      .eq('user_id', userId)
      .eq('completed', false)
      .in('end_date', [todayStr, tomorrowStr]);

    if (!tasks) return;

    for (const task of tasks) {
      const taskEndDate = new Date(task.end_date);
      taskEndDate.setHours(0, 0, 0, 0);
      
      const daysLeft = Math.ceil((taskEndDate.getTime() - moscowToday.getTime()) / (1000 * 60 * 60 * 24));

      let message = '';
      if (daysLeft === 0) {
        message = `Сегодня последний день задачи "${task.title}"`;
      } else if (daysLeft === 1) {
        message = `Завтра истекает срок задачи "${task.title}"`;
      }

      if (message) {
        new Notification('Напоминание о задаче!', {
          body: message,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-192x192.svg',
          tag: `task-${task.id}`,
          requireInteraction: true,
          silent: false,
        });
      }
    }

    return tasks.length;
  };

  const checkAllNotifications = async () => {
    const [materialsCount, ordersCount, tasksCount] = await Promise.all([
      checkMaterialsLowStock(),
      checkOrdersDeadline(),
      checkTasksDeadline(),
    ]);

    return {
      materials: materialsCount || 0,
      orders: ordersCount || 0,
      tasks: tasksCount || 0,
    };
  };

  return {
    permissionState,
    requestPermission,
    checkMaterialsLowStock,
    checkOrdersDeadline,
    checkTasksDeadline,
    checkAllNotifications,
  };
}
