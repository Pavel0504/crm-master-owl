import { Bolt Database } from '../lib/supabase';

export interface RecipeCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface RecipeCategoryInput {
  name: string;
  parent_id?: string | null;
}

export async function getRecipeCategories(userId: string) {
  const { data, error } = await Bolt Database
    .from('recipe_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipe categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createRecipeCategory(userId: string, categoryData: RecipeCategoryInput) {
  const { data, error } = await Bolt Database
    .from('recipe_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating recipe category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateRecipeCategory(categoryId: string, categoryData: RecipeCategoryInput) {
  const { data, error } = await Bolt Database
    .from('recipe_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating recipe category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteRecipeCategory(categoryId: string) {
  const { error } = await Bolt Database
    .from('recipe_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting recipe category:', error);
    return { error };
  }

  return { error: null };
}
