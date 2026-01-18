import { Edit2, Trash2, Package } from 'lucide-react';
import { Product } from '../../services/productService';
import { ProductCategory } from '../../services/productCategoryService';
import { ExpandableCard, IconButton, Badge } from '../ui';

interface ProductCardProps {
  product: Product;
  categories: ProductCategory[];
  materials: Array<{ material_id: string; volume_per_item: number; material_name: string }>;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({
  product,
  categories,
  materials,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const category = categories.find((cat) => cat.id === product.category_id);
  const isSoldOut = product.remaining_quantity === 0;
  const profit = product.selling_price - product.cost_price_per_item;

  const title = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        {isSoldOut && (
          <Badge variant="danger" size="md">
            Продано
          </Badge>
        )}
        <Badge variant="info" size="sm">
          {product.remaining_quantity}/{product.quantity_created} шт
        </Badge>
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
            onEdit(product);
          }}
        />
        <IconButton
          icon={<Trash2 />}
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(product);
          }}
        />
      </div>
    </>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <DetailItem label="Категория" value={category?.name || 'Без категории'} />
        <DetailItem label="Описание" value={product.description || 'Не указано'} />
        <DetailItem label="Состав" value={product.composition || 'Не указан'} />
        <DetailItem
          label="Трудочасов на единицу"
          value={`${product.labor_hours_per_item} ч`}
        />
        <DetailItem
          label="Себестоимость единицы"
          value={`${product.cost_price_per_item.toFixed(2)} руб.`}
        />
        <DetailItem
          label="Цена продажи"
          value={`${product.selling_price.toFixed(2)} руб.`}
        />
        <DetailItem
          label="Прибыль с единицы"
          value={`${profit.toFixed(2)} руб.`}
          highlight={profit > 0}
        />
        <DetailItem
          label="Всего создано"
          value={`${product.quantity_created} шт`}
        />
      </div>

      {materials.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Использованные материалы
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {materials.map((mat, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  {mat.material_name}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {mat.volume_per_item} ед.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
            ? 'text-green-600 dark:text-green-400 text-lg'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
