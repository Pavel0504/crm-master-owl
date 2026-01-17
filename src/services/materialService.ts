import { supabase } from '../lib/supabase';

export interface Material {
  id: string;
  user_id: string;
  name: string;
  category_id: string | null;
  supplier: string;
  delivery_method: string;
  purchase_price: number;
  initial_volume: number;
  remaining_volume: number;
  purchase_date: string;
  unit_of_measurement: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialInput {
  name: string;
  category_id?: string | null;
  supplier?: string;
  delivery_method?: string;
  purchase_price?: number;
  initial_volume?: number;
  remaining_volume?: number;
  purchase_date?: string;
  unit_of_measurement?: string;
}

export async function getMaterials(userId: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching materials:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createMaterial(userId: string, materialData: MaterialInput) {
  const { data, error } = await supabase
    .from('materials')
    .insert({
      user_id: userId,
      ...materialData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating material:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateMaterial(materialId: string, materialData: MaterialInput) {
  const { data, error } = await supabase
    .from('materials')
    .update(materialData)
    .eq('id', materialId)
    .select()
    .single();

  if (error) {
    console.error('Error updating material:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteMaterial(materialId: string) {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', materialId);

  if (error) {
    console.error('Error deleting material:', error);
    return { error };
  }

  return { error: null };
}
