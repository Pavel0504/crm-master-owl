import { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import IconButton from './IconButton';
import Button from './Button';

interface DynamicFieldArrayProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  addButtonText?: string;
  minItems?: number;
  maxItems?: number;
  label?: string;
}

export default function DynamicFieldArray<T>({
  items,
  onAdd,
  onRemove,
  renderItem,
  addButtonText = 'Добавить',
  minItems = 0,
  maxItems,
  label,
}: DynamicFieldArrayProps<T>) {
  const canRemove = items.length > minItems;
  const canAdd = !maxItems || items.length < maxItems;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-1">{renderItem(item, index)}</div>
            {canRemove && (
              <IconButton
                icon={<Trash2 />}
                variant="danger"
                size="md"
                onClick={() => onRemove(index)}
                className="mt-0.5"
                type="button"
              />
            )}
          </div>
        ))}
      </div>

      {canAdd && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="mt-3 flex items-center gap-2"
          type="button"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
}
