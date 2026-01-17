import { supabase } from '../lib/supabase';

export interface Inventory {
  id: string;
  user_id: string;
  name: string;
  category_id: string | null;
  purchase_price: number;
  wear_percentage: number;
  wear_rate_per_item: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryInput {
  name: string;
  category_id?: string | null;
  purchase_price?: number;
  wear_percentage?: number;
  wear_rate_per_item?: number;
  purchase_date?: string;
}

export async function getInventory(userId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createInventory(userId: string, inventoryData: InventoryInput) {
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      user_id: userId,
      ...inventoryData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating inventory:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateInventory(inventoryId: string, inventoryData: InventoryInput) {
  const { data, error } = await supabase
    .from('inventory')
    .update(inventoryData)
    .eq('id', inventoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating inventory:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteInventory(inventoryId: string) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', inventoryId);

  if (error) {
    console.error('Error deleting inventory:', error);
    return { error };
  }

  return { error: null };
}
