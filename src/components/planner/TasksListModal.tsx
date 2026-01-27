import { useState } from 'react';
import { Modal, Button, Badge } from '../ui';
import { Plus } from 'lucide-react';
import { TaskWithChecklist } from '../../services/taskService';
import TaskListItem from './TaskListItem';

interface TasksListModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  tasks: TaskWithChecklist[];
  onCreateTask: () => void;
  onEditTask: (task: TaskWithChecklist) => void;
  onDeleteTask: (task: TaskWithChecklist) => void;
  onToggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  loading?: boolean;
}

export default function TasksListModal({
  isOpen,
  onClose,
  date,
  tasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onToggleChecklistItem,
  loading = false,
}: TasksListModalProps) {
  if (!date) return null;

  const formattedDate = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Задачи на ${formattedDate}`}
      size="lg"
    >
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              На этот день нет задач
            </p>
            <Button
              variant="primary"
              onClick={onCreateTask}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Создать задачу
            </Button>
          </div>
        ) : (
          <>
            {activeTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  Активные задачи
                  <Badge variant="info" size="sm">
                    {activeTasks.length}
                  </Badge>
                </h3>
                <div className="space-y-2">
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
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  Завершенные задачи
                  <Badge variant="success" size="sm">
                    {completedTasks.length}
                  </Badge>
                </h3>
                <div className="space-y-2 opacity-75">
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

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="primary"
                onClick={onCreateTask}
                className="flex items-center gap-2 w-full"
              >
                <Plus className="h-5 w-5" />
                Создать новую задачу
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
