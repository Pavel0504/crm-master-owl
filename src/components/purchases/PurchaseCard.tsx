import { Edit2, Trash2, Package, DollarSign, Truck } from 'lucide-react';
import { PurchasePlan } from '../../services/purchaseService';
import { ExpandableCard, IconButton } from '../ui';

interface PurchaseCardProps {
  purchase: PurchasePlan;
  onEdit: (purchase: PurchasePlan) => void;
  onDelete: (purchase: PurchasePlan) => void;
}

export default function PurchaseCard({ purchase, onEdit, onDelete }: PurchaseCardProps) {
  const title = (
    <div className="flex items-center gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {purchase.name}
      </h3>
    </div>
  );

  const headerContent = (
    <>
      <div className="flex items-center gap-3 justify-between flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Package className="h-4 w-4" />
            <span className="text-sm">{purchase.quantity} шт</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
              {purchase.amount.toFixed(2)} ₽
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <IconButton
            icon={<Edit2 />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(purchase);
            }}
          />
          <IconButton
            icon={<Trash2 />}
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(purchase);
            }}
          />
        </div>
      </div>
    </>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <DetailItem label="Название" value={purchase.name} />
        <DetailItem label="Количество" value={`${purchase.quantity} шт`} />
        <DetailItem
          label="Сумма"
          value={`${purchase.amount.toFixed(2)} руб.`}
          highlight
        />
        {purchase.delivery_method && (
          <DetailItem
            icon={<Truck className="h-4 w-4" />}
            label="Способ доставки"
            value={purchase.delivery_method}
          />
        )}
        <DetailItem
          label="Дата создания"
          value={new Date(purchase.created_at).toLocaleDateString('ru-RU')}
        />
      </div>

      {purchase.notes && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Заметка
          </p>
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {purchase.notes}
          </p>
        </div>
      )}
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
