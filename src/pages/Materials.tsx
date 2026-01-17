import { useState, useEffect } from 'react';
import { Package, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  Material,
  MaterialInput,
} from '../services/materialService';
import {
  getMaterialCategories,
  createMaterialCategory,
  MaterialCategory,
} from '../services/materialCategoryService';
import { Button, FilterPanel, Select, DatePicker, ConfirmDialog, PageHeader } from '../components/ui';
import MaterialCard from '../components/materials/MaterialCard';
import CreateCategoryModal from '../components/materials/CreateCategoryModal';
import CreateMaterialModal from '../components/materials/CreateMaterialModal';
import EditMaterialModal from '../components/materials/EditMaterialModal';

export default function Materials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [materialsResult, categoriesResult] = await Promise.all([
      getMaterials(user.id),
      getMaterialCategories(user.id),
    ]);

    if (materialsResult.error || categoriesResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setMaterials(materialsResult.data || []);
      setCategories(categoriesResult.data || []);
    }

    setLoading(false);
  };

  const handleCreateCategory = async (data: { name: string; parent_id: string | null }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createMaterialCategory(user.id, data);

    if (error) {
      setError('Не удалось создать категорию');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleCreateMaterial = async (data: MaterialInput) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createMaterial(user.id, data);

    if (error) {
      setError('Не удалось создать материал');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEditMaterial = async (data: MaterialInput) => {
    if (!selectedMaterial) return;

    setActionLoading(true);
    const { error } = await updateMaterial(selectedMaterial.id, data);

    if (error) {
      setError('Не удалось обновить материал');
    } else {
      await loadData();
      setSelectedMaterial(null);
    }

    setActionLoading(false);
  };

  const handleDeleteMaterial = async () => {
    if (!materialToDelete) return;

    setActionLoading(true);
    const { error } = await deleteMaterial(materialToDelete.id);

    if (error) {
      setError('Не удалось удалить материал');
    } else {
      await loadData();
      setMaterialToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (material: Material) => {
    setMaterialToDelete(material);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };

  const filteredMaterials = materials.filter((material) => {
    if (filterCategory && material.category_id !== filterCategory) {
      return false;
    }

    if (filterDateFrom && material.purchase_date < filterDateFrom) {
      return false;
    }

    if (filterDateTo && material.purchase_date > filterDateTo) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<Package className="h-6 w-6 text-white" />}
          title="Материалы"
          subtitle="Управление материалами для изделий"
          actions={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                size="md"
              >
                <FolderPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Категория</span>
                <span className="sm:hidden">Кат.</span>
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                size="md"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Добавить материал</span>
                <span className="sm:hidden">Добавить</span>
              </Button>
            </>
          }
        />

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
              label="Дата закупки от"
              value={filterDateFrom}
              onChange={setFilterDateFrom}
            />

            <DatePicker
              label="Дата закупки до"
              value={filterDateTo}
              onChange={setFilterDateTo}
            />
          </div>

          {(filterCategory || filterDateFrom || filterDateTo) && (
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

      {filteredMaterials.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет материалов
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {materials.length === 0
              ? 'Добавьте первый материал для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {materials.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Добавить материал
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
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

      <CreateMaterialModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMaterial}
        categories={categories}
        loading={actionLoading}
      />

      <EditMaterialModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSubmit={handleEditMaterial}
        categories={categories}
        material={selectedMaterial}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={handleDeleteMaterial}
        title="Удалить материал?"
        message={
          <>
            Вы уверены что хотите удалить материал{' '}
            <strong>{materialToDelete?.name}</strong>? Это действие нельзя отменить.
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
