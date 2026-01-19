import { supabase } from '../lib/supabase';

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  category_id: string | null;
  delivery_method: string;
  delivery_price: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierInput {
  name: string;
  category_id?: string | null;
  delivery_method?: string;
  delivery_price?: number;
  notes?: string;
}

export async function getSuppliers(userId: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suppliers:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createSupplier(userId: string, supplierData: SupplierInput) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: userId,
      ...supplierData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateSupplier(supplierId: string, supplierData: SupplierInput) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplierData)
    .eq('id', supplierId)
    .select()
    .single();

  if (error) {
    console.error('Error updating supplier:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteSupplier(supplierId: string) {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', supplierId);

  if (error) {
    console.error('Error deleting supplier:', error);
    return { error };
  }

  return { error: null };
}
