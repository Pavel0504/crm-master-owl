import { supabase } from '../lib/supabase';

export interface SupplierCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface SupplierCategoryInput {
  name: string;
  parent_id?: string | null;
}

export async function getSupplierCategories(userId: string) {
  const { data, error } = await supabase
    .from('supplier_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching supplier categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createSupplierCategory(userId: string, categoryData: SupplierCategoryInput) {
  const { data, error } = await supabase
    .from('supplier_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateSupplierCategory(categoryId: string, categoryData: SupplierCategoryInput) {
  const { data, error } = await supabase
    .from('supplier_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating supplier category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteSupplierCategory(categoryId: string) {
  const { error } = await supabase
    .from('supplier_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting supplier category:', error);
    return { error };
  }

  return { error: null };
}
