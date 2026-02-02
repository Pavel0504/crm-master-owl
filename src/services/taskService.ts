import { supabase } from '../lib/supabase';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string;
  tag: string;
  priority: 'низкая' | 'средняя' | 'высокая';
  status: 'активная' | 'завершена';
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskChecklistItem {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string;
}

export interface TaskInput {
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  tag?: string;
  priority: 'низкая' | 'средняя' | 'высокая';
  checklist?: Array<{ title: string }>;
}

export interface TaskWithChecklist extends Task {
  checklist: TaskChecklistItem[];
}

export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getTaskById(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getTaskWithChecklist(taskId: string) {
  const { data: task, error: taskError } = await getTaskById(taskId);

  if (taskError || !task) {
    return { data: null, error: taskError };
  }

  const { data: checklist, error: checklistError } = await supabase
    .from('task_checklist_items')
    .select('*')
    .eq('task_id', taskId)
    .order('order_index', { ascending: true });

  if (checklistError) {
    console.error('Error fetching checklist:', checklistError);
    return { data: null, error: checklistError };
  }

  return {
    data: {
      ...task,
      checklist: checklist || [],
    } as TaskWithChecklist,
    error: null,
  };
}

export async function getTasksByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching tasks by date range:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createTask(userId: string, taskData: TaskInput) {
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: taskData.title,
      start_date: taskData.start_date,
      end_date: taskData.end_date,
      description: taskData.description || '',
      tag: taskData.tag || '',
      priority: taskData.priority,
      status: 'активная',
      completed: false,
    })
    .select()
    .single();

  if (taskError) {
    console.error('Error creating task:', taskError);
    return { data: null, error: taskError };
  }

  if (taskData.checklist && taskData.checklist.length > 0) {
    const checklistItems = taskData.checklist
      .filter((item) => item.title.trim() !== '')
      .map((item, index) => ({
        task_id: task.id,
        title: item.title,
        completed: false,
        order_index: index,
      }));

    if (checklistItems.length > 0) {
      const { error: checklistError } = await supabase
        .from('task_checklist_items')
        .insert(checklistItems);

      if (checklistError) {
        console.error('Error creating checklist items:', checklistError);
      }
    }
  }

  return { data: task, error: null };
}

export async function updateTask(taskId: string, taskData: Partial<TaskInput>) {
  const updates: any = {};

  if (taskData.title !== undefined) updates.title = taskData.title;
  if (taskData.start_date !== undefined) updates.start_date = taskData.start_date;
  if (taskData.end_date !== undefined) updates.end_date = taskData.end_date;
  if (taskData.description !== undefined) updates.description = taskData.description;
  if (taskData.tag !== undefined) updates.tag = taskData.tag;
  if (taskData.priority !== undefined) updates.priority = taskData.priority;

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return { data: null, error };
  }

  if (taskData.checklist !== undefined) {
    const { error: deleteError } = await supabase
      .from('task_checklist_items')
      .delete()
      .eq('task_id', taskId);

    if (deleteError) {
      console.error('Error deleting old checklist items:', deleteError);
      return { data: null, error: deleteError };
    }

    const checklistItems = taskData.checklist
      .filter((item) => item.title.trim() !== '')
      .map((item, index) => ({
        task_id: taskId,
        title: item.title,
        completed: false,
        order_index: index,
      }));

    if (checklistItems.length > 0) {
      const { error: checklistError } = await supabase
        .from('task_checklist_items')
        .insert(checklistItems);

      if (checklistError) {
        console.error('Error creating checklist items:', checklistError);
        return { data: null, error: checklistError };
      }
    }
  }

  return { data, error: null };
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return { error };
  }

  return { error: null };
}

export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      completed,
      status: completed ? 'завершена' : 'активная'
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling task completion:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function toggleChecklistItem(itemId: string, completed: boolean) {
  const { data, error } = await supabase
    .from('task_checklist_items')
    .update({ completed })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling checklist item:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateChecklistItemsOrder(
  items: Array<{ id: string; order_index: number }>
) {
  for (const item of items) {
    await supabase
      .from('task_checklist_items')
      .update({ order_index: item.order_index })
      .eq('id', item.id);
  }
}
