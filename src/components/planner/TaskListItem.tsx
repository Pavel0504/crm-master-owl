import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';
import { TaskWithChecklist } from '../../services/taskService';
import { IconButton, Badge } from '../ui';

interface TaskListItemProps {
  task: TaskWithChecklist;
  onEdit: (task: TaskWithChecklist) => void;
  onDelete: (task: TaskWithChecklist) => void;
  onToggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
}

const TAG_COLORS: Record<string, string> = {
  'Работа': '#3b82f6',
  'Личное': '#10b981',
  'Семья': '#ec4899',
  'Здоровье': '#ef4444',
  'Учеба': '#8b5cf6',
  'Покупки': '#f59e0b',
  'Финансы': '#14b8a6',
  'Творчество': '#f97316',
};

const PRIORITY_LABELS: Record<string, string> = {
  'низкая': 'Низкая',
  'средняя': 'Средняя',
  'высокая': 'Высокая',
};

const PRIORITY_COLORS: Record<string, string> = {
  'низкая': 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  'средняя': 'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  'высокая': 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300',
};

export default function TaskListItem({
  task,
  onEdit,
  onDelete,
  onToggleChecklistItem,
}: TaskListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedStartDate = new Date(task.start_date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
  const formattedEndDate = new Date(task.end_date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  const handleChecklistToggle = async (itemId: string, currentCompleted: boolean) => {
    await onToggleChecklistItem(task.id, itemId, !currentCompleted);
  };

  const tagColor = task.tag && TAG_COLORS[task.tag] ? TAG_COLORS[task.tag] : '#808080';

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 border-2 rounded-xl transition-all
        ${task.completed ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'}
        ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}
      `}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all rounded-t-xl"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <h4
              className={`font-semibold text-gray-900 dark:text-white truncate ${
                task.completed ? 'line-through opacity-60' : ''
              }`}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>
                  {formattedStartDate} - {formattedEndDate}
                </span>
              </div>
              {task.tag && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: tagColor }}
                >
                  {task.tag}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <IconButton
              icon={<Edit2 />}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            />
            <IconButton
              icon={<Trash2 />}
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Важность</p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-lg font-medium ${
                    PRIORITY_COLORS[task.priority]
                  }`}
                >
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Статус</p>
                <Badge variant={task.completed ? 'success' : 'info'} size="sm">
                  {task.completed ? 'Завершена' : 'Активна'}
                </Badge>
              </div>
            </div>

            {task.description && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Описание</p>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {task.checklist && task.checklist.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Чек-лист ({task.checklist.filter((item) => item.completed).length}/
                  {task.checklist.length})
                </p>
                <div className="space-y-2">
                  {task.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleChecklistToggle(item.id, item.completed)}
                        className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-orange-600 dark:text-burgundy-600 focus:ring-orange-500 dark:focus:ring-burgundy-500 cursor-pointer"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
