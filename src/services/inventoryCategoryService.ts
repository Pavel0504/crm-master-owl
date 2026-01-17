import { supabase } from '../lib/supabase';

export interface InventoryCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface InventoryCategoryInput {
  name: string;
  parent_id?: string | null;
}

export async function getInventoryCategories(userId: string) {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createInventoryCategory(userId: string, categoryData: InventoryCategoryInput) {
  const { data, error } = await supabase
    .from('inventory_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating inventory category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateInventoryCategory(categoryId: string, categoryData: InventoryCategoryInput) {
  const { data, error } = await supabase
    .from('inventory_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating inventory category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteInventoryCategory(categoryId: string) {
  const { error } = await supabase
    .from('inventory_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting inventory category:', error);
    return { error };
  }

  return { error: null };
}
