import { Edit2, Trash2 } from 'lucide-react';
import { Inventory } from '../../services/inventoryService';
import { InventoryCategory } from '../../services/inventoryCategoryService';
import { ExpandableCard, IconButton, PercentageBadge, Badge } from '../ui';

interface InventoryCardProps {
  inventory: Inventory;
  categories: InventoryCategory[];
  onEdit: (inventory: Inventory) => void;
  onDelete: (inventory: Inventory) => void;
}

export default function InventoryCard({
  inventory,
  categories,
  onEdit,
  onDelete,
}: InventoryCardProps) {
  const category = categories.find((cat) => cat.id === inventory.category_id);

  const isPercentType = inventory.inventory_type === 'процент';
  const wearPercentage = isPercentType
    ? Math.round(inventory.wear_percentage || 0)
    : 0;

  const remainingValue = isPercentType
    ? ((inventory.wear_percentage || 0) / 100) * inventory.purchase_price
    : ((inventory.remaining_quantity || 0) / (inventory.quantity || 1)) *
      inventory.purchase_price;

  const title = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {inventory.name}
      </h3>
      <div className="flex items-center gap-2">
        <Badge
          variant="info"
          size="sm"
        >
          {isPercentType ? 'По процентам' : 'По количеству'}
        </Badge>
        {isPercentType ? (
          <PercentageBadge percentage={wearPercentage} />
        ) : (
          <Badge variant="primary" size="md">
            {inventory.remaining_quantity || 0} из {inventory.quantity || 0} шт
          </Badge>
        )}
      </div>
    </div>
  );

  const headerContent = (
    <>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
        <IconButton
          icon={<Edit2 />}
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(inventory);
          }}
        />
        <IconButton
          icon={<Trash2 />}
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(inventory);
          }}
        />
      </div>
    </>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <DetailItem label="Категория" value={category?.name || 'Без категории'} />
        <DetailItem label="Тип" value={isPercentType ? 'По процентам' : 'По количеству'} />
        <DetailItem
          label="Цена покупки"
          value={`${inventory.purchase_price.toFixed(2)} руб.`}
        />

        {isPercentType ? (
          <>
            <DetailItem
              label="Износ на единицу изделия"
              value={`${(inventory.wear_rate_per_item || 0).toFixed(3)}%`}
            />
            <DetailItem
              label="Запас пригодности"
              value={`${wearPercentage}%`}
            />
          </>
        ) : (
          <>
            <DetailItem
              label="Общее количество"
              value={`${inventory.quantity || 0} шт`}
            />
            <DetailItem
              label="Осталось"
              value={`${inventory.remaining_quantity || 0} шт`}
            />
            <DetailItem
              label="Расход на единицу изделия"
              value={`${(inventory.quantity_rate_per_item || 0).toFixed(3)} шт`}
            />
          </>
        )}

        <DetailItem
          label="Дата покупки"
          value={new Date(inventory.purchase_date).toLocaleDateString('ru-RU')}
        />
        <DetailItem
          label="Остаточная стоимость"
          value={`${remainingValue.toFixed(2)} руб.`}
          highlight
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
