import { useState } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { SupplierCategory } from '../../services/supplierCategoryService';
import { SupplierInput } from '../../services/supplierService';

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierInput) => Promise<void>;
  categories: SupplierCategory[];
  loading?: boolean;
}

export default function CreateSupplierModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  loading = false,
}: CreateSupplierModalProps) {
  const [formData, setFormData] = useState<SupplierInput>({
    name: '',
    category_id: null,
    delivery_method: '',
    delivery_price: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category_id: null,
      delivery_method: '',
      delivery_price: 0,
      notes: '',
    });
    onClose();
  };

  const categoryOptions = [
    { value: '', label: 'Без категории' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать поставщика" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Например: ООО Ткани"
        />

        <Select
          label="Категория"
          value={formData.category_id || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              category_id: e.target.value || null,
            })
          }
          options={categoryOptions}
        />

        <Input
          label="Способ доставки"
          value={formData.delivery_method}
          onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
          placeholder="Например: Курьер, Почта России"
        />

        <Input
          label="Цена доставки (руб.)"
  type="text"
  inputMode="decimal"
  pattern="[0-9]*[.,]?[0-9]*"
          value={formData.delivery_price}
          onChange={(e) =>
            setFormData({
              ...formData,
              delivery_price: parseFloat(e.target.value) || 0,
            })
          }
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Заметки о поставщике
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Любая дополнительная информация о поставщике..."
            rows={4}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
            disabled={loading}
          >
            Отмена
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
