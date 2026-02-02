import { useState } from 'react';
import { Modal, Input, Button } from '../ui';
import { EmployeeInput, ALL_PAGES } from '../../services/employeeService';
import { Trash2, Plus } from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeInput) => Promise<void>;
  loading?: boolean;
}

const POSITION_COLORS = [
  { name: 'Серый', value: '#808080' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Оранжевый', value: '#f97316' },
  { name: 'Желтый', value: '#eab308' },
  { name: 'Зеленый', value: '#22c55e' },
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Фиолетовый', value: '#a855f7' },
  { name: 'Розовый', value: '#ec4899' },
];

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreateEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeInput>({
    full_name: '',
    phone: '',
    email: '',
    role: 'user',
    position_name: '',
    position_color: '#808080',
    allowed_pages: [],
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
      email: '',
      role: 'user',
      position_name: '',
      position_color: '#808080',
      allowed_pages: [],
    });
    onClose();
  };

  const addPage = (page: string) => {
    if (!formData.allowed_pages?.includes(page)) {
      setFormData({
        ...formData,
        allowed_pages: [...(formData.allowed_pages || []), page],
      });
    }
  };

  const removePage = (page: string) => {
    setFormData({
      ...formData,
      allowed_pages: formData.allowed_pages?.filter((p) => p !== page) || [],
    });
  };

  const availablePages = ALL_PAGES.filter(
    (page) => !formData.allowed_pages?.includes(page.value)
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать сотрудника" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="ФИО"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <Input
            label="Номер телефона"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+7 (999) 123-45-67"
          />

          <Input
            label="Почта"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="employee@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Роль
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, role: 'user', allowed_pages: [] })
              }
              className={`
                px-4 py-3 rounded-lg font-medium transition-all border-2
                ${
                  formData.role === 'user'
                    ? 'border-orange-500 dark:border-burgundy-500 bg-orange-50 dark:bg-burgundy-900/20 text-orange-700 dark:text-orange-300 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              Пользователь
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'admin' })}
              className={`
                px-4 py-3 rounded-lg font-medium transition-all border-2
                ${
                  formData.role === 'admin'
                    ? 'border-orange-500 dark:border-burgundy-500 bg-orange-50 dark:bg-burgundy-900/20 text-orange-700 dark:text-orange-300 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              Администратор
            </button>
          </div>
        </div>

        {formData.role === 'user' && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Доступ к страницам
            </h4>

            {formData.allowed_pages && formData.allowed_pages.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.allowed_pages.map((page) => {
                  const pageInfo = ALL_PAGES.find((p) => p.value === page);
                  return (
                    <div
                      key={page}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-2"
                    >
                      <span className="text-gray-900 dark:text-white font-medium">
                        {pageInfo?.label || page}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePage(page)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {availablePages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Добавить доступ
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addPage(e.target.value);
                    }
                  }}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-600 focus:border-transparent transition-all"
                >
                  <option value="">Выберите страницу...</option>
                  {availablePages.map((page) => (
                    <option key={page.value} value={page.value}>
                      {page.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(!formData.allowed_pages || formData.allowed_pages.length === 0) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                У сотрудника нет доступа ни к одной странице
              </p>
            )}
          </div>
        )}

        {formData.role === 'admin' && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">
              Администратор имеет полный доступ ко всем разделам системы
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название должности"
            value={formData.position_name}
            onChange={(e) =>
              setFormData({ ...formData, position_name: e.target.value })
            }
            placeholder="Например: Менеджер"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Цвет метки должности
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {POSITION_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, position_color: color.value })
                }
                className={`
                  relative w-full aspect-square rounded-lg border-2 transition-all
                  ${
                    formData.position_color === color.value
                      ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {formData.position_color === color.value && (
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
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
