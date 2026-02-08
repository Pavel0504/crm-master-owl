// EditPurchaseModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Input, Button, CurrencyInput, Select } from '../ui';
import { PurchasePlan, PurchasePlanInput } from '../../services/purchaseService';
import { PurchaseCategory } from '../../services/purchaseCategoryService';
import { parseDecimal } from '../../utils/currency';

interface EditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchasePlanInput) => Promise<void>;
  purchase: PurchasePlan | null;
  categories: PurchaseCategory[];
  loading?: boolean;
}

export default function EditPurchaseModal({
  isOpen,
  onClose,
  onSubmit,
  purchase,
  categories,
  loading = false,
}: EditPurchaseModalProps) {
  const [formData, setFormData] = useState<PurchasePlanInput>({
    name: '',
    quantity: 0,
    amount: 0,
    delivery_method: '',
    notes: '',
    category_id: null,
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        name: purchase.name,
        quantity: purchase.quantity,
        amount: purchase.amount,
        delivery_method: purchase.delivery_method,
        notes: purchase.notes,
        category_id: purchase.category_id,
      });
    }
  }, [purchase]);

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
    <Modal isOpen={isOpen} onClose={handleClose} title="Редактировать закупку" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Например: Шерстяная пряжа красная"
        />

        <Select
          label="Категория"
          value={formData.category_id || ''}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
          options={categoryOptions}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Количество"
            type="text"
            inputMode="decimal"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseDecimal(e.target.value),
              })
            }
            placeholder="0"
            helperText="До 3 знаков после запятой"
          />

          <CurrencyInput
            label="Сумма (руб.)"
            value={formData.amount}
            onChange={(value) =>
              setFormData({
                ...formData,
                amount: value,
              })
            }
          />
        </div>

        <Input
          label="Способ доставки"
          value={formData.delivery_method}
          onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
          placeholder="Например: Курьер, Почта России, СДЭК"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Заметка
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Дополнительная информация о закупке..."
            rows={4}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
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
