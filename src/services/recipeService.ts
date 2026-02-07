import { supabase } from '../lib/supabase';

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category_id: string | null;
  tag_name: string;
  tag_color: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeStep {
  id: string;
  recipe_id: string;
  step_text: string;
  step_type: string | null;
  step_value: string | null;
  order_index: number;
  created_at: string;
}

export interface RecipeInput {
  name: string;
  description?: string;
  category_id?: string | null;
  tag_name?: string;
  tag_color?: string;
  steps: Array<{
    step_text: string;
    step_type: string | null;
    step_value: string | null;
  }>;
}

export interface RecipeWithSteps extends Recipe {
  steps: RecipeStep[];
}

export async function getRecipes(userId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getRecipeById(recipeId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  if (error) {
    console.error('Error fetching recipe:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getRecipeSteps(recipeId: string) {
  const { data, error } = await supabase
    .from('recipe_steps')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching recipe steps:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getRecipeWithSteps(recipeId: string) {
  const { data: recipe, error: recipeError } = await getRecipeById(recipeId);

  if (recipeError || !recipe) {
    return { data: null, error: recipeError };
  }

  const { data: steps, error: stepsError } = await getRecipeSteps(recipeId);

  if (stepsError) {
    return { data: null, error: stepsError };
  }

  return {
    data: {
      ...recipe,
      steps: steps || [],
    } as RecipeWithSteps,
    error: null,
  };
}

export async function createRecipe(userId: string, recipeData: RecipeInput) {
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
      name: recipeData.name,
      description: recipeData.description || '',
      category_id: recipeData.category_id,
      tag_name: recipeData.tag_name || '',
      tag_color: recipeData.tag_color || '#808080',
    })
    .select()
    .single();

  if (recipeError) {
    console.error('Error creating recipe:', recipeError);
    return { data: null, error: recipeError };
  }

  if (recipeData.steps && recipeData.steps.length > 0) {
    const steps = recipeData.steps
      .filter((step) => step.step_text.trim() !== '')
      .map((step, index) => ({
        recipe_id: recipe.id,
        step_text: step.step_text,
        step_type: step.step_type,
        step_value: step.step_value,
        order_index: index,
      }));

    if (steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(steps);

      if (stepsError) {
        console.error('Error creating recipe steps:', stepsError);
      }
    }
  }

  return { data: recipe, error: null };
}

export async function updateRecipe(recipeId: string, recipeData: Partial<RecipeInput>) {
  const updates: any = {};

  if (recipeData.name !== undefined) updates.name = recipeData.name;
  if (recipeData.description !== undefined) updates.description = recipeData.description;
  if (recipeData.category_id !== undefined) updates.category_id = recipeData.category_id;
  if (recipeData.tag_name !== undefined) updates.tag_name = recipeData.tag_name;
  if (recipeData.tag_color !== undefined) updates.tag_color = recipeData.tag_color;

  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', recipeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating recipe:', error);
    return { data: null, error };
  }

  if (recipeData.steps !== undefined) {
    const { error: deleteError } = await supabase
      .from('recipe_steps')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) {
      console.error('Error deleting old recipe steps:', deleteError);
      return { data: null, error: deleteError };
    }

    const steps = recipeData.steps
      .filter((step) => step.step_text.trim() !== '')
      .map((step, index) => ({
        recipe_id: recipeId,
        step_text: step.step_text,
        step_type: step.step_type,
        step_value: step.step_value,
        order_index: index,
      }));

    if (steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(steps);

      if (stepsError) {
        console.error('Error creating recipe steps:', stepsError);
        return { data: null, error: stepsError };
      }
    }
  }

  return { data, error: null };
}

export async function deleteRecipe(recipeId: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

  if (error) {
    console.error('Error deleting recipe:', error);
    return { error };
  }

  return { error: null };
}
