import { Edit2, Trash2, Truck, DollarSign } from 'lucide-react';
import { Supplier } from '../../services/supplierService';
import { SupplierCategory } from '../../services/supplierCategoryService';
import { ExpandableCard, IconButton } from '../ui';

interface SupplierCardProps {
  supplier: Supplier;
  categories: SupplierCategory[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export default function SupplierCard({
  supplier,
  categories,
  onEdit,
  onDelete,
}: SupplierCardProps) {
  const category = categories.find((cat) => cat.id === supplier.category_id);

  const title = (
    <div className="flex items-center gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {supplier.name}
      </h3>
    </div>
  );

  const headerContent = (
    <>
      <div className="flex items-center gap-3 justify-between flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Truck className="h-4 w-4" />
            <span className="text-sm">{supplier.delivery_method || 'Не указан'}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
              {supplier.delivery_price.toFixed(2)} ₽
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
              onEdit(supplier);
            }}
          />
          <IconButton
            icon={<Trash2 />}
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(supplier);
            }}
          />
        </div>
      </div>
    </>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <DetailItem label="Категория" value={category?.name || 'Без категории'} />
        <DetailItem label="Способ доставки" value={supplier.delivery_method || 'Не указан'} />
        <DetailItem
          label="Цена доставки"
          value={`${supplier.delivery_price.toFixed(2)} руб.`}
          highlight
        />
        <DetailItem
          label="Дата создания"
          value={new Date(supplier.created_at).toLocaleDateString('ru-RU')}
        />
      </div>
    </ExpandableCard>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailItem({ label, value, highlight }: DetailItemProps) {
  return (
    <div>
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
  );
}
