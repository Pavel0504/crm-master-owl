import { Edit2, Trash2 } from 'lucide-react';
import { Material } from '../../services/materialService';
import { MaterialCategory } from '../../services/materialCategoryService';
import { ExpandableCard, IconButton, PercentageBadge } from '../ui';

interface MaterialCardProps {
  material: Material;
  categories: MaterialCategory[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export default function MaterialCard({
  material,
  categories,
  onEdit,
  onDelete,
}: MaterialCardProps) {
  const remainingPercentage = material.initial_volume > 0
    ? Math.round((material.remaining_volume / material.initial_volume) * 100)
    : 0;

  const category = categories.find((cat) => cat.id === material.category_id);

  const remainingValue = (material.remaining_volume / material.initial_volume) * material.purchase_price;

  const title = (
    <div className="flex items-center gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {material.name}
      </h3>
      <PercentageBadge percentage={remainingPercentage} />
    </div>
  );

  const headerContent = (
    <div className="flex items-center gap-2">
      <IconButton
        icon={<Edit2 />}
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(material);
        }}
      />
      <IconButton
        icon={<Trash2 />}
        size="sm"
        variant="danger"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(material);
        }}
      />
    </div>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <DetailItem label="Категория" value={category?.name || 'Без категории'} />
        <DetailItem label="Поставщик" value={material.supplier || 'Не указан'} />
        <DetailItem
          label="Способ доставки"
          value={material.delivery_method || 'Не указан'}
        />
        <DetailItem
          label="Цена закупки"
          value={`${material.purchase_price.toFixed(2)} руб.`}
        />
        <DetailItem
          label="Начальный объем"
          value={`${material.initial_volume} ${material.unit_of_measurement}`}
        />
        <DetailItem
          label="Оставшийся объем"
          value={`${material.remaining_volume} ${material.unit_of_measurement}`}
        />
        <DetailItem
          label="Дата закупки"
          value={new Date(material.purchase_date).toLocaleDateString('ru-RU')}
        />
        <DetailItem
          label="Сумма остатка"
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
