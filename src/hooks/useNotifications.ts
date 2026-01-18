import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
}

export function useNotifications(userId: string | undefined) {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: 'default',
    supported: false,
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState({
        permission: Notification.permission,
        supported: true,
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

  const checkMaterialsLowStock = async () => {
    if (!userId || Notification.permission !== 'granted') return;

    const { data: materials } = await supabase
      .from('materials')
      .select('id, name, initial_volume, remaining_volume')
      .eq('user_id', userId);

    if (!materials) return;

    const lowStockMaterials = materials.filter((material) => {
      const percentage = (material.remaining_volume / material.initial_volume) * 100;
      return percentage < 40 && percentage > 0;
    });

    lowStockMaterials.forEach((material) => {
      const percentage = Math.round(
        (material.remaining_volume / material.initial_volume) * 100
      );

      new Notification('Низкий остаток материала!', {
        body: `${material.name}: осталось ${percentage}%`,
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-192x192.svg',
        tag: `material-${material.id}`,
        requireInteraction: false,
        silent: false,
      });
    });

    return lowStockMaterials.length;
  };

  const checkOrdersDeadline = async () => {
    if (!userId || Notification.permission !== 'granted') return;

    const today = new Date();
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);

    const todayStr = today.toISOString().split('T')[0];
    const twoDaysLaterStr = twoDaysLater.toISOString().split('T')[0];

    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, deadline, status')
      .eq('user_id', userId)
      .in('status', ['В процессе', 'На утверждении'])
      .gte('deadline', todayStr)
      .lte('deadline', twoDaysLaterStr);

    if (!orders) return;

    orders.forEach((order) => {
      const deadline = new Date(order.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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

  const checkAllNotifications = async () => {
    const [materialsCount, ordersCount] = await Promise.all([
      checkMaterialsLowStock(),
      checkOrdersDeadline(),
    ]);

    return {
      materials: materialsCount || 0,
      orders: ordersCount || 0,
    };
  };

  return {
    permissionState,
    requestPermission,
    checkMaterialsLowStock,
    checkOrdersDeadline,
    checkAllNotifications,
  };
}
