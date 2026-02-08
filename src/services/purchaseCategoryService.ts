import { supabase } from '../lib/supabase';

export interface PurchaseCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseCategoryInput {
  name: string;
  parent_id?: string | null;
}

export async function getPurchaseCategories(userId: string) {
  const { data, error } = await supabase
    .from('purchase_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createPurchaseCategory(userId: string, categoryData: PurchaseCategoryInput) {
  const { data, error } = await supabase
    .from('purchase_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updatePurchaseCategory(categoryId: string, categoryData: PurchaseCategoryInput) {
  const { data, error } = await supabase
    .from('purchase_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deletePurchaseCategory(categoryId: string) {
  const { error } = await supabase
    .from('purchase_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting purchase category:', error);
    return { error };
  }

  return { error: null };
}
