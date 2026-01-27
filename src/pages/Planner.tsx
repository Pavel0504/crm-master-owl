import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader, ConfirmDialog } from '../components/ui';
import WeekCalendar from '../components/planner/WeekCalendar';
import TasksListModal from '../components/planner/TasksListModal';
import CreateTaskModal from '../components/planner/CreateTaskModal';
import EditTaskModal from '../components/planner/EditTaskModal';
import TasksList from '../components/planner/TasksList';
import {
  getTasks,
  getTasksByDateRange,
  getTaskWithChecklist,
  createTask,
  updateTask,
  deleteTask,
  toggleChecklistItem,
  TaskInput,
  TaskWithChecklist,
} from '../services/taskService';

export default function Planner() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<TaskWithChecklist[]>([]);
  const [allTasks, setAllTasks] = useState<TaskWithChecklist[]>([]);
  const [tasksCountByDate, setTasksCountByDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isTasksListModalOpen, setIsTasksListModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithChecklist | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithChecklist | null>(null);

  useEffect(() => {
    if (user) {
      loadAllTasks();
    }
  }, [user]);

  const loadAllTasks = async () => {
    if (!user) return;

    setLoading(true);
    const { data: tasks } = await getTasks(user.id);

    if (tasks) {
      // Загружаем детали для каждой задачи
      const tasksWithDetails: TaskWithChecklist[] = [];
      for (const task of tasks) {
        const { data: taskWithChecklist } = await getTaskWithChecklist(task.id);
        if (taskWithChecklist) {
          tasksWithDetails.push(taskWithChecklist);
        }
      }
      setAllTasks(tasksWithDetails);

      // Подсчитываем количество задач по датам
      const counts: Record<string, number> = {};
      tasks.forEach((task) => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);

        const current = new Date(startDate);
        while (current <= endDate) {
          const dateKey = current.toISOString().split('T')[0];
          counts[dateKey] = (counts[dateKey] || 0) + 1;
          current.setDate(current.getDate() + 1);
        }
      });

      setTasksCountByDate(counts);
    }

    setLoading(false);
  };

  const handleDayClick = async (date: Date) => {
    if (!user) return;

    setSelectedDate(date);
    setLoading(true);
    setError(null);

    const dateStr = date.toISOString().split('T')[0];

    const { data: tasks, error: tasksError } = await getTasksByDateRange(
      user.id,
      dateStr,
      dateStr
    );

    if (tasksError) {
      setError('Не удалось загрузить задачи');
      setLoading(false);
      return;
    }

    const tasksWithDetails: TaskWithChecklist[] = [];

    if (tasks) {
      for (const task of tasks) {
        const { data: taskWithChecklist } = await getTaskWithChecklist(task.id);
        if (taskWithChecklist) {
          tasksWithDetails.push(taskWithChecklist);
        }
      }
    }

    setTasksForSelectedDate(tasksWithDetails);
    setIsTasksListModalOpen(true);
    setLoading(false);
  };

  const handleCreateTask = () => {
    setIsTasksListModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleSubmitCreateTask = async (data: TaskInput) => {
    if (!user) return;

    setLoading(true);
    const { error: createError } = await createTask(user.id, data);

    if (createError) {
      setError('Не удалось создать задачу');
    } else {
      await loadAllTasks();
      if (selectedDate) {
        await handleDayClick(selectedDate);
      }
    }

    setLoading(false);
  };

  const handleEditTask = (task: TaskWithChecklist) => {
    setSelectedTask(task);
    setIsTasksListModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSubmitEditTask = async (data: TaskInput) => {
    if (!selectedTask) return;

    setLoading(true);
    const { error: updateError } = await updateTask(selectedTask.id, data);

    if (updateError) {
      setError('Не удалось обновить задачу');
    } else {
      await loadAllTasks();
      if (selectedDate) {
        await handleDayClick(selectedDate);
      }
      setSelectedTask(null);
    }

    setLoading(false);
  };

  const handleDeleteTask = (task: TaskWithChecklist) => {
    setTaskToDelete(task);
    setIsTasksListModalOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setLoading(true);
    const { error: deleteError } = await deleteTask(taskToDelete.id);

    if (deleteError) {
      setError('Не удалось удалить задачу');
    } else {
      await loadAllTasks();
      if (selectedDate) {
        await handleDayClick(selectedDate);
      }
      setTaskToDelete(null);
    }

    setLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const handleToggleChecklistItem = async (
    taskId: string,
    itemId: string,
    completed: boolean
  ) => {
    setLoading(true);

    const { error: toggleError } = await toggleChecklistItem(itemId, completed);

    if (toggleError) {
      setError('Не удалось обновить пункт чек-листа');
      setLoading(false);
      return;
    }

    const { data: updatedTask } = await getTaskWithChecklist(taskId);

    if (updatedTask && updatedTask.checklist.length > 0) {
      const allCompleted = updatedTask.checklist.every((item) => item.completed);
      const taskShouldBeCompleted = allCompleted && !updatedTask.completed;
      const taskShouldBeActive = !allCompleted && updatedTask.completed;

      if (taskShouldBeCompleted || taskShouldBeActive) {
        await updateTask(taskId, {
          title: updatedTask.title,
          start_date: updatedTask.start_date,
          end_date: updatedTask.end_date,
          description: updatedTask.description,
          tag: updatedTask.tag,
          priority: updatedTask.priority,
          checklist: updatedTask.checklist.map((item) => ({ title: item.title })),
        });
      }
    }

    await loadAllTasks();
    if (selectedDate) {
      await handleDayClick(selectedDate);
    }

    setLoading(false);
  };

  const handleCloseTasksList = () => {
    setIsTasksListModalOpen(false);
    setSelectedDate(null);
    setTasksForSelectedDate([]);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    if (selectedDate) {
      setIsTasksListModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
    if (selectedDate) {
      setIsTasksListModalOpen(true);
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
    if (selectedDate) {
      setIsTasksListModalOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<Calendar className="h-6 w-6 text-white" />}
          title="Планировщик"
          subtitle="Управление задачами и планирование"
        />

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-6">
          <WeekCalendar onDayClick={handleDayClick} tasksCountByDate={tasksCountByDate} />
        </div>
      </div>

      <TasksList
        tasks={allTasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onToggleChecklistItem={handleToggleChecklistItem}
        loading={loading}
      />

      <TasksListModal
        isOpen={isTasksListModalOpen}
        onClose={handleCloseTasksList}
        date={selectedDate}
        tasks={tasksForSelectedDate}
        onCreateTask={handleCreateTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onToggleChecklistItem={handleToggleChecklistItem}
        loading={loading}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitCreateTask}
        initialDate={selectedDate || undefined}
        loading={loading}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleSubmitEditTask}
        task={selectedTask}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Удалить задачу?"
        message={
          <>
            Вы уверены что хотите удалить задачу{' '}
            <strong>{taskToDelete?.title}</strong>? Это действие нельзя отменить.
          </>
        }
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
