import { useState } from 'react';
import { Modal, Input, Button } from '../ui';
import { PurchasePlanInput } from '../../services/purchaseService';

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchasePlanInput) => Promise<void>;
  loading?: boolean;
}

export default function CreatePurchaseModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreatePurchaseModalProps) {
  const [formData, setFormData] = useState<PurchasePlanInput>({
    name: '',
    quantity: 0,
    amount: 0,
    delivery_method: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      quantity: 0,
      amount: 0,
      delivery_method: '',
      notes: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать список закупки" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Например: Шерстяная пряжа красная"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Количество"
            type="number"
            step="0.001"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
          />

          <Input
            label="Сумма (руб.)"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
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
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
