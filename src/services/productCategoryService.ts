import { supabase } from '../lib/supabase';

export interface ProductCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  energy_costs_electricity: number;
  energy_costs_water: number;
  created_at: string;
}

export interface ProductCategoryInput {
  name: string;
  parent_id?: string | null;
  energy_costs_electricity?: number;
  energy_costs_water?: number;
}

export interface ProductCategoryInventoryLink {
  category_id: string;
  inventory_id: string;
}

export async function getProductCategories(userId: string) {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getProductCategoryInventory(categoryId: string) {
  const { data, error } = await supabase
    .from('product_category_inventory')
    .select('inventory_id')
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error fetching product category inventory:', error);
    return { data: null, error };
  }

  return { data: data.map(item => item.inventory_id), error: null };
}

export async function createProductCategory(
  userId: string,
  categoryData: ProductCategoryInput,
  inventoryIds: string[]
) {
  const { data: category, error: categoryError } = await supabase
    .from('product_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select()
    .single();

  if (categoryError) {
    console.error('Error creating product category:', categoryError);
    return { data: null, error: categoryError };
  }

  if (inventoryIds.length > 0) {
    const inventoryLinks = inventoryIds.map(inventoryId => ({
      category_id: category.id,
      inventory_id: inventoryId,
    }));

    const { error: linkError } = await supabase
      .from('product_category_inventory')
      .insert(inventoryLinks);

    if (linkError) {
      console.error('Error linking inventory to category:', linkError);
      return { data: null, error: linkError };
    }
  }

  return { data: category, error: null };
}

export async function updateProductCategory(
  categoryId: string,
  categoryData: ProductCategoryInput,
  inventoryIds: string[]
) {
  const { data: category, error: categoryError } = await supabase
    .from('product_categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (categoryError) {
    console.error('Error updating product category:', categoryError);
    return { data: null, error: categoryError };
  }

  const { error: deleteError } = await supabase
    .from('product_category_inventory')
    .delete()
    .eq('category_id', categoryId);

  if (deleteError) {
    console.error('Error deleting old inventory links:', deleteError);
    return { data: null, error: deleteError };
  }

  if (inventoryIds.length > 0) {
    const inventoryLinks = inventoryIds.map(inventoryId => ({
      category_id: categoryId,
      inventory_id: inventoryId,
    }));

    const { error: linkError } = await supabase
      .from('product_category_inventory')
      .insert(inventoryLinks);

    if (linkError) {
      console.error('Error linking inventory to category:', linkError);
      return { data: null, error: linkError };
    }
  }

  return { data: category, error: null };
}

export async function deleteProductCategory(categoryId: string) {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting product category:', error);
    return { error };
  }

  return { error: null };
}
