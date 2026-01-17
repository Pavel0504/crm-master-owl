import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, DatePicker } from '../ui';
import { OrderWithItems } from '../../services/orderService';
import { Client } from '../../services/clientService';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    client_id?: string | null;
    order_date?: string;
    deadline?: string | null;
    source?: string;
    delivery?: string;
    status?: string;
  }) => Promise<void>;
  order: OrderWithItems | null;
  clients: Client[];
  loading?: boolean;
}

export default function EditOrderModal({
  isOpen,
  onClose,
  onSubmit,
  order,
  clients,
  loading = false,
}: EditOrderModalProps) {
  const [clientId, setClientId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [delivery, setDelivery] = useState<string>('');
  const [status, setStatus] = useState<string>('В процессе');

  useEffect(() => {
    if (order) {
      setClientId(order.client_id || '');
      setOrderDate(order.order_date);
      setDeadline(order.deadline || '');
      setSource(order.source);
      setDelivery(order.delivery);
      setStatus(order.status);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      client_id: clientId || null,
      order_date: orderDate,
      deadline: deadline || null,
      source,
      delivery,
      status,
    });

    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const clientOptions = [
    { value: '', label: 'Без клиента' },
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Редактировать заказ" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
          Примечание: При редактировании нельзя изменить состав заказа и цены. Эти параметры
          устанавливаются при создании заказа.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Клиент"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
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
