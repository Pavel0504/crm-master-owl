import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, CurrencyInput } from '../ui';
import { ProductCategory } from '../../services/productCategoryService';
import { Inventory } from '../../services/inventoryService';
import { Trash2 } from 'lucide-react';

interface EditProductCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    parent_id: string | null;
    energy_costs_electricity: number;
    energy_costs_water: number;
    labor_cost_per_hour: number;
  }, inventoryIds: string[]) => Promise<void>;
  category: ProductCategory | null;
  categories: ProductCategory[];
  inventory: Inventory[];
  currentInventoryIds: string[];
  loading?: boolean;
}

export default function EditProductCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  categories,
  inventory,
  currentInventoryIds,
  loading = false,
}: EditProductCategoryModalProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [electricity, setElectricity] = useState<number>(0);
  const [water, setWater] = useState<number>(0);
  const [laborCostPerHour, setLaborCostPerHour] = useState<number>(0);
  const [selectedInventory, setSelectedInventory] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parent_id || '');
      setElectricity(category.energy_costs_electricity);
      setWater(category.energy_costs_water);
      setLaborCostPerHour(category.labor_cost_per_hour);
      setSelectedInventory(currentInventoryIds);
    }
  }, [category, currentInventoryIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      {
        name,
        parent_id: parentId || null,
        energy_costs_electricity: electricity,
        energy_costs_water: water,
        labor_cost_per_hour: laborCostPerHour,
      },
      selectedInventory
    );
  };

  const handleClose = () => {
    setName('');
    setParentId('');
    setElectricity(0);
    setWater(0);
    setLaborCostPerHour(0);
    setSelectedInventory([]);
    onClose();
  };

  const categoryOptions = [
    { value: '', label: 'Нет (корневая категория)' },
    ...categories
      .filter((cat) => cat.id !== category?.id)
      .map((cat) => ({
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
      title="Редактировать категорию изделия"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название категории"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Например: Вязаные изделия"
          autoFocus
        />

        <Select
          label="Родительская категория"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          options={categoryOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput
            label="Затраты на электричество (руб.)"
            value={electricity}
            onChange={(value) => setElectricity(value)}
            helperText="За единицу изделия"
          />

          <CurrencyInput
            label="Затраты на воду (руб.)"
            value={water}
            onChange={(value) => setWater(value)}
            helperText="За единицу изделия"
          />
        </div>

        <CurrencyInput
          label="Стоимость трудочаса (руб./час)"
          value={laborCostPerHour}
          onChange={(value) => setLaborCostPerHour(value)}
          helperText="Стоимость одного часа работы"
        />

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

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
          <strong>Пример:</strong> Если стоимость трудочаса 300 руб., а на изделие тратится 2.2 часа, то трудозатраты составят 660 руб. (300 × 2.2)
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
