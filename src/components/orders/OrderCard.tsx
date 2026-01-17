import { Edit2, Trash2, Calendar, Clock, User, Package } from 'lucide-react';
import { OrderWithItems, calculateTimeRemaining } from '../../services/orderService';
import { ExpandableCard, IconButton, Badge, PercentageBadge } from '../ui';

interface OrderCardProps {
  order: OrderWithItems;
  onEdit: (order: OrderWithItems) => void;
  onDelete: (order: OrderWithItems) => void;
}

export default function OrderCard({ order, onEdit, onDelete }: OrderCardProps) {
  const timeRemaining = calculateTimeRemaining(order.order_date, order.deadline);
  const formattedOrderDate = new Date(order.order_date).toLocaleDateString('ru-RU');
  const formattedDeadline = order.deadline
    ? new Date(order.deadline).toLocaleDateString('ru-RU')
    : 'Не указан';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Выполнен':
        return 'success';
      case 'На утверждении':
        return 'warning';
      case 'Отменен':
        return 'danger';
      default:
        return 'info';
    }
  };

  const title = (
    <div className="flex items-center gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Заказ №{order.order_number}
      </h3>
      <Badge variant={getStatusColor(order.status)} size="md">
        {order.status}
      </Badge>
      {order.deadline && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <PercentageBadge percentage={timeRemaining} showPercentageSign={false} size="sm" />
        </div>
      )}
    </div>
  );

  const headerContent = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-4 mr-2">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Дата создания</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formattedOrderDate}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Цена</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {order.total_price.toFixed(2)} ₽
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          icon={<Edit2 />}
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(order);
          }}
        />
        <IconButton
          icon={<Trash2 />}
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(order);
          }}
        />
      </div>
    </div>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {order.client_name && (
          <DetailItem
            icon={<User className="h-4 w-4" />}
            label="Клиент"
            value={order.client_name}
          />
        )}

        <DetailItem
          icon={<Calendar className="h-4 w-4" />}
          label="Дата заказа"
          value={formattedOrderDate}
        />

        {order.deadline && (
          <DetailItem
            icon={<Clock className="h-4 w-4" />}
            label="Срок выполнения"
            value={formattedDeadline}
          />
        )}

        {order.source && (
          <DetailItem label="Источник заказа" value={order.source} />
        )}

        {order.delivery && <DetailItem label="Доставка" value={order.delivery} />}

        <DetailItem label="Статус" value={order.status} />

        {order.bonus_type !== 'нет' && (
          <DetailItem label="Тип бонуса" value={order.bonus_type} />
        )}

        {order.bonus_type === 'скидка' && order.discount_value > 0 && (
          <DetailItem
            label="Скидка"
            value={
              order.discount_type === 'процент'
                ? `${order.discount_value}%`
                : `${order.discount_value} руб.`
            }
          />
        )}
      </div>

      {order.items && order.items.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Изделия в заказе
          </h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between rounded-lg px-4 py-3
                  ${
                    item.is_bonus
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-900/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {item.product_name}
                  </span>
                  {item.is_bonus && (
                    <Badge variant="success" size="sm">
                      Бонус
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.quantity} шт
                  </span>
                  {!item.is_bonus && (
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(item.price * item.quantity).toFixed(2)} ₽
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-4 border border-orange-200 dark:border-burgundy-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Итоговая цена заказа:
            </span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {order.total_price.toFixed(2)} ₽
            </span>
          </div>
        </div>
      </div>
    </ExpandableCard>
  );
}

interface DetailItemProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailItem({ icon, label, value, highlight }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 text-gray-400 dark:text-gray-500">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p
          className={`font-medium ${
            highlight
              ? 'text-orange-600 dark:text-orange-400 text-lg'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
