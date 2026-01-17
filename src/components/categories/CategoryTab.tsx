import { useState } from 'react';
import { FolderOpen, FolderClosed } from 'lucide-react';
import CategoryItem from './CategoryItem';
import EditCategoryModal from './EditCategoryModal';
import { ConfirmDialog } from '../ui';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategoryTabProps {
  categories: Category[];
  onUpdate: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function CategoryTab({ categories, onUpdate, onDelete }: CategoryTabProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const buildTree = (categories: Category[]): Category[] => {
    return categories.filter((cat) => cat.parent_id === null);
  };

  const getChildren = (parentId: string): Category[] => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateCategory = async (name: string) => {
    if (!selectedCategory) return;

    setLoading(true);
    const success = await onUpdate(selectedCategory.id, name);
    setLoading(false);

    if (success) {
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    const success = await onDelete(categoryToDelete.id);
    setLoading(false);

    if (success) {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const rootCategories = buildTree(categories);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Нет категорий
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Создайте первую категорию на соответствующей странице
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {rootCategories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            getChildren={getChildren}
            onEdit={handleEdit}
            onDelete={handleDelete}
            level={0}
          />
        ))}
      </div>

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleUpdateCategory}
        category={selectedCategory}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Удалить категорию?"
        message={
          <>
            Вы уверены что хотите удалить категорию{' '}
            <strong>{categoryToDelete?.name}</strong>? Все дочерние категории также будут удалены.
          </>
        }
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
