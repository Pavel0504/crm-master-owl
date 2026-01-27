import { useState } from 'react';
import { Modal, Input, Button, DatePicker, DynamicFieldArray } from '../ui';
import { TaskInput } from '../../services/taskService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskInput) => Promise<void>;
  initialDate?: Date;
  loading?: boolean;
}

const PREDEFINED_TAGS = [
  'Работа',
  'Личное',
  'Семья',
  'Здоровье',
  'Учеба',
  'Покупки',
  'Финансы',
  'Творчество',
];

const TAG_COLORS: Record<string, string> = {
  'Работа': '#3b82f6',
  'Личное': '#10b981',
  'Семья': '#ec4899',
  'Здоровье': '#ef4444',
  'Учеба': '#8b5cf6',
  'Покупки': '#f59e0b',
  'Финансы': '#14b8a6',
  'Творчество': '#f97316',
};

interface ChecklistItem {
  title: string;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  loading = false,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(
    initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);
  const [priority, setPriority] = useState<'низкая' | 'средняя' | 'высокая'>('средняя');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([{ title: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(startDate) > new Date(endDate)) {
      alert('Дата начала не может быть позже даты окончания');
      return;
    }

    const finalTag = showCustomTag ? customTag : tag;

    await onSubmit({
      title,
      start_date: startDate,
      end_date: endDate,
      description,
      tag: finalTag,
      priority,
      checklist: checklist.filter((item) => item.title.trim() !== ''),
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setTag('');
    setCustomTag('');
    setShowCustomTag(false);
    setPriority('средняя');
    setChecklist([{ title: '' }]);
    onClose();
  };

  const addChecklistItem = () => {
    setChecklist([...checklist, { title: '' }]);
  };

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, title: string) => {
    const updated = [...checklist];
    updated[index].title = title;
    setChecklist(updated);
  };

  const priorityButtons = [
    { value: 'низкая' as const, label: 'Низкая', color: 'bg-gray-200 dark:bg-gray-700' },
    { value: 'средняя' as const, label: 'Средняя', color: 'bg-yellow-200 dark:bg-yellow-900/40' },
    { value: 'высокая' as const, label: 'Высокая', color: 'bg-red-200 dark:bg-red-900/40' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать задачу" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название задачи"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Например: Завершить проект"
          autoFocus
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Дата начала"
            value={startDate}
            onChange={setStartDate}
            required
          />

          <DatePicker
            label="Дата окончания"
            value={endDate}
            onChange={setEndDate}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Описание задачи
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробное описание задачи..."
            rows={3}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Тег задачи
          </label>

          {!showCustomTag ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PREDEFINED_TAGS.map((tagOption) => (
                  <button
                    key={tagOption}
                    type="button"
                    onClick={() => setTag(tagOption)}
                    className={`
                      px-3 py-2 rounded-lg font-medium transition-all border-2
                      ${
                        tag === tagOption
                          ? 'border-orange-500 dark:border-burgundy-500 shadow-md'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }
                    `}
                    style={{
                      backgroundColor: tag === tagOption ? TAG_COLORS[tagOption] + '40' : undefined,
                    }}
                  >
                    {tagOption}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCustomTag(true)}
                className="text-sm text-orange-600 dark:text-burgundy-400 hover:underline"
              >
                + Создать свой тег
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Введите свой тег"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomTag(false);
                  setCustomTag('');
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                Выбрать из предустановленных
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Степень важности
          </label>
          <div className="grid grid-cols-3 gap-3">
            {priorityButtons.map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setPriority(btn.value)}
                className={`
                  px-4 py-3 rounded-lg font-medium transition-all border-2
                  ${
                    priority === btn.value
                      ? 'border-orange-500 dark:border-burgundy-500 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                  ${btn.color}
                `}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Чек-лист
          </label>
          <DynamicFieldArray
            items={checklist}
            onAdd={addChecklistItem}
            onRemove={removeChecklistItem}
            renderItem={(item, index) => (
              <Input
                value={item.title}
                onChange={(e) => updateChecklistItem(index, e.target.value)}
                placeholder={`Пункт ${index + 1}`}
              />
            )}
            addButtonText="Добавить пункт"
            minItems={0}
          />
          {checklist.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
              Чек-лист пуст
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
            Создать задачу
          </Button>
        </div>
      </form>
    </Modal>
  );
}
