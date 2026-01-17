import { useState } from 'react';
import { Modal, Input, Button, DatePicker } from '../ui';
import { ClientInput } from '../../services/clientService';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientInput) => Promise<void>;
  loading?: boolean;
}

const TAG_COLORS = [
  { name: 'Серый', value: '#808080' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Оранжевый', value: '#f97316' },
  { name: 'Желтый', value: '#eab308' },
  { name: 'Зеленый', value: '#22c55e' },
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Фиолетовый', value: '#a855f7' },
  { name: 'Розовый', value: '#ec4899' },
];

export default function CreateClientModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreateClientModalProps) {
  const [formData, setFormData] = useState<ClientInput>({
    full_name: '',
    phone: '',
    social_link: '',
    address: '',
    birth_date: null,
    tag_name: '',
    tag_color: '#808080',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      phone: '',
      social_link: '',
      address: '',
      birth_date: null,
      tag_name: '',
      tag_color: '#808080',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить клиента" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Полное имя"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <Input
            label="Телефон"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+7 (999) 123-45-67"
          />

          <Input
            label="Ссылка на соц. сеть"
            type="url"
            value={formData.social_link}
            onChange={(e) => setFormData({ ...formData, social_link: e.target.value })}
            placeholder="https://instagram.com/username"
          />

          <div className="md:col-span-2">
            <Input
              label="Адрес"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
            />
          </div>

          <DatePicker
            label="Дата рождения"
            value={formData.birth_date || ''}
            onChange={(value) => setFormData({ ...formData, birth_date: value || null })}
          />

          <Input
            label="Название метки"
            value={formData.tag_name}
            onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
            placeholder="VIP, Постоянный клиент и т.д."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Цвет метки
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {TAG_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, tag_color: color.value })}
                className={`
                  relative w-full aspect-square rounded-lg border-2 transition-all
                  ${
                    formData.tag_color === color.value
                      ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {formData.tag_color === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white drop-shadow-lg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
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
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
