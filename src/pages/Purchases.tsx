import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPurchasePlans,
  createPurchasePlan,
  updatePurchasePlan,
  deletePurchasePlan,
  PurchasePlan,
  PurchasePlanInput,
} from '../services/purchaseService';
import {
  getPurchaseCategories,
  createPurchaseCategory,
  updatePurchaseCategory,
  deletePurchaseCategory,
  PurchaseCategory,
} from '../services/purchaseCategoryService';
import { Button, PageHeader, ConfirmDialog, FilterPanel, DatePicker, Input, SortBar } from '../components/ui';
import SearchInput from '../components/ui/SearchInput';
import PurchaseCard from '../components/purchases/PurchaseCard';
import CreatePurchaseModal from '../components/purchases/CreatePurchaseModal';
import EditPurchaseModal from '../components/purchases/EditPurchaseModal';
import CreateCategoryModal from '../components/purchases/CreateCategoryModal';
import CategoryTab from '../components/categories/CategoryTab';

type TabType = 'purchases' | 'categories';

export default function Purchases() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('purchases');
  const [purchases, setPurchases] = useState<PurchasePlan[]>([]);
  const [categories, setCategories] = useState<PurchaseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchasePlan | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<PurchasePlan | null>(null);

  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterAmountFrom, setFilterAmountFrom] = useState<string>('');
  const [filterAmountTo, setFilterAmountTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [purchasesResult, categoriesResult] = await Promise.all([
      getPurchasePlans(user.id),
      getPurchaseCategories(user.id),
    ]);

    if (purchasesResult.error || categoriesResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setPurchases(purchasesResult.data || []);
      setCategories(categoriesResult.data || []);
    }

    setLoading(false);
  };

  const handleCreateCategory = async (data: { name: string; parent_id: string | null }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createPurchaseCategory(user.id, data);

    if (error) {
      setError('Не удалось создать категорию');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleCreate = async (data: PurchasePlanInput) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createPurchasePlan(user.id, data);

    if (error) {
      setError('Не удалось создать закупку');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEdit = async (data: PurchasePlanInput) => {
    if (!selectedPurchase) return;

    setActionLoading(true);
    const { error } = await updatePurchasePlan(selectedPurchase.id, data);

    if (error) {
      setError('Не удалось обновить закупку');
    } else {
      await loadData();
      setSelectedPurchase(null);
    }

    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!purchaseToDelete) return;

    setActionLoading(true);
    const { error } = await deletePurchasePlan(purchaseToDelete.id);

    if (error) {
      setError('Не удалось удалить закупку');
    } else {
      await loadData();
      setPurchaseToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openEditModal = (purchase: PurchasePlan) => {
    setSelectedPurchase(purchase);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (purchase: PurchasePlan) => {
    setPurchaseToDelete(purchase);
    setIsDeleteDialogOpen(true);
  };

  const filteredPurchases = purchases.filter((purchase) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = purchase.name.toLowerCase().includes(query);
      const matchesDelivery = purchase.delivery_method.toLowerCase().includes(query);
      const matchesNotes = purchase.notes.toLowerCase().includes(query);
      if (!matchesName && !matchesDelivery && !matchesNotes) {
        return false;
      }
    }

    if (filterDateFrom && purchase.created_at < filterDateFrom) {
      return false;
    }

    if (filterDateTo && purchase.created_at > filterDateTo) {
      return false;
    }

    if (filterAmountFrom && purchase.amount < parseFloat(filterAmountFrom)) {
      return false;
    }

    if (filterAmountTo && purchase.amount > parseFloat(filterAmountTo)) {
      return false;
    }

    return true;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name, 'ru');
        break;
      case 'created_at':
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'amount':
        compareValue = a.amount - b.amount;
        break;
      default:
        compareValue = a.name.localeCompare(b.name, 'ru');
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  const resetFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterAmountFrom('');
    setFilterAmountTo('');
    setSearchQuery('');
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<ShoppingBag className="h-6 w-6 text-white" />}
          title="Будущие покупки"
          subtitle="Планирование закупок материалов"
          actions={
            <div className="flex gap-2">
              {activeTab === 'categories' && (
                <Button
                  variant="secondary"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                  size="md"
                >
                  <FolderPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Создать категорию</span>
                  <span className="sm:hidden">Категория</span>
                </Button>
              )}
              {activeTab === 'purchases' && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                  size="md"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Создать список закупки</span>
                  <span className="sm:hidden">Создать</span>
                </Button>
              )}
            </div>
          }
        />

        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'purchases'
                    ? 'border-orange-500 dark:border-burgundy-600 text-orange-600 dark:text-burgundy-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              Закупки
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'categories'
                    ? 'border-orange-500 dark:border-burgundy-600 text-orange-600 dark:text-burgundy-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              Категории
            </button>
          </nav>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === 'purchases' && (
          <>
            <div className="mt-6">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск по названию, способу доставки или заметкам..."
              />
            </div>

            <FilterPanel onReset={resetFilters} showActions={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Дата создания от"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />

                <DatePicker
                  label="Дата создания до"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />

                <Input
                  label="Сумма от (₽)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filterAmountFrom}
                  onChange={(e) => setFilterAmountFrom(e.target.value)}
                  placeholder="0"
                />

                <Input
                  label="Сумма до (₽)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filterAmountTo}
                  onChange={(e) => setFilterAmountTo(e.target.value)}
                  placeholder="0"
                />
              </div>

              {(filterDateFrom || filterDateTo || filterAmountFrom || filterAmountTo) && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
                  Сбросить фильтры
                </Button>
              )}
            </FilterPanel>

            <div className="mt-4">
              <SortBar
                options={[
                  { value: 'name', label: 'По названию' },
                  { value: 'created_at', label: 'По дате создания' },
                  { value: 'amount', label: 'По сумме' },
                ]}
                value={sortBy}
                direction={sortDirection}
                onChange={setSortBy}
                onDirectionChange={setSortDirection}
              />
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <div className="mt-6">
            <CategoryTab
              categories={categories}
              onEdit={async (id, data) => {
                setActionLoading(true);
                const { error } = await updatePurchaseCategory(id, data);
                if (error) {
                  setError('Не удалось обновить категорию');
                } else {
                  await loadData();
                }
                setActionLoading(false);
              }}
              onDelete={async (id) => {
                setActionLoading(true);
                const { error } = await deletePurchaseCategory(id);
                if (error) {
                  setError('Не удалось удалить категорию');
                } else {
                  await loadData();
                }
                setActionLoading(false);
              }}
              loading={actionLoading}
            />
          </div>
        )}
      </div>

      {activeTab === 'purchases' && (
        <>
          {sortedPurchases.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Нет запланированных покупок
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Создайте первую запись о планируемой закупке материалов
              </p>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Создать список закупки
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPurchases.map((purchase) => (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          )}
        </>
      )}

      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        categories={categories}
        loading={actionLoading}
      />

      <CreatePurchaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        loading={actionLoading}
        categories={categories}
      />

      <EditPurchaseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPurchase(null);
        }}
        onSubmit={handleEdit}
        purchase={selectedPurchase}
        loading={actionLoading}
        categories={categories}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPurchaseToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Удалить закупку?"
        message={
          <>
            Вы уверены что хотите удалить закупку{' '}
            <strong>{purchaseToDelete?.name}</strong>? Это действие нельзя отменить.
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
