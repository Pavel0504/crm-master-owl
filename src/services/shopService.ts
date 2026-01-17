import { supabase } from '../lib/supabase';

export interface Shop {
  id: string;
  user_id: string;
  name: string;
  category: string;
  social_networks: Record<string, string>;
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface ShopInput {
  name?: string;
  category?: string;
  social_networks?: Record<string, string>;
  owner?: string;
}

export async function getShopByUserId(userId: string) {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching shop:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createShop(userId: string, shopData: ShopInput) {
  const { data, error } = await supabase
    .from('shops')
    .insert({
      user_id: userId,
      ...shopData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating shop:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateShop(shopId: string, shopData: ShopInput) {
  const { data, error } = await supabase
    .from('shops')
    .update(shopData)
    .eq('id', shopId)
    .select()
    .single();

  if (error) {
    console.error('Error updating shop:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getOrCreateShop(userId: string) {
  const { data: existingShop, error: fetchError } = await getShopByUserId(userId);

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (existingShop) {
    return { data: existingShop, error: null };
  }

  return await createShop(userId, {
    name: '',
    category: '',
    social_networks: {},
    owner: '',
  });
}
