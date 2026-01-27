import { useState, useMemo } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { TaskWithChecklist } from '../../services/taskService';
import { Select, Badge } from '../ui';
import TaskListItem from './TaskListItem';

interface TasksListProps {
  tasks: TaskWithChecklist[];
  onEditTask: (task: TaskWithChecklist) => void;
  onDeleteTask: (task: TaskWithChecklist) => void;
  onToggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  loading?: boolean;
}

const PRIORITY_ORDER: Record<string, number> = {
  'высокая': 3,
  'средняя': 2,
  'низкая': 1,
};

export default function TasksList({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleChecklistItem,
  loading = false,
}: TasksListProps) {
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  // Получаем уникальные теги
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach((task) => {
      if (task.tag && task.tag.trim() !== '') {
        tags.add(task.tag);
      }
    });
    return Array.from(tags).sort();
  }, [tasks]);

  // Фильтрация и сортировка задач
  const sortedAndFilteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Применяем фильтры
    if (filterTag) {
      filtered = filtered.filter((task) => task.tag === filterTag);
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter((task) => !task.completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter((task) => task.completed);
    }

    if (filterPriority) {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    // Сортировка: сначала по приоритету, затем по сроку
    filtered.sort((a, b) => {
      // Сначала по приоритету (высокая → средняя → низкая)
      const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Затем по дате окончания (ближайшие первыми)
      const dateA = new Date(a.end_date).getTime();
      const dateB = new Date(b.end_date).getTime();
      return dateA - dateB;
    });

    return filtered;
  }, [tasks, filterTag, filterStatus, filterPriority]);

  const activeTasks = sortedAndFilteredTasks.filter((task) => !task.completed);
  const completedTasks = sortedAndFilteredTasks.filter((task) => task.completed);

  const hasActiveFilters = filterTag || filterStatus || filterPriority;

  const resetFilters = () => {
    setFilterTag('');
    setFilterStatus('');
    setFilterPriority('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Все задачи</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tasks.length} {tasks.length === 1 ? 'задача' : tasks.length < 5 ? 'задачи' : 'задач'}
            </p>
          </div>
        </div>

        {tasks.length > 0 && (
          <Badge variant="primary" size="lg">
            {activeTasks.length} активных / {completedTasks.length} завершенных
          </Badge>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-orange-500 dark:text-burgundy-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Фильтры</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Статус"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: '', label: 'Все задачи' },
                { value: 'active', label: 'Активные' },
                { value: 'completed', label: 'Завершенные' },
              ]}
            />

            <Select
              label="Приоритет"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={[
                { value: '', label: 'Все приоритеты' },
                { value: 'высокая', label: 'Высокая' },
                { value: 'средняя', label: 'Средняя' },
                { value: 'низкая', label: 'Низкая' },
              ]}
            />

            {uniqueTags.length > 0 && (
              <Select
                label="Тег"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                options={[
                  { value: '', label: 'Все теги' },
                  ...uniqueTags.map((tag) => ({
                    value: tag,
                    label: tag,
                  })),
                ]}
              />
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 text-sm text-orange-600 dark:text-burgundy-400 hover:underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет задач
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Создайте задачу, нажав на день в календаре
          </p>
        </div>
      ) : sortedAndFilteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет задач с такими фильтрами
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Попробуйте изменить параметры фильтрации
          </p>
          <button
            onClick={resetFilters}
            className="text-orange-600 dark:text-burgundy-400 hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Активные задачи
                </h3>
                <Badge variant="info" size="sm">
                  {activeTasks.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onToggleChecklistItem={onToggleChecklistItem}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Завершенные задачи
                </h3>
                <Badge variant="success" size="sm">
                  {completedTasks.length}
                </Badge>
              </div>
              <div className="space-y-3 opacity-75">
                {completedTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onToggleChecklistItem={onToggleChecklistItem}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
