import { useState, useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import CategoryItem from './CategoryItem';
import EditProductCategoryModal from '../products/EditProductCategoryModal';
import { ConfirmDialog } from '../ui';
import { ProductCategory } from '../../services/productCategoryService';
import { Inventory } from '../../services/inventoryService';

interface ProductCategoryTabProps {
  categories: ProductCategory[];
  inventory: Inventory[];
  onUpdate: (
    id: string,
    data: {
      name: string;
      parent_id: string | null;
      energy_costs_electricity: number;
      energy_costs_water: number;
      labor_cost_per_hour: number;
    },
    inventoryIds: string[]
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onLoadInventoryIds: (categoryId: string) => Promise<string[]>;
}

export default function ProductCategoryTab({
  categories,
  inventory,
  onUpdate,
  onDelete,
  onLoadInventoryIds,
}: ProductCategoryTabProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [currentInventoryIds, setCurrentInventoryIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const buildTree = (categories: ProductCategory[]): ProductCategory[] => {
    return categories.filter((cat) => cat.parent_id === null);
  };

  const getChildren = (parentId: string): ProductCategory[] => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  const handleEdit = async (category: ProductCategory) => {
    setSelectedCategory(category);
    setLoading(true);
    const inventoryIds = await onLoadInventoryIds(category.id);
    setCurrentInventoryIds(inventoryIds);
    setLoading(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateCategory = async (
    data: {
      name: string;
      parent_id: string | null;
      energy_costs_electricity: number;
      energy_costs_water: number;
      labor_cost_per_hour: number;
    },
    inventoryIds: string[]
  ) => {
    if (!selectedCategory) return;

    setLoading(true);
    const success = await onUpdate(selectedCategory.id, data, inventoryIds);
    setLoading(false);

    if (success) {
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      setCurrentInventoryIds([]);
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

      <EditProductCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
          setCurrentInventoryIds([]);
        }}
        onSubmit={handleUpdateCategory}
        category={selectedCategory}
        categories={categories}
        inventory={inventory}
        currentInventoryIds={currentInventoryIds}
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
