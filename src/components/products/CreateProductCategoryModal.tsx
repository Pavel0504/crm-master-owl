import { useState } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { ProductCategory } from '../../services/productCategoryService';
import { Inventory } from '../../services/inventoryService';
import { Plus, Trash2 } from 'lucide-react';

interface CreateProductCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    parent_id: string | null;
    energy_costs_electricity: number;
    energy_costs_water: number;
  }, inventoryIds: string[]) => Promise<void>;
  categories: ProductCategory[];
  inventory: Inventory[];
  loading?: boolean;
}

export default function CreateProductCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  inventory,
  loading = false,
}: CreateProductCategoryModalProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [electricity, setElectricity] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [selectedInventory, setSelectedInventory] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      {
        name,
        parent_id: parentId || null,
        energy_costs_electricity: electricity,
        energy_costs_water: water,
      },
      selectedInventory
    );
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setParentId('');
    setElectricity(0);
    setWater(0);
    setSelectedInventory([]);
    onClose();
  };

  const categoryOptions = [
    { value: '', label: 'Нет (корневая категория)' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const availableInventory = inventory.filter(
    (inv) => !selectedInventory.includes(inv.id)
  );

  const addInventory = (inventoryId: string) => {
    if (inventoryId && !selectedInventory.includes(inventoryId)) {
      setSelectedInventory([...selectedInventory, inventoryId]);
    }
  };

  const removeInventory = (inventoryId: string) => {
    setSelectedInventory(selectedInventory.filter((id) => id !== inventoryId));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать категорию изделия"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название категории"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Например: Вязаные изделия"
        />

        <Select
          label="Родительская категория"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          options={categoryOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Затраты на электричество (руб.)"
  type="text"
  inputMode="decimal"
  pattern="[0-9]*[.,]?[0-9]*"
            value={electricity}
            onChange={(e) => setElectricity(parseFloat(e.target.value) || 0)}
            helperText="За единицу изделия"
          />

          <Input
            label="Затраты на воду (руб.)"
  type="text"
  inputMode="decimal"
  pattern="[0-9]*[.,]?[0-9]*"
            value={water}
            onChange={(e) => setWater(parseFloat(e.target.value) || 0)}
            helperText="За единицу изделия"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Используемый инвентарь
          </label>

          <div className="space-y-2 mb-3">
            {selectedInventory.map((inventoryId) => {
              const inv = inventory.find((i) => i.id === inventoryId);
              return (
                <div
                  key={inventoryId}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg px-4 py-2"
                >
                  <span className="text-gray-900 dark:text-white">{inv?.name}</span>
                  <button
                    type="button"
                    onClick={() => removeInventory(inventoryId)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {availableInventory.length > 0 && (
            <div className="flex gap-2">
              <Select
                value=""
                onChange={(e) => addInventory(e.target.value)}
                options={[
                  { value: '', label: 'Выберите инвентарь' },
                  ...availableInventory.map((inv) => ({
                    value: inv.id,
                    label: inv.name,
                  })),
                ]}
              />
            </div>
          )}

          {selectedInventory.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Инвентарь не выбран
            </p>
          )}
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
