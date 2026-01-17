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
          type="number"
          step="0.01"
          min="0"
          value={formData.delivery_price}
          onChange={(e) =>
            setFormData({
              ...formData,
              delivery_price: parseFloat(e.target.value) || 0,
            })
          }
          required
        />

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
