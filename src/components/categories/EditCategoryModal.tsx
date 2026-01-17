import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';

interface Category {
  id: string;
  name: string;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  category: Category | null;
  loading?: boolean;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  loading = false,
}: EditCategoryModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(name);
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

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
