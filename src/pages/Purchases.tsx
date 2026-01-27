import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPurchasePlans,
  createPurchasePlan,
  updatePurchasePlan,
  deletePurchasePlan,
  PurchasePlan,
  PurchasePlanInput,
} from '../services/purchaseService';
import { Button, PageHeader, ConfirmDialog } from '../supabase';
import PurchaseCard from '../components/purchases/PurchaseCard';
import CreatePurchaseModal from '../components/purchases/CreatePurchaseModal';
import EditPurchaseModal from '../components/purchases/EditPurchaseModal';

export default function Purchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchasePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchasePlan | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<PurchasePlan | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getPurchasePlans(user.id);

    if (fetchError) {
      setError('Не удалось загрузить данные');
    } else {
      setPurchases(data || []);
    }

    setLoading(false);
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
          icon={<ShoppingBag className="h-6 w-6 text-white" />}
          title="Будущие покупки"
          subtitle="Планирование закупок материалов"
          actions={
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
          }
        />

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {purchases.length === 0 ? (
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
          {purchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreatePurchaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        loading={actionLoading}
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
