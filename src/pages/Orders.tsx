import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderWithDetails,
  calculateOrderPrice,
  Order,
  OrderWithItems,
  OrderItemInput,
} from '../services/orderService';
import { getClients, createClient, Client, ClientInput } from '../services/clientService';
import { getProducts, Product } from '../services/productService';
import { Button, FilterPanel, Select, DatePicker, Input, ConfirmDialog } from '../components/ui';
import OrderCard from '../components/orders/OrderCard';
import CreateOrderModal from '../components/orders/CreateOrderModal';
import EditOrderModal from '../components/orders/EditOrderModal';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersWithDetails, setOrdersWithDetails] = useState<OrderWithItems[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderWithItems | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterPriceFrom, setFilterPriceFrom] = useState<string>('');
  const [filterPriceTo, setFilterPriceTo] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [ordersResult, clientsResult, productsResult] = await Promise.all([
      getOrders(user.id),
      getClients(user.id),
      getProducts(user.id),
    ]);

    if (ordersResult.error || clientsResult.error || productsResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setOrders(ordersResult.data || []);
      setClients(clientsResult.data || []);
      setProducts(productsResult.data || []);

      const detailsPromises = (ordersResult.data || []).map((order) =>
        getOrderWithDetails(order.id)
      );

      const detailsResults = await Promise.all(detailsPromises);
      const details = detailsResults
        .filter((result) => result.data !== null)
        .map((result) => result.data!);

      setOrdersWithDetails(details);
    }

    setLoading(false);
  };

  const handleCalculatePrice = async (
    items: OrderItemInput[],
    bonusType: string,
    discountType: string,
    discountValue: number
  ): Promise<number> => {
    const { totalPrice } = await calculateOrderPrice(
      items,
      bonusType,
      discountType,
      discountValue
    );
    return totalPrice;
  };

  const handleCreateOrder = async (data: {
    client_id?: string | null;
    order_date?: string;
    deadline?: string | null;
    source?: string;
    delivery?: string;
    status?: string;
    bonus_type?: string;
    discount_type?: string;
    discount_value?: number;
    items: OrderItemInput[];
  }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createOrder(user.id, data);

    if (error) {
      setError(error.message || 'Не удалось создать заказ');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEditOrder = async (data: {
    client_id?: string | null;
    order_date?: string;
    deadline?: string | null;
    source?: string;
    delivery?: string;
    status?: string;
  }) => {
    if (!selectedOrder) return;

    setActionLoading(true);
    const { error } = await updateOrder(selectedOrder.id, data);

    if (error) {
      setError('Не удалось обновить заказ');
    } else {
      await loadData();
      setSelectedOrder(null);
    }

    setActionLoading(false);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setActionLoading(true);
    const { error } = await deleteOrder(orderToDelete.id);

    if (error) {
      setError('Не удалось удалить заказ');
    } else {
      await loadData();
      setOrderToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const handleCreateClient = async (clientData: ClientInput) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createClient(user.id, clientData);

    if (error) {
      setError('Не удалось создать клиента');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const openDeleteDialog = (order: OrderWithItems) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const filteredOrders = ordersWithDetails.filter((order) => {
    if (filterStatus && order.status !== filterStatus) {
      return false;
    }

    if (filterDateFrom && order.order_date < filterDateFrom) {
      return false;
    }

    if (filterDateTo && order.order_date > filterDateTo) {
      return false;
    }

    if (filterPriceFrom && order.total_price < parseFloat(filterPriceFrom)) {
      return false;
    }

    if (filterPriceTo && order.total_price > parseFloat(filterPriceTo)) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterPriceFrom('');
    setFilterPriceTo('');
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
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Заказы</h1>
              <p className="text-gray-600 dark:text-gray-400">Управление заказами</p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Создать заказ
          </Button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FilterPanel onReset={resetFilters} showActions={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Статус"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: '', label: 'Все статусы' },
                { value: 'В процессе', label: 'В процессе' },
                { value: 'На утверждении', label: 'На утверждении' },
                { value: 'Выполнен', label: 'Выполнен' },
                { value: 'Отменен', label: 'Отменен' },
              ]}
            />

            <DatePicker
              label="Дата заказа от"
              value={filterDateFrom}
              onChange={setFilterDateFrom}
            />

            <DatePicker
              label="Дата заказа до"
              value={filterDateTo}
              onChange={setFilterDateTo}
            />

            <Input
              label="Цена от (руб.)"
              type="number"
              step="0.01"
              min="0"
              value={filterPriceFrom}
              onChange={(e) => setFilterPriceFrom(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Цена до (руб.)"
              type="number"
              step="0.01"
              min="0"
              value={filterPriceTo}
              onChange={(e) => setFilterPriceTo(e.target.value)}
              placeholder="100000"
            />
          </div>

          {(filterStatus ||
            filterDateFrom ||
            filterDateTo ||
            filterPriceFrom ||
            filterPriceTo) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
              Сбросить фильтры
            </Button>
          )}
        </FilterPanel>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет заказов
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {orders.length === 0
              ? 'Создайте первый заказ для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {orders.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Создать заказ
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrder}
        clients={clients}
        products={products}
        loading={actionLoading}
        onCalculatePrice={handleCalculatePrice}
        onCreateClient={handleCreateClient}
      />

      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleEditOrder}
        order={selectedOrder}
        clients={clients}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteOrder}
        title="Удалить заказ?"
        message={
          <>
            Вы уверены что хотите удалить заказ{' '}
            <strong>№{orderToDelete?.order_number}</strong>? Это действие нельзя отменить.
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
