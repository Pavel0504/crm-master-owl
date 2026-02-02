import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; parent_id: string | null }) => Promise<void>;
  category: Category | null;
  categories: Category[];
  loading?: boolean;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  categories,
  loading = false,
}: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setParentId(category.parent_id || '');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, parent_id: parentId || null });
  };

  const handleClose = () => {
    setName('');
    setParentId('');
    onClose();
  };

  const categoryOptions = [
    { value: '', label: 'Нет (корневая категория)' },
    ...categories
      .filter((cat) => cat.id !== category?.id)
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Редактировать категорию" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название категории"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Введите название категории"
          autoFocus
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
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
