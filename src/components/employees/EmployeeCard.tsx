import { Edit2, Trash2, Calendar, Phone, Mail, Shield, Briefcase } from 'lucide-react';
import { Employee, ALL_PAGES } from '../../services/employeeService';
import { ExpandableCard, IconButton, Badge } from '../ui';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export default function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  const formattedDate = new Date(employee.created_at).toLocaleDateString('ru-RU');

  const getRoleName = (role: string) => {
    return role === 'admin' ? 'Администратор' : 'Пользователь';
  };

  const getRoleVariant = (role: string) => {
    return role === 'admin' ? 'success' : 'info';
  };

  const title = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {employee.full_name}
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        {!employee.joined && (
          <Badge variant="warning" size="md">
            Не присоединился
          </Badge>
        )}
        <Badge variant={getRoleVariant(employee.role)} size="md">
          {getRoleName(employee.role)}
        </Badge>
        {employee.position_name && (
          <Badge customColor={employee.position_color} size="md">
            {employee.position_name}
          </Badge>
        )}
      </div>
    </div>
  );

  const headerContent = (
    <>
      <div className="flex items-center gap-3 justify-between flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <IconButton
            icon={<Edit2 />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(employee);
            }}
          />
          <IconButton
            icon={<Trash2 />}
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(employee);
            }}
          />
        </div>
      </div>
    </>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <DetailItem
          icon={<Phone className="h-4 w-4" />}
          label="Телефон"
          value={employee.phone || 'Не указан'}
        />

        <DetailItem
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={employee.email}
        />

        <DetailItem
          icon={<Shield className="h-4 w-4" />}
          label="Роль"
          value={getRoleName(employee.role)}
        />

        {employee.position_name && (
          <DetailItem
            icon={<Briefcase className="h-4 w-4" />}
            label="Должность"
            value={employee.position_name}
          />
        )}

        <DetailItem
          icon={<Calendar className="h-4 w-4" />}
          label="Дата создания"
          value={formattedDate}
        />

        <DetailItem
          label="Статус"
          value={employee.joined ? 'Присоединился' : 'Не присоединился'}
        />
      </div>

      {employee.role === 'user' && employee.allowed_pages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Доступные страницы
          </h4>
          <div className="flex flex-wrap gap-2">
            {employee.allowed_pages.map((page) => {
              const pageInfo = ALL_PAGES.find((p) => p.value === page);
              return (
                <Badge key={page} variant="primary" size="sm">
                  {pageInfo?.label || page}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {employee.role === 'admin' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">
              Администратор имеет полный доступ ко всем разделам системы
            </p>
          </div>
        </div>
      )}
    </ExpandableCard>
  );
}

interface DetailItemProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 text-gray-400 dark:text-gray-500">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white break-all">{value}</p>
      </div>
    </div>
  );
}
