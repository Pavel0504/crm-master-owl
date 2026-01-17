import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { Product } from '../../services/productService';
import { ProductCategory } from '../../services/productCategoryService';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category_id?: string | null;
    description?: string;
    composition?: string;
    labor_hours_per_item?: number;
    selling_price?: number;
  }) => Promise<void>;
  categories: ProductCategory[];
  product: Product | null;
  loading?: boolean;
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  product,
  loading = false,
}: EditProductModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [composition, setComposition] = useState('');
  const [laborHours, setLaborHours] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.category_id || '');
      setDescription(product.description);
      setComposition(product.composition);
      setLaborHours(product.labor_hours_per_item);
      setSellingPrice(product.selling_price);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      name,
      category_id: categoryId || null,
      description,
      composition,
      labor_hours_per_item: laborHours,
      selling_price: sellingPrice,
    });

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
      title="Редактировать изделие"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
          Примечание: При редактировании нельзя изменить материалы и количество. Эти параметры
          устанавливаются при создании изделия.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название изделия"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Например: Вязаный шарф"
          />

          <Select
            label="Категория"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
          />

          <div className="md:col-span-2">
            <Input
              label="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание изделия"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Состав"
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              placeholder="Состав изделия, материалы"
            />
          </div>

          <Input
            label="Трудочасов на единицу"
            type="number"
            step="0.1"
            min="0"
            value={laborHours}
            onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
          />

          <Input
            label="Цена продажи (руб.)"
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
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
