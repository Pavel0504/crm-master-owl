import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { RecipeCategory } from '../../services/recipeCategoryService';
import { RecipeWithSteps, RecipeInput } from '../../services/recipeService';
import { Plus, Trash2, Hash, Clock, Scale } from 'lucide-react';

interface RecipeStepEntry {
  step_text: string;
  step_type: string | null;
  step_value: string;
}

interface EditRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecipeInput) => Promise<void>;
  categories: RecipeCategory[];
  recipe: RecipeWithSteps | null;
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

export default function EditRecipeModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  recipe,
  loading = false,
}: EditRecipeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#808080');
  const [steps, setSteps] = useState<RecipeStepEntry[]>([
    { step_text: '', step_type: null, step_value: '' },
  ]);

  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setDescription(recipe.description);
      setCategoryId(recipe.category_id || '');
      setTagName(recipe.tag_name);
      setTagColor(recipe.tag_color);

      if (recipe.steps && recipe.steps.length > 0) {
        setSteps(
          recipe.steps.map((step) => ({
            step_text: step.step_text,
            step_type: step.step_type,
            step_value: step.step_value || '',
          }))
        );
      } else {
        setSteps([{ step_text: '', step_type: null, step_value: '' }]);
      }
    }
  }, [recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validSteps = steps.filter((step) => step.step_text.trim() !== '');

    await onSubmit({
      name,
      description,
      category_id: categoryId || null,
      tag_name: tagName,
      tag_color: tagColor,
      steps: validSteps,
    });

    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const addStep = () => {
    setSteps([...steps, { step_text: '', step_type: null, step_value: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStepText = (index: number, value: string) => {
    const updated = [...steps];
    updated[index].step_text = value;
    setSteps(updated);
  };

  const updateStepType = (index: number, type: string | null) => {
    const updated = [...steps];
    if (updated[index].step_type === type) {
      updated[index].step_type = null;
      updated[index].step_value = '';
    } else {
      updated[index].step_type = type;
    }
    setSteps(updated);
  };

  const updateStepValue = (index: number, value: string) => {
    const updated = [...steps];
    updated[index].step_value = value;
    setSteps(updated);
  };

  const categoryOptions = [
    { value: '', label: 'Без категории' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Редактировать рецепт" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Например: Шоколадный торт"
          />

          <Select
            label="Категория"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание рецепта..."
            rows={3}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Метка"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Например: Десерт, Основное блюдо"
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
                onClick={() => setTagColor(color.value)}
                className={`
                  relative w-full aspect-square rounded-lg border-2 transition-all
                  ${
                    tagColor === color.value
                      ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {tagColor === color.value && (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Пункты рецепта
          </label>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex gap-2 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={step.step_text}
                      onChange={(e) => updateStepText(index, e.target.value)}
                      placeholder="Описание пункта"
                      required
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="flex-shrink-0 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => updateStepType(index, 'quantity')}
                    className={`
                      flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        step.step_type === 'quantity'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <Hash className="h-4 w-4" />
                    Количество
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStepType(index, 'time')}
                    className={`
                      flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        step.step_type === 'time'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <Clock className="h-4 w-4" />
                    Время
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStepType(index, 'weight')}
                    className={`
                      flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        step.step_type === 'weight'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <Scale className="h-4 w-4" />
                    Вес
                  </button>
                </div>

                {step.step_type && (
                  <Input
                    value={step.step_value}
                    onChange={(e) => updateStepValue(index, e.target.value)}
                    placeholder={
                      step.step_type === 'quantity'
                        ? 'Например: 2 шт'
                        : step.step_type === 'time'
                        ? 'Например: 30 минут'
                        : 'Например: 500 грамм'
                    }
                  />
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addStep}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Добавить пункт
            </Button>
          </div>
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
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
