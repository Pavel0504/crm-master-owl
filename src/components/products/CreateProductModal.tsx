import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, CurrencyInput, DatePicker } from '../ui';
import { ProductCategory } from '../../services/productCategoryService';
import { Material } from '../../services/materialService';
import { Plus, Trash2 } from 'lucide-react';
import { parseDecimal } from '../../utils/currency';

interface MaterialEntry {
  material_id: string;
  volume_per_item: number;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category_id?: string | null;
    description?: string;
    composition?: string;
    quantity_created: number;
    labor_hours_per_item?: number;
    selling_price?: number;
    creation_date?: string;
    materials: MaterialEntry[];
  }) => Promise<void>;
  categories: ProductCategory[];
  materials: Material[];
  loading?: boolean;
  onCalculateCost?: (
    categoryId: string | null,
    materials: MaterialEntry[],
    laborHours: number,
    quantity: number
  ) => Promise<number>;
}

export default function CreateProductModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  materials,
  loading = false,
  onCalculateCost,
}: CreateProductModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [composition, setComposition] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [laborHours, setLaborHours] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [creationDate, setCreationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialEntry[]>([]);
  const [calculatedCost, setCalculatedCost] = useState<number>(0);
  const [calculatedProfit, setCalculatedProfit] = useState<number>(0);

  useEffect(() => {
    if (onCalculateCost && quantity > 0) {
      const validMaterials = selectedMaterials.filter(
        (m) => m.material_id && m.volume_per_item > 0
      );
      onCalculateCost(categoryId || null, validMaterials, laborHours, quantity).then((cost) => {
        setCalculatedCost(cost);
        setCalculatedProfit(sellingPrice - cost);
      });
    }
  }, [categoryId, selectedMaterials, laborHours, quantity, sellingPrice, onCalculateCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      alert('Количество должно быть больше нуля');
      return;
    }

    const validMaterials = selectedMaterials.filter(
      (m) => m.material_id && m.volume_per_item > 0
    );

    await onSubmit({
      name,
      category_id: categoryId || null,
      description,
      composition,
      quantity_created: quantity,
      labor_hours_per_item: laborHours,
      selling_price: sellingPrice,
      creation_date: creationDate,
      materials: validMaterials,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setCategoryId('');
    setDescription('');
    setComposition('');
    setQuantity(0);
    setLaborHours(0);
    setSellingPrice(0);
    setCreationDate(new Date().toISOString().split('T')[0]);
    setSelectedMaterials([]);
    setCalculatedCost(0);
    setCalculatedProfit(0);
    onClose();
  };

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { material_id: '', volume_per_item: 0 }]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: 'material_id' | 'volume_per_item', value: any) => {
    const updated = [...selectedMaterials];
    updated[index][field] = value;
    setSelectedMaterials(updated);
  };

  const categoryOptions = [
    { value: '', label: 'Без категории' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const sortedMaterials = [...materials].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать изделие"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            label="Количество создаваемых изделий"
            type="text"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(parseDecimal(e.target.value) || 0)}
            helperText="До 3 знаков после запятой"
            required
          />

          <Input
            label="Трудочасов на единицу"
            type="text"
            inputMode="decimal"
            value={laborHours}
            onChange={(e) => setLaborHours(parseDecimal(e.target.value) || 0)}
            helperText="До 3 знаков после запятой"
          />

          <DatePicker
            label="Дата создания"
            value={creationDate}
            onChange={setCreationDate}
            required
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Затраченные материалы (на единицу изделия)
            </label>
            {selectedMaterials.length === 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                Опционально
              </span>
            )}
          </div>

          {selectedMaterials.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Материалы не добавлены
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMaterial}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Добавить материал
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedMaterials.map((material, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Select
                      value={material.material_id}
                      onChange={(e) => updateMaterial(index, 'material_id', e.target.value)}
                      options={[
                        { value: '', label: 'Выберите материал' },
                        ...sortedMaterials.map((mat) => ({
                          value: mat.id,
                          label: `${mat.name} (остаток: ${mat.remaining_volume} ${mat.unit_of_measurement})`,
                        })),
                      ]}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={material.volume_per_item}
                      onChange={(e) =>
                        updateMaterial(index, 'volume_per_item', parseDecimal(e.target.value) || 0)
                      }
                      placeholder="Объем"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMaterial}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить материал
              </Button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <CurrencyInput
            label="Цена продажи (руб.)"
            value={sellingPrice}
            onChange={(value) => setSellingPrice(value)}
            required
          />
        </div>

        {(calculatedCost > 0 || sellingPrice > 0) && (
          <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-4 border border-orange-200 dark:border-burgundy-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Себестоимость единицы
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {calculatedCost.toFixed(2)} руб.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Цена продажи</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {sellingPrice.toFixed(2)} руб.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Прибыль с единицы</p>
                <p
                  className={`text-lg font-bold ${
                    calculatedProfit > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {calculatedProfit.toFixed(2)} руб.
                </p>
              </div>
            </div>
          </div>
        )}

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
