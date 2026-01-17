import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, DatePicker } from '../ui';
import { Plus, Trash2 } from 'lucide-react';
import { OrderItemInput } from '../../services/orderService';
import { Client } from '../../services/clientService';
import { Product } from '../../services/productService';
import CreateClientModal from '../clients/CreateClientModal';

interface ProductEntry {
  product_id: string;
  quantity: number;
  is_bonus: boolean;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    client_id?: string | null;
    order_date?: string;
    deadline?: string | null;
    source?: string;
    delivery?: string;
    status?: string;
    bonus_type?: string;
    discount_type?: string;
    discount_value?: number;
    items: OrderItemInput[];
  }) => Promise<void>;
  clients: Client[];
  products: Product[];
  loading?: boolean;
  onCalculatePrice?: (
    items: OrderItemInput[],
    bonusType: string,
    discountType: string,
    discountValue: number
  ) => Promise<number>;
  onCreateClient?: (clientData: any) => Promise<void>;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSubmit,
  clients,
  products,
  loading = false,
  onCalculatePrice,
  onCreateClient,
}: CreateOrderModalProps) {
  const [clientId, setClientId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [deadline, setDeadline] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [delivery, setDelivery] = useState<string>('');
  const [status, setStatus] = useState<string>('В процессе');
  const [bonusType, setBonusType] = useState<string>('нет');
  const [discountType, setDiscountType] = useState<string>('процент');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [items, setItems] = useState<ProductEntry[]>([
    { product_id: '', quantity: 1, is_bonus: false },
  ]);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    if (onCalculatePrice && items.some((item) => item.product_id)) {
      const validItems = items.filter((item) => item.product_id && item.quantity > 0);
      onCalculatePrice(validItems, bonusType, discountType, discountValue).then((price) => {
        setCalculatedPrice(price);
      });
    }
  }, [items, bonusType, discountType, discountValue, onCalculatePrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter((item) => item.product_id && item.quantity > 0);

    if (validItems.length === 0) {
      alert('Добавьте хотя бы одно изделие в заказ');
      return;
    }

    await onSubmit({
      client_id: clientId || null,
      order_date: orderDate,
      deadline: deadline || null,
      source,
      delivery,
      status,
      bonus_type: bonusType,
      discount_type: discountType,
      discount_value: discountValue,
      items: validItems,
    });

    handleClose();
  };

  const handleClose = () => {
    setClientId('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setDeadline('');
    setSource('');
    setDelivery('');
    setStatus('В процессе');
    setBonusType('нет');
    setDiscountType('процент');
    setDiscountValue(0);
    setItems([{ product_id: '', quantity: 1, is_bonus: false }]);
    setCalculatedPrice(0);
    onClose();
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, is_bonus: false }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: 'product_id' | 'quantity' | 'is_bonus',
    value: any
  ) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleCreateClient = async (clientData: any) => {
    if (onCreateClient) {
      await onCreateClient(clientData);
    }
  };

  const clientOptions = [
    { value: '', label: 'Без клиента' },
    { value: 'new', label: '+ Создать нового клиента' },
    ...clients.map((client) => ({
      value: client.id,
      label: client.full_name,
    })),
  ];

  const statusOptions = [
    { value: 'В процессе', label: 'В процессе' },
    { value: 'На утверждении', label: 'На утверждении' },
    { value: 'Выполнен', label: 'Выполнен' },
    { value: 'Отменен', label: 'Отменен' },
  ];

  const bonusTypeOptions = [
    { value: 'нет', label: 'Нет' },
    { value: 'скидка', label: 'Скидка' },
    { value: 'доп.товар', label: 'Дополнительный товар' },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Создать заказ" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Клиент"
              value={clientId}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setIsClientModalOpen(true);
                } else {
                  setClientId(e.target.value);
                }
              }}
              options={clientOptions}
            />

            <Select
              label="Статус"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />

            <DatePicker
              label="Дата заказа"
              value={orderDate}
              onChange={setOrderDate}
              required
            />

            <DatePicker label="Срок выполнения" value={deadline} onChange={setDeadline} />

            <Input
              label="Источник заказа"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Например: Instagram, Сайт, Рекомендация"
            />

            <Input
              label="Способ доставки"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              placeholder="Например: Самовывоз, Почта"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Изделия в заказе
            </label>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      options={[
                        { value: '', label: 'Выберите изделие' },
                        ...products.map((prod) => ({
                          value: prod.id,
                          label: `${prod.name} (остаток: ${prod.remaining_quantity} шт, ${prod.selling_price.toFixed(2)} руб.)`,
                        })),
                      ]}
                      required
                    />
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                    }
                    placeholder="Кол-во"
                    required
                  />
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-w-fit">
                    <input
                      type="checkbox"
                      checked={item.is_bonus}
                      onChange={(e) => updateItem(index, 'is_bonus', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Бонус</span>
                  </label>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить изделие
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Select
              label="Тип бонуса"
              value={bonusType}
              onChange={(e) => {
                setBonusType(e.target.value);
                if (e.target.value === 'нет') {
                  setDiscountValue(0);
                }
              }}
              options={bonusTypeOptions}
            />

            {bonusType === 'скидка' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Тип скидки
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('процент')}
                      className={`
                        flex-1 px-4 py-2 rounded-lg font-medium transition-all
                        ${
                          discountType === 'процент'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      Процент
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('сумма')}
                      className={`
                        flex-1 px-4 py-2 rounded-lg font-medium transition-all
                        ${
                          discountType === 'сумма'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      Сумма
                    </button>
                  </div>
                </div>

                <Input
                  label="Значение скидки"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'процент' ? '0-100' : '0'}
                />
              </div>
            )}
          </div>

          {calculatedPrice > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-4 border border-orange-200 dark:border-burgundy-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Итоговая цена:
                </span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {calculatedPrice.toFixed(2)} ₽
                </span>
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
              Создать заказ
            </Button>
          </div>
        </form>
      </Modal>

      {onCreateClient && (
        <CreateClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSubmit={handleCreateClient}
          loading={loading}
        />
      )}
    </>
  );
}
