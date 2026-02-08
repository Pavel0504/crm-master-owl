import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, CurrencyInput, DatePicker } from '../ui';
import { Product } from '../../services/productService';
import { ProductCategory } from '../../services/productCategoryService';
import { Recipe } from '../../services/recipeService';
import { parseDecimal } from '../../utils/currency';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category_id?: string | null;
    recipe_id?: string | null;
    description?: string;
    composition?: string;
    labor_hours_per_item?: number;
    selling_price?: number;
    creation_date?: string;
  }) => Promise<void>;
  categories: ProductCategory[];
  recipes: Recipe[];
  product: Product | null;
  loading?: boolean;
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  recipes,
  product,
  loading = false,
}: EditProductModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [recipeId, setRecipeId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [composition, setComposition] = useState('');
  const [laborHours, setLaborHours] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [creationDate, setCreationDate] = useState<string>('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.category_id || '');
      setRecipeId(product.recipe_id || '');
      setDescription(product.description);
      setComposition(product.composition);
      setLaborHours(product.labor_hours_per_item);
      setSellingPrice(product.selling_price);
      setCreationDate(product.creation_date || new Date().toISOString().split('T')[0]);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      name,
      category_id: categoryId || null,
      recipe_id: recipeId || null,
      description,
      composition,
      labor_hours_per_item: laborHours,
      selling_price: sellingPrice,
      creation_date: creationDate,
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

  const sortedRecipes = [...recipes].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  const recipeOptions = [
    { value: '', label: 'Без рецепта' },
    ...sortedRecipes.map((recipe) => ({
      value: recipe.id,
      label: recipe.name,
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
            <Select
              label="Рецепт"
              value={recipeId}
              onChange={(e) => setRecipeId(e.target.value)}
              options={recipeOptions}
            />
          </div>

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
            type="text"
            inputMode="decimal"
            value={laborHours}
            onChange={(e) => setLaborHours(parseDecimal(e.target.value) || 0)}
            helperText="До 3 знаков после запятой"
          />

          <CurrencyInput
            label="Цена продажи (руб.)"
            value={sellingPrice}
            onChange={(value) => setSellingPrice(value)}
            required
          />

          <DatePicker
            label="Дата создания"
            value={creationDate}
            onChange={setCreationDate}
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
