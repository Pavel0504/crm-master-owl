import { supabase } from '../lib/supabase';

export interface Employee {
  id: string;
  user_id: string | null;
  created_by_user_id: string;
  full_name: string;
  phone: string;
  email: string;
  role: 'admin' | 'user';
  position_name: string;
  position_color: string;
  allowed_pages: string[];
  invite_token: string;
  joined: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeInput {
  full_name: string;
  phone?: string;
  email: string;
  role: 'admin' | 'user';
  position_name?: string;
  position_color?: string;
  allowed_pages?: string[];
}

export const ALL_PAGES = [
  { value: '/dashboard', label: 'Дашборд' },
  { value: '/planner', label: 'Планировщик' },
  { value: '/purchases', label: 'Будущие покупки' },
  { value: '/shop', label: 'Магазин' },
  { value: '/categories', label: 'Категории' },
  { value: '/suppliers', label: 'Поставщики' },
  { value: '/materials', label: 'Материалы' },
  { value: '/inventory', label: 'Инвентарь' },
  { value: '/products', label: 'Изделия' },
  { value: '/clients', label: 'Клиенты' },
  { value: '/orders', label: 'Заказы' },
  { value: '/employees', label: 'Сотрудники' },
  { value: '/about', label: 'О программе' },
];

export async function getEmployees(createdByUserId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('created_by_user_id', createdByUserId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching employees:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getEmployeeById(employeeId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getEmployeeByUserId(userId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching employee by user_id:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getEmployeeByInviteToken(inviteToken: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('invite_token', inviteToken)
    .maybeSingle();

  if (error) {
    console.error('Error fetching employee by invite token:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createEmployee(createdByUserId: string, employeeData: EmployeeInput) {
  const { data: existingUser, error: checkError } = await supabase
    .from('employees')
    .select('id')
    .eq('email', employeeData.email)
    .maybeSingle();

  if (checkError) {
    return { data: null, error: checkError };
  }

  if (existingUser) {
    return {
      data: null,
      error: new Error('Сотрудник с таким email уже существует'),
    };
  }

  const { data, error } = await supabase
    .from('employees')
    .insert({
      created_by_user_id: createdByUserId,
      full_name: employeeData.full_name,
      phone: employeeData.phone || '',
      email: employeeData.email,
      role: employeeData.role,
      position_name: employeeData.position_name || '',
      position_color: employeeData.position_color || '#808080',
      allowed_pages: employeeData.allowed_pages || [],
      joined: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating employee:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateEmployee(employeeId: string, employeeData: Partial<EmployeeInput>) {
  const updates: any = {};

  if (employeeData.full_name !== undefined) updates.full_name = employeeData.full_name;
  if (employeeData.phone !== undefined) updates.phone = employeeData.phone;
  if (employeeData.email !== undefined) updates.email = employeeData.email;
  if (employeeData.role !== undefined) updates.role = employeeData.role;
  if (employeeData.position_name !== undefined) updates.position_name = employeeData.position_name;
  if (employeeData.position_color !== undefined) updates.position_color = employeeData.position_color;
  if (employeeData.allowed_pages !== undefined) updates.allowed_pages = employeeData.allowed_pages;

  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', employeeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating employee:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteEmployee(employeeId: string) {
  const { error } = await supabase.from('employees').delete().eq('id', employeeId);

  if (error) {
    console.error('Error deleting employee:', error);
    return { error };
  }

  return { error: null };
}

export async function joinEmployeeByToken(inviteToken: string, userId: string) {
  const { data, error } = await supabase
    .from('employees')
    .update({
      user_id: userId,
      joined: true,
    })
    .eq('invite_token', inviteToken)
    .eq('joined', false)
    .select()
    .single();

  if (error) {
    console.error('Error joining employee:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export function generateInviteLink(inviteToken: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/employee-register/${inviteToken}`;
}
