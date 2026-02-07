import { useState } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { RecipeCategory } from '../../services/recipeCategoryService';

interface CreateRecipeCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; parent_id: string | null }) => Promise<void>;
  categories: RecipeCategory[];
  loading?: boolean;
}

export default function CreateRecipeCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  loading = false,
}: CreateRecipeCategoryModalProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      parent_id: parentId || null,
    });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setParentId('');
    onClose();
  };

  const categoryOptions = [
    { value: '', label: 'Нет (корневая категория)' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать категорию рецепта"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Например: Выпечка"
        />

        <Select
          label="Родительская категория"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          options={categoryOptions}
        />

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
