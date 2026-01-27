import { supabase } from '../lib/supabase';

export interface PurchasePlan {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  amount: number;
  delivery_method: string;
  notes: string;
  material_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchasePlanInput {
  name: string;
  quantity?: number;
  amount?: number;
  delivery_method?: string;
  notes?: string;
  material_id?: string | null;
}

export async function getPurchasePlans(userId: string) {
  const { data, error } = await supabase
    .from('purchase_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase plans:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getPurchasePlanById(planId: string) {
  const { data, error } = await supabase
    .from('purchase_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    console.error('Error fetching purchase plan:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createPurchasePlan(userId: string, planData: PurchasePlanInput) {
  const { data, error } = await supabase
    .from('purchase_plans')
    .insert({
      user_id: userId,
      ...planData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating purchase plan:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updatePurchasePlan(planId: string, planData: PurchasePlanInput) {
  const { data, error } = await supabase
    .from('purchase_plans')
    .update(planData)
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase plan:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deletePurchasePlan(planId: string) {
  const { error } = await supabase
    .from('purchase_plans')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error('Error deleting purchase plan:', error);
    return { error };
  }

  return { error: null };
}

export async function checkAndCreatePurchasesForLowStock(userId: string) {
  const { data: materials, error: materialsError } = await supabase
    .from('materials')
    .select('id, name, initial_volume, remaining_volume, purchase_price, unit_of_measurement')
    .eq('user_id', userId);

  if (materialsError || !materials) {
    console.error('Error fetching materials for low stock check:', materialsError);
    return { created: 0, error: materialsError };
  }

  const { data: existingPurchases } = await supabase
    .from('purchase_plans')
    .select('material_id')
    .eq('user_id', userId)
    .not('material_id', 'is', null);

  const existingMaterialIds = new Set(
    (existingPurchases || []).map((p) => p.material_id)
  );

  let createdCount = 0;

  for (const material of materials) {
    const remainingPercentage = (material.remaining_volume / material.initial_volume) * 100;

    if (remainingPercentage < 40 && remainingPercentage > 0) {
      if (existingMaterialIds.has(material.id)) {
        continue;
      }

      const quantityToBuy = material.initial_volume - material.remaining_volume;
      const pricePerUnit = material.purchase_price / material.initial_volume;
      const totalAmount = quantityToBuy * pricePerUnit;

      const { error: createError } = await createPurchasePlan(userId, {
        name: material.name,
        quantity: quantityToBuy,
        amount: totalAmount,
        delivery_method: '',
        notes: `Автоматически создано: остаток ${remainingPercentage.toFixed(1)}%`,
        material_id: material.id,
      });

      if (!createError) {
        createdCount++;
      }
    }
  }

  return { created: createdCount, error: null };
}
