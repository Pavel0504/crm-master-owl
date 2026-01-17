import { useState, useEffect } from 'react';
import { Users, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getAllClientsStats,
  Client,
  ClientInput,
  ClientStats,
} from '../services/clientService';
import { Button, FilterPanel, Input, ConfirmDialog } from '../components/ui';
import ClientCard from '../components/clients/ClientCard';
import CreateClientModal from '../components/clients/CreateClientModal';
import EditClientModal from '../components/clients/EditClientModal';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsStats, setClientsStats] = useState<Record<string, ClientStats>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const [filterOrdersFrom, setFilterOrdersFrom] = useState<string>('');
  const [filterOrdersTo, setFilterOrdersTo] = useState<string>('');
  const [filterSumFrom, setFilterSumFrom] = useState<string>('');
  const [filterSumTo, setFilterSumTo] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [clientsResult, statsResult] = await Promise.all([
      getClients(user.id),
      getAllClientsStats(user.id),
    ]);

    if (clientsResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setClients(clientsResult.data || []);
      setClientsStats(statsResult);
    }

    setLoading(false);
  };

  const handleCreateClient = async (data: ClientInput) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createClient(user.id, data);

    if (error) {
      setError('Не удалось создать клиента');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEditClient = async (data: ClientInput) => {
    if (!selectedClient) return;

    setActionLoading(true);
    const { error } = await updateClient(selectedClient.id, data);

    if (error) {
      setError('Не удалось обновить клиента');
    } else {
      await loadData();
      setSelectedClient(null);
    }

    setActionLoading(false);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    setActionLoading(true);
    const { error } = await deleteClient(clientToDelete.id);

    if (error) {
      setError('Не удалось удалить клиента');
    } else {
      await loadData();
      setClientToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const uniqueTags = Array.from(
    new Set(clients.filter((c) => c.tag_name).map((c) => c.tag_name))
  );

  const filteredClients = clients.filter((client) => {
    const stats = clientsStats[client.id] || { orders_count: 0, total_orders_sum: 0 };

    if (filterOrdersFrom && stats.orders_count < parseInt(filterOrdersFrom)) {
      return false;
    }

    if (filterOrdersTo && stats.orders_count > parseInt(filterOrdersTo)) {
      return false;
    }

    if (filterSumFrom && stats.total_orders_sum < parseFloat(filterSumFrom)) {
      return false;
    }

    if (filterSumTo && stats.total_orders_sum > parseFloat(filterSumTo)) {
      return false;
    }

    if (filterTag && client.tag_name !== filterTag) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterOrdersFrom('');
    setFilterOrdersTo('');
    setFilterSumFrom('');
    setFilterSumTo('');
    setFilterTag('');
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
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Клиенты</h1>
              <p className="text-gray-600 dark:text-gray-400">База клиентов</p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Добавить клиента
          </Button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FilterPanel onReset={resetFilters} showActions={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Количество заказов от"
              type="number"
              min="0"
              value={filterOrdersFrom}
              onChange={(e) => setFilterOrdersFrom(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Количество заказов до"
              type="number"
              min="0"
              value={filterOrdersTo}
              onChange={(e) => setFilterOrdersTo(e.target.value)}
              placeholder="100"
            />

            <Input
              label="Сумма заказов от (руб.)"
              type="number"
              step="0.01"
              min="0"
              value={filterSumFrom}
              onChange={(e) => setFilterSumFrom(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Сумма заказов до (руб.)"
              type="number"
              step="0.01"
              min="0"
              value={filterSumTo}
              onChange={(e) => setFilterSumTo(e.target.value)}
              placeholder="100000"
            />

            {uniqueTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Метка
                </label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:ring-2 focus:ring-orange-500 dark:focus:ring-burgundy-600 focus:border-transparent transition-all"
                >
                  <option value="">Все метки</option>
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(filterOrdersFrom ||
            filterOrdersTo ||
            filterSumFrom ||
            filterSumTo ||
            filterTag) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
              Сбросить фильтры
            </Button>
          )}
        </FilterPanel>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет клиентов
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {clients.length === 0
              ? 'Добавьте первого клиента для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {clients.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Добавить клиента
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              stats={clientsStats[client.id] || { orders_count: 0, total_orders_sum: 0 }}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClient}
        loading={actionLoading}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        onSubmit={handleEditClient}
        client={selectedClient}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleDeleteClient}
        title="Удалить клиента?"
        message={
          <>
            Вы уверены что хотите удалить клиента{' '}
            <strong>{clientToDelete?.full_name}</strong>? Это действие нельзя отменить.
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
