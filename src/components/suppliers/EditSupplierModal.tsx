import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { SupplierCategory } from '../../services/supplierCategoryService';
import { Supplier, SupplierInput } from '../../services/supplierService';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierInput) => Promise<void>;
  categories: SupplierCategory[];
  supplier: Supplier | null;
  loading?: boolean;
}

export default function EditSupplierModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  supplier,
  loading = false,
}: EditSupplierModalProps) {
  const [formData, setFormData] = useState<SupplierInput>({
    name: '',
    category_id: null,
    delivery_method: '',
    delivery_price: 0,
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        category_id: supplier.category_id,
        delivery_method: supplier.delivery_method,
        delivery_price: supplier.delivery_price,
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Редактировать поставщика"
      size="md"
    >
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
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
