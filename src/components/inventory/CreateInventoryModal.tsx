import { useState } from 'react';
import { Modal, Input, Select, Button, DatePicker } from '../ui';
import { InventoryCategory } from '../../services/inventoryCategoryService';
import { InventoryInput } from '../../services/inventoryService';

interface CreateInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryInput) => Promise<void>;
  categories: InventoryCategory[];
  loading?: boolean;
}

export default function CreateInventoryModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  loading = false,
}: CreateInventoryModalProps) {
  const [formData, setFormData] = useState<InventoryInput>({
    name: '',
    category_id: null,
    purchase_price: 0,
    wear_percentage: 100,
    wear_rate_per_item: 0,
    purchase_date: new Date().toISOString().split('T')[0],
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
      purchase_price: 0,
      wear_percentage: 100,
      wear_rate_per_item: 0,
      purchase_date: new Date().toISOString().split('T')[0],
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить инвентарь"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название инвентаря"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Например: Швейная машинка"
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
            label="Цена покупки (руб.)"
  type="text"
  inputMode="decimal"
  pattern="[0-9]*[.,]?[0-9]*"
            value={formData.purchase_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchase_price: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <Input
            label="Износ на единицу изделия (%)"
  type="text"
  inputMode="decimal"
  pattern="[0-9]*[.,]?[0-9]*"
            max="100"
            value={formData.wear_rate_per_item}
            onChange={(e) =>
              setFormData({
                ...formData,
                wear_rate_per_item: parseFloat(e.target.value) || 0,
              })
            }
            helperText="Процент износа при создании одного изделия"
            required
          />

          <DatePicker
            label="Дата покупки"
            value={formData.purchase_date || ''}
            onChange={(value) =>
              setFormData({ ...formData, purchase_date: value })
            }
            required
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
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
