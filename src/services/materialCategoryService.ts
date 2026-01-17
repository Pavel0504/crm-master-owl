import { supabase } from '../lib/supabase';

export interface MaterialCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface MaterialCategoryInput {
  name: string;
  parent_id?: string | null;
}

export async function getMaterialCategories(userId: string) {
  const { data, error } = await supabase
    .from('material_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching material categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createMaterialCategory(userId: string, categoryData: MaterialCategoryInput) {
  const { data, error } = await supabase
    .from('material_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating material category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateMaterialCategory(categoryId: string, categoryData: MaterialCategoryInput) {
  const { data, error } = await supabase
    .from('material_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating material category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteMaterialCategory(categoryId: string) {
  const { error } = await supabase
    .from('material_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting material category:', error);
    return { error };
  }

  return { error: null };
}
