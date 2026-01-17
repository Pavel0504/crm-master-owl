import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, DatePicker } from '../ui';
import { MaterialCategory } from '../../services/materialCategoryService';
import { Material, MaterialInput } from '../../services/materialService';

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialInput) => Promise<void>;
  categories: MaterialCategory[];
  material: Material | null;
  loading?: boolean;
}

export default function EditMaterialModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  material,
  loading = false,
}: EditMaterialModalProps) {
  const [formData, setFormData] = useState<MaterialInput>({
    name: '',
    category_id: null,
    supplier: '',
    delivery_method: '',
    purchase_price: 0,
    initial_volume: 0,
    remaining_volume: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    unit_of_measurement: '',
  });

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        category_id: material.category_id,
        supplier: material.supplier,
        delivery_method: material.delivery_method,
        purchase_price: material.purchase_price,
        initial_volume: material.initial_volume,
        remaining_volume: material.remaining_volume,
        purchase_date: material.purchase_date,
        unit_of_measurement: material.unit_of_measurement,
      });
    }
  }, [material]);

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
      title="Редактировать материал"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название материала"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Например: Шерстяная пряжа"
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
            label="Поставщик"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Название поставщика"
          />

          <Input
            label="Способ доставки"
            value={formData.delivery_method}
            onChange={(e) =>
              setFormData({ ...formData, delivery_method: e.target.value })
            }
            placeholder="Например: Почта России"
          />

          <Input
            label="Цена закупки (руб.)"
            type="number"
            step="0.01"
            min="0"
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
            label="Начальный объем"
            type="number"
            step="0.001"
            min="0"
            value={formData.initial_volume}
            onChange={(e) =>
              setFormData({
                ...formData,
                initial_volume: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <Input
            label="Оставшийся объем"
            type="number"
            step="0.001"
            min="0"
            value={formData.remaining_volume}
            onChange={(e) =>
              setFormData({
                ...formData,
                remaining_volume: parseFloat(e.target.value) || 0,
              })
            }
            required
          />

          <Input
            label="Единица измерения"
            value={formData.unit_of_measurement}
            onChange={(e) =>
              setFormData({ ...formData, unit_of_measurement: e.target.value })
            }
            placeholder="Например: кг, м, шт"
            required
          />

          <DatePicker
            label="Дата закупки"
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
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
