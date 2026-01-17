import { useState, useEffect } from 'react';
import { Box, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  Inventory as InventoryType,
  InventoryInput,
} from '../services/inventoryService';
import {
  getInventoryCategories,
  createInventoryCategory,
  InventoryCategory,
} from '../services/inventoryCategoryService';
import { Button, FilterPanel, Select, DatePicker, ConfirmDialog, Input } from '../components/ui';
import InventoryCard from '../components/inventory/InventoryCard';
import CreateCategoryModal from '../components/inventory/CreateCategoryModal';
import CreateInventoryModal from '../components/inventory/CreateInventoryModal';
import EditInventoryModal from '../components/inventory/EditInventoryModal';

export default function Inventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryType[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryType | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<InventoryType | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterWearFrom, setFilterWearFrom] = useState<string>('');
  const [filterWearTo, setFilterWearTo] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [inventoryResult, categoriesResult] = await Promise.all([
      getInventory(user.id),
      getInventoryCategories(user.id),
    ]);

    if (inventoryResult.error || categoriesResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setInventory(inventoryResult.data || []);
      setCategories(categoriesResult.data || []);
    }

    setLoading(false);
  };

  const handleCreateCategory = async (data: { name: string; parent_id: string | null }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createInventoryCategory(user.id, data);

    if (error) {
      setError('Не удалось создать категорию');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleCreateInventory = async (data: InventoryInput) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createInventory(user.id, data);

    if (error) {
      setError('Не удалось создать инвентарь');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEditInventory = async (data: InventoryInput) => {
    if (!selectedInventory) return;

    setActionLoading(true);
    const { error } = await updateInventory(selectedInventory.id, data);

    if (error) {
      setError('Не удалось обновить инвентарь');
    } else {
      await loadData();
      setSelectedInventory(null);
    }

    setActionLoading(false);
  };

  const handleDeleteInventory = async () => {
    if (!inventoryToDelete) return;

    setActionLoading(true);
    const { error } = await deleteInventory(inventoryToDelete.id);

    if (error) {
      setError('Не удалось удалить инвентарь');
    } else {
      await loadData();
      setInventoryToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (item: InventoryType) => {
    setInventoryToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (item: InventoryType) => {
    setSelectedInventory(item);
    setIsEditModalOpen(true);
  };

  const filteredInventory = inventory.filter((item) => {
    if (filterCategory && item.category_id !== filterCategory) {
      return false;
    }

    if (filterDateFrom && item.purchase_date < filterDateFrom) {
      return false;
    }

    if (filterDateTo && item.purchase_date > filterDateTo) {
      return false;
    }

    if (filterWearFrom && item.wear_percentage < parseFloat(filterWearFrom)) {
      return false;
    }

    if (filterWearTo && item.wear_percentage > parseFloat(filterWearTo)) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterWearFrom('');
    setFilterWearTo('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 dark:text-burgundy-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-xl flex items-center justify-center">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Инвентарь</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Учет инструментов и оборудования
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-5 w-5" />
              Категория
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Добавить инвентарь
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FilterPanel onReset={resetFilters} showActions={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Категория"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: '', label: 'Все категории' },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />

            <DatePicker
              label="Дата покупки от"
              value={filterDateFrom}
              onChange={setFilterDateFrom}
            />

            <DatePicker
              label="Дата покупки до"
              value={filterDateTo}
              onChange={setFilterDateTo}
            />

            <Input
              label="Процент износа от"
              type="number"
              min="0"
              max="100"
              value={filterWearFrom}
              onChange={(e) => setFilterWearFrom(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Процент износа до"
              type="number"
              min="0"
              max="100"
              value={filterWearTo}
              onChange={(e) => setFilterWearTo(e.target.value)}
              placeholder="100"
            />
          </div>

          {(filterCategory || filterDateFrom || filterDateTo || filterWearFrom || filterWearTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="mt-2"
            >
              Сбросить фильтры
            </Button>
          )}
        </FilterPanel>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <Box className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет инвентаря
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {inventory.length === 0
              ? 'Добавьте первый инвентарь для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {inventory.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Добавить инвентарь
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInventory.map((item) => (
            <InventoryCard
              key={item.id}
              inventory={item}
              categories={categories}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        categories={categories}
        loading={actionLoading}
      />

      <CreateInventoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInventory}
        categories={categories}
        loading={actionLoading}
      />

      <EditInventoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInventory(null);
        }}
        onSubmit={handleEditInventory}
        categories={categories}
        inventory={selectedInventory}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setInventoryToDelete(null);
        }}
        onConfirm={handleDeleteInventory}
        title="Удалить инвентарь?"
        message={
          <>
            Вы уверены что хотите удалить инвентарь{' '}
            <strong>{inventoryToDelete?.name}</strong>? Это действие нельзя отменить.
          </>
        }
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
