import { useState, useEffect } from 'react';
import { Users, Plus, FolderPlus, Loader2 } from 'lucide-react';
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
import {
  getClientCategories,
  createClientCategory,
  updateClientCategory,
  deleteClientCategory,
  ClientCategory,
} from '../services/clientCategoryService';
import { Button, FilterPanel, Input, ConfirmDialog, PageHeader, SortBar } from '../components/ui';
import SearchInput from '../components/ui/SearchInput';
import ClientCard from '../components/clients/ClientCard';
import CreateClientModal from '../components/clients/CreateClientModal';
import EditClientModal from '../components/clients/EditClientModal';
import CreateCategoryModal from '../components/clients/CreateCategoryModal';
import CategoryTab from '../components/categories/CategoryTab';

type TabType = 'clients' | 'categories';

export default function Clients() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<ClientCategory[]>([]);
  const [clientsStats, setClientsStats] = useState<Record<string, ClientStats>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
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

    const [clientsResult, categoriesResult, statsResult] = await Promise.all([
      getClients(user.id),
      getClientCategories(user.id),
      getAllClientsStats(user.id),
    ]);

    if (clientsResult.error || categoriesResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setClients(clientsResult.data || []);
      setCategories(categoriesResult.data || []);
      setClientsStats(statsResult);
    }

    setLoading(false);
  };

  const handleCreateCategory = async (data: { name: string; parent_id: string | null }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createClientCategory(user.id, data);

    if (error) {
      setError('Не удалось создать категорию');
    } else {
      await loadData();
    }

    setActionLoading(false);
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
  ).sort((a, b) => a.localeCompare(b, 'ru'));

  const filteredClients = clients.filter((client) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = client.full_name.toLowerCase().includes(query);
      const matchesPhone = client.phone.toLowerCase().includes(query);
      const matchesAddress = client.address.toLowerCase().includes(query);
      const matchesTag = client.tag_name.toLowerCase().includes(query);
      if (!matchesName && !matchesPhone && !matchesAddress && !matchesTag) {
        return false;
      }
    }

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

  const sortedClients = [...filteredClients].sort((a, b) => {
    let compareValue = 0;
    const stats_a = clientsStats[a.id] || { orders_count: 0, total_orders_sum: 0 };
    const stats_b = clientsStats[b.id] || { orders_count: 0, total_orders_sum: 0 };

    switch (sortBy) {
      case 'name':
        compareValue = a.full_name.localeCompare(b.full_name, 'ru');
        break;
      case 'orders_count':
        compareValue = stats_a.orders_count - stats_b.orders_count;
        break;
      case 'total_sum':
        compareValue = stats_a.total_orders_sum - stats_b.total_orders_sum;
        break;
      default:
        compareValue = a.full_name.localeCompare(b.full_name, 'ru');
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  const resetFilters = () => {
    setFilterOrdersFrom('');
    setFilterOrdersTo('');
    setFilterSumFrom('');
    setFilterSumTo('');
    setFilterTag('');
    setSearchQuery('');
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<Users className="h-6 w-6 text-white" />}
          title="Клиенты"
          subtitle="База клиентов"
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
              {activeTab === 'clients' && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                  size="md"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Добавить клиента</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              )}
            </div>
          }
        />

        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('clients')}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'clients'
                    ? 'border-orange-500 dark:border-burgundy-600 text-orange-600 dark:text-burgundy-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              Клиенты
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

        {activeTab === 'clients' && (
          <>
            <div className="mt-6">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск по имени, телефону, адресу или тегу..."
              />
            </div>

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

            <div className="mt-4">
              <SortBar
                options={[
                  { value: 'name', label: 'По имени' },
                  { value: 'orders_count', label: 'По количеству заказов' },
                  { value: 'total_sum', label: 'По сумме заказов' },
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
                const { error } = await updateClientCategory(id, data);
                if (error) {
                  setError('Не удалось обновить категорию');
                } else {
                  await loadData();
                }
                setActionLoading(false);
              }}
              onDelete={async (id) => {
                setActionLoading(true);
                const { error } = await deleteClientCategory(id);
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

      {activeTab === 'clients' && (
        <>
          {sortedClients.length === 0 ? (
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
              {sortedClients.map((client) => (
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
        </>
      )}

      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        categories={categories}
        loading={actionLoading}
      />

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClient}
        loading={actionLoading}
        categories={categories}
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
        categories={categories}
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
