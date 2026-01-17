import { useState, useEffect } from 'react';
import { Truck, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  Supplier,
  SupplierInput,
} from '../services/supplierService';
import {
  getSupplierCategories,
  createSupplierCategory,
  SupplierCategory,
} from '../services/supplierCategoryService';
import { Button, FilterPanel, Select, ConfirmDialog, PageHeader } from '../components/ui';
import SupplierCard from '../components/suppliers/SupplierCard';
import CreateSupplierCategoryModal from '../components/suppliers/CreateSupplierCategoryModal';
import CreateSupplierModal from '../components/suppliers/CreateSupplierModal';
import EditSupplierModal from '../components/suppliers/EditSupplierModal';

export default function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDeliveryMethod, setFilterDeliveryMethod] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [suppliersResult, categoriesResult] = await Promise.all([
      getSuppliers(user.id),
      getSupplierCategories(user.id),
    ]);

    if (suppliersResult.error || categoriesResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setSuppliers(suppliersResult.data || []);
      setCategories(categoriesResult.data || []);
    }

    setLoading(false);
  };

  const handleCreateCategory = async (data: { name: string; parent_id: string | null }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createSupplierCategory(user.id, data);

    if (error) {
      setError('Не удалось создать категорию');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleCreateSupplier = async (data: SupplierInput) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createSupplier(user.id, data);

    if (error) {
      setError('Не удалось создать поставщика');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEditSupplier = async (data: SupplierInput) => {
    if (!selectedSupplier) return;

    setActionLoading(true);
    const { error } = await updateSupplier(selectedSupplier.id, data);

    if (error) {
      setError('Не удалось обновить поставщика');
    } else {
      await loadData();
      setSelectedSupplier(null);
    }

    setActionLoading(false);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    setActionLoading(true);
    const { error } = await deleteSupplier(supplierToDelete.id);

    if (error) {
      setError('Не удалось удалить поставщика');
    } else {
      await loadData();
      setSupplierToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const uniqueDeliveryMethods = Array.from(
    new Set(
      suppliers
        .map((s) => s.delivery_method)
        .filter((method) => method && method.trim() !== '')
    )
  );

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (filterCategory && supplier.category_id !== filterCategory) {
      return false;
    }

    if (filterDeliveryMethod && supplier.delivery_method !== filterDeliveryMethod) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterCategory('');
    setFilterDeliveryMethod('');
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
          icon={<Truck className="h-6 w-6 text-white" />}
          title="Поставщики"
          subtitle="Управление поставщиками"
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
                <span className="hidden sm:inline">Создать поставщика</span>
                <span className="sm:hidden">Создать</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {uniqueDeliveryMethods.length > 0 && (
              <Select
                label="Способ доставки"
                value={filterDeliveryMethod}
                onChange={(e) => setFilterDeliveryMethod(e.target.value)}
                options={[
                  { value: '', label: 'Все способы' },
                  ...uniqueDeliveryMethods.map((method) => ({
                    value: method,
                    label: method,
                  })),
                ]}
              />
            )}
          </div>

          {(filterCategory || filterDeliveryMethod) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
              Сбросить фильтры
            </Button>
          )}
        </FilterPanel>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <Truck className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет поставщиков
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {suppliers.length === 0
              ? 'Создайте первого поставщика для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {suppliers.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Создать поставщика
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              categories={categories}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreateSupplierCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        categories={categories}
        loading={actionLoading}
      />

      <CreateSupplierModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSupplier}
        categories={categories}
        loading={actionLoading}
      />

      <EditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleEditSupplier}
        categories={categories}
        supplier={selectedSupplier}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSupplierToDelete(null);
        }}
        onConfirm={handleDeleteSupplier}
        title="Удалить поставщика?"
        message={
          <>
            Вы уверены что хотите удалить поставщика{' '}
            <strong>{supplierToDelete?.name}</strong>? Это действие нельзя отменить.
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
