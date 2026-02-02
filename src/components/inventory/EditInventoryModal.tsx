import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, DatePicker, CurrencyInput } from '../ui';
import { InventoryCategory } from '../../services/inventoryCategoryService';
import { Inventory, InventoryInput } from '../../services/inventoryService';

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryInput) => Promise<void>;
  categories: InventoryCategory[];
  inventory: Inventory | null;
  loading?: boolean;
}

export default function EditInventoryModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  inventory,
  loading = false,
}: EditInventoryModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [inventoryType, setInventoryType] = useState<'процент' | 'количество'>('процент');
  const [wearPercentage, setWearPercentage] = useState('');
  const [wearRatePerItem, setWearRatePerItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remainingQuantity, setRemainingQuantity] = useState('');
  const [quantityRatePerItem, setQuantityRatePerItem] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  useEffect(() => {
    if (inventory) {
      setName(inventory.name);
      setCategoryId(inventory.category_id || '');
      setPurchasePrice(inventory.purchase_price);
      setInventoryType(inventory.inventory_type);
      setPurchaseDate(inventory.purchase_date);

      if (inventory.inventory_type === 'процент') {
        setWearPercentage(inventory.wear_percentage?.toString() || '100');
        setWearRatePerItem(inventory.wear_rate_per_item?.toString() || '0');
      } else {
        setQuantity(inventory.quantity?.toString() || '0');
        setRemainingQuantity(inventory.remaining_quantity?.toString() || '0');
        setQuantityRatePerItem(inventory.quantity_rate_per_item?.toString() || '0');
      }
    }
  }, [inventory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: InventoryInput = {
      name,
      category_id: categoryId || null,
      purchase_price: purchasePrice,
      inventory_type: inventoryType,
      purchase_date: purchaseDate,
    };

    if (inventoryType === 'процент') {
      data.wear_percentage = parseFloat(wearPercentage) || 0;
      data.wear_rate_per_item = parseFloat(wearRatePerItem) || 0;
      data.quantity = null;
      data.remaining_quantity = null;
      data.quantity_rate_per_item = null;
    } else {
      data.wear_percentage = null;
      data.wear_rate_per_item = null;
      data.quantity = parseInt(quantity) || 0;
      data.remaining_quantity = parseInt(remainingQuantity) || 0;
      data.quantity_rate_per_item = parseFloat(quantityRatePerItem) || 0;
    }

    await onSubmit(data);
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
      title="Редактировать инвентарь"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название инвентаря"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Например: Швейная машинка"
          />

          <Select
            label="Категория"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
          />

          <CurrencyInput
            label="Цена покупки (руб.)"
            value={purchasePrice}
            onChange={(value) => setPurchasePrice(value)}
            required
          />

          <DatePicker
            label="Дата покупки"
            value={purchaseDate}
            onChange={(value) => setPurchaseDate(value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Тип инвентаря
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInventoryType('процент')}
              className={`
                px-4 py-3 rounded-lg font-medium transition-all border-2
                ${
                  inventoryType === 'процент'
                    ? 'border-orange-500 dark:border-burgundy-500 bg-orange-50 dark:bg-burgundy-900/20 text-orange-700 dark:text-orange-300 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              По процентам
            </button>
            <button
              type="button"
              onClick={() => setInventoryType('количество')}
              className={`
                px-4 py-3 rounded-lg font-medium transition-all border-2
                ${
                  inventoryType === 'количество'
                    ? 'border-orange-500 dark:border-burgundy-500 bg-orange-50 dark:bg-burgundy-900/20 text-orange-700 dark:text-orange-300 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              По количеству
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {inventoryType === 'процент'
              ? 'Используется для инвентаря с износом (кастрюли, машинки и т.д.)'
              : 'Используется для расходного инвентаря (одноразовые ложки, стаканы и т.д.)'}
          </p>
        </div>

        {inventoryType === 'процент' ? (
          <Input
            label="Износ на единицу изделия (%)"
            type="number"
            step="0.001"
            min="0"
            max="100"
            value={wearRatePerItem}
            onChange={(e) => setWearRatePerItem(e.target.value)}
            helperText="Процент износа при создании одного изделия"
            required
          />
        ) : (
          <>
            <Input
              label="Количество (шт)"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              helperText="Количество единиц инвентаря"
              required
            />
            <Input
              label="Расход на единицу изделия (шт)"
              type="number"
              step="0.001"
              min="0"
              value={quantityRatePerItem}
              onChange={(e) => setQuantityRatePerItem(e.target.value)}
              helperText="Сколько единиц тратится на создание одного изделия"
              required
            />
          </>
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
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
