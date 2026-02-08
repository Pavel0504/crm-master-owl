import { useState, useEffect } from 'react';
import { Users, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  Employee,
  EmployeeInput,
} from '../services/employeeService';
import { Button, FilterPanel, Select, ConfirmDialog, PageHeader } from '../components/ui';
import EmployeeCard from '../components/employees/EmployeeCard';
import CreateEmployeeModal from '../components/employees/CreateEmployeeModal';
import EditEmployeeModal from '../components/employees/EditEmployeeModal';
import InviteLinkModal from '../components/employees/InviteLinkModal';

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);

  const [filterRole, setFilterRole] = useState<string>('');
  const [filterPosition, setFilterPosition] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getEmployees(user.id);

    if (fetchError) {
      setError('Не удалось загрузить данные');
    } else {
      setEmployees(data || []);
    }

    setLoading(false);
  };

  const handleCreateEmployee = async (data: EmployeeInput) => {
    if (!user) return;

    setActionLoading(true);
    const { data: newEmployee, error } = await createEmployee(user.id, data);

    if (error) {
      setError(error.message || 'Не удалось создать сотрудника');
      setActionLoading(false);
    } else if (newEmployee) {
      await loadData();
      setCreatedEmployee(newEmployee);
      setIsInviteLinkModalOpen(true);
      setActionLoading(false);
    }
  };

  const handleEditEmployee = async (data: EmployeeInput) => {
    if (!selectedEmployee) return;

    setActionLoading(true);
    const { error } = await updateEmployee(selectedEmployee.id, data);

    if (error) {
      setError('Не удалось обновить сотрудника');
    } else {
      await loadData();
      setSelectedEmployee(null);
    }

    setActionLoading(false);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setActionLoading(true);
    const { error } = await deleteEmployee(employeeToDelete.id);

    if (error) {
      setError('Не удалось удалить сотрудника');
    } else {
      await loadData();
      setEmployeeToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const uniquePositions = Array.from(
    new Set(
      employees
        .filter((e) => e.position_name && e.position_name.trim() !== '')
        .map((e) => e.position_name)
    )
  ).sort((a, b) => a.localeCompare(b, 'ru'));

  const filteredEmployees = employees.filter((employee) => {
    if (filterRole && employee.role !== filterRole) {
      return false;
    }

    if (filterPosition && employee.position_name !== filterPosition) {
      return false;
    }

    return true;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    return a.full_name.localeCompare(b.full_name, 'ru');
  });

  const resetFilters = () => {
    setFilterRole('');
    setFilterPosition('');
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<Users className="h-6 w-6 text-white" />}
          title="Сотрудники"
          subtitle="Управление сотрудниками"
          actions={
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              size="md"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Создать сотрудника</span>
              <span className="sm:hidden">Создать</span>
            </Button>
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
              label="Роль"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              options={[
                { value: '', label: 'Все роли' },
                { value: 'admin', label: 'Администратор' },
                { value: 'user', label: 'Пользователь' },
              ]}
            />

            {uniquePositions.length > 0 && (
              <Select
                label="Должность"
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                options={[
                  { value: '', label: 'Все должности' },
                  ...uniquePositions.map((pos) => ({
                    value: pos,
                    label: pos,
                  })),
                ]}
              />
            )}
          </div>

          {(filterRole || filterPosition) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
              Сбросить фильтры
            </Button>
          )}
        </FilterPanel>
      </div>

      {sortedEmployees.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет сотрудников
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {employees.length === 0
              ? 'Создайте первого сотрудника для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {employees.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Создать сотрудника
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEmployee}
        loading={actionLoading}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleEditEmployee}
        employee={selectedEmployee}
        loading={actionLoading}
      />

      <InviteLinkModal
        isOpen={isInviteLinkModalOpen}
        onClose={() => {
          setIsInviteLinkModalOpen(false);
          setCreatedEmployee(null);
        }}
        employee={createdEmployee}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleDeleteEmployee}
        title="Удалить сотрудника?"
        message={
          <>
            Вы уверены что хотите удалить сотрудника{' '}
            <strong>{employeeToDelete?.full_name}</strong>? Это действие нельзя отменить.
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
