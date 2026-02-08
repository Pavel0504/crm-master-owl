import { supabase } from '../lib/supabase';

export interface ClientCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientCategoryInput {
  name: string;
  parent_id?: string | null;
}

export async function getClientCategories(userId: string) {
  const { data, error } = await supabase
    .from('client_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createClientCategory(userId: string, categoryData: ClientCategoryInput) {
  const { data, error } = await supabase
    .from('client_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateClientCategory(categoryId: string, categoryData: ClientCategoryInput) {
  const { data, error } = await supabase
    .from('client_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating client category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteClientCategory(categoryId: string) {
  const { error } = await supabase
    .from('client_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting client category:', error);
    return { error };
  }

  return { error: null };
}
