import { Edit2, Trash2, Calendar, Phone, MapPin, Link2 } from 'lucide-react';
import { Client, ClientStats } from '../../services/clientService';
import { ExpandableCard, IconButton, Badge } from '../ui';

interface ClientCardProps {
  client: Client;
  stats: ClientStats;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export default function ClientCard({ client, stats, onEdit, onDelete }: ClientCardProps) {
  const formattedDate = client.birth_date
    ? new Date(client.birth_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      })
    : null;

  const title = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {client.full_name}
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        {client.tag_name && (
          <Badge customColor={client.tag_color} size="md">
            {client.tag_name}
          </Badge>
        )}
        {formattedDate && (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );

  const headerContent = (
    <>
      <div className="flex items-center gap-3 justify-between flex-1">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Заказов</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {stats.orders_count}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Сумма</p>
            <p className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
              {stats.total_orders_sum.toFixed(0)} ₽
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <IconButton
            icon={<Edit2 />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(client);
            }}
          />
          <IconButton
            icon={<Trash2 />}
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(client);
            }}
          />
        </div>
      </div>
    </>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {client.phone && (
          <DetailItem
            icon={<Phone className="h-4 w-4" />}
            label="Телефон"
            value={client.phone}
          />
        )}

        {client.social_link && (
          <DetailItem
            icon={<Link2 className="h-4 w-4" />}
            label="Социальная сеть"
            value={client.social_link}
            isLink
          />
        )}

        {client.address && (
          <DetailItem
            icon={<MapPin className="h-4 w-4" />}
            label="Адрес"
            value={client.address}
          />
        )}

        {client.birth_date && (
          <DetailItem
            icon={<Calendar className="h-4 w-4" />}
            label="Дата рождения"
            value={new Date(client.birth_date).toLocaleDateString('ru-RU')}
          />
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-4 border border-orange-200 dark:border-burgundy-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Всего заказов
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.orders_count}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Общая сумма заказов
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.total_orders_sum.toFixed(2)} ₽
              </p>
            </div>
          </div>
        </div>
      </div>
    </ExpandableCard>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}

function DetailItem({ icon, label, value, isLink }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-gray-400 dark:text-gray-500">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-orange-600 dark:text-orange-400 hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        ) : (
          <p className="font-medium text-gray-900 dark:text-white break-all">{value}</p>
        )}
      </div>
    </div>
  );
}
