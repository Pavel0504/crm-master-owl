import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category_id: string | null;
  description: string;
  composition: string;
  quantity_created: number;
  remaining_quantity: number;
  labor_hours_per_item: number;
  cost_price_per_item: number;
  selling_price: number;
  created_at: string;
  updated_at: string;
}

export interface ProductMaterial {
  material_id: string;
  volume_per_item: number;
}

export interface ProductInput {
  name: string;
  category_id?: string | null;
  description?: string;
  composition?: string;
  quantity_created: number;
  labor_hours_per_item?: number;
  selling_price?: number;
  materials: ProductMaterial[];
}

export interface ProductWithMaterials extends Product {
  materials: Array<{
    material_id: string;
    volume_per_item: number;
  }>;
}

export async function getProducts(userId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getProductMaterials(productId: string) {
  const { data, error } = await supabase
    .from('product_materials')
    .select('material_id, volume_per_item')
    .eq('product_id', productId);

  if (error) {
    console.error('Error fetching product materials:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getProductWithMaterials(productId: string) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    console.error('Error fetching product:', productError);
    return { data: null, error: productError };
  }

  const { data: materials, error: materialsError } = await getProductMaterials(productId);

  if (materialsError) {
    return { data: null, error: materialsError };
  }

  return {
    data: {
      ...product,
      materials: materials || [],
    } as ProductWithMaterials,
    error: null,
  };
}

export async function calculateProductCost(
  categoryId: string | null,
  materials: ProductMaterial[],
  laborHours: number,
  quantity: number,
  userId: string
): Promise<{ cost: number; error: Error | null }> {
  let totalCost = 0;

  for (const material of materials) {
    const { data: materialData, error } = await supabase
      .from('materials')
      .select('purchase_price, initial_volume')
      .eq('id', material.material_id)
      .single();

    if (error || !materialData) {
      console.error('Error fetching material:', error);
      continue;
    }

    const pricePerUnit = materialData.purchase_price / materialData.initial_volume;
    const materialCost = pricePerUnit * material.volume_per_item * quantity;
    totalCost += materialCost;
  }

  if (categoryId) {
    const { data: category, error: catError } = await supabase
      .from('product_categories')
      .select('energy_costs_electricity, energy_costs_water')
      .eq('id', categoryId)
      .single();

    if (!catError && category) {
      const energyCosts = (category.energy_costs_electricity + category.energy_costs_water) * quantity;
      totalCost += energyCosts;
    }

    const { data: inventoryLinks, error: linkError } = await supabase
      .from('product_category_inventory')
      .select('inventory_id')
      .eq('category_id', categoryId);

    if (!linkError && inventoryLinks) {
      for (const link of inventoryLinks) {
        const { data: inventory, error: invError } = await supabase
          .from('inventory')
          .select('purchase_price, wear_rate_per_item')
          .eq('id', link.inventory_id)
          .single();

        if (!invError && inventory) {
          const wearCost = (inventory.purchase_price * inventory.wear_rate_per_item / 100) * quantity;
          totalCost += wearCost;
        }
      }
    }
  }

  const laborCost = laborHours * quantity * 0;

  totalCost += laborCost;

  return { cost: totalCost / quantity, error: null };
}

export async function createProduct(userId: string, productData: ProductInput) {
  const costResult = await calculateProductCost(
    productData.category_id || null,
    productData.materials,
    productData.labor_hours_per_item || 0,
    productData.quantity_created,
    userId
  );

  if (costResult.error) {
    return { data: null, error: costResult.error };
  }

  for (const material of productData.materials) {
    const totalVolumeNeeded = material.volume_per_item * productData.quantity_created;

    const { data: materialData, error: materialError } = await supabase
      .from('materials')
      .select('remaining_volume')
      .eq('id', material.material_id)
      .single();

    if (materialError || !materialData) {
      return {
        data: null,
        error: new Error(`Не удалось найти материал ${material.material_id}`),
      };
    }

    if (materialData.remaining_volume < totalVolumeNeeded) {
      return {
        data: null,
        error: new Error(`Недостаточно материала (доступно: ${materialData.remaining_volume}, требуется: ${totalVolumeNeeded})`),
      };
    }
  }

  if (productData.category_id) {
    const { data: inventoryLinks, error: linkError } = await supabase
      .from('product_category_inventory')
      .select('inventory_id')
      .eq('category_id', productData.category_id);

    if (!linkError && inventoryLinks) {
      for (const link of inventoryLinks) {
        const { data: inventory, error: invError } = await supabase
          .from('inventory')
          .select('wear_percentage, wear_rate_per_item')
          .eq('id', link.inventory_id)
          .single();

        if (invError || !inventory) {
          return {
            data: null,
            error: new Error(`Не удалось найти инвентарь ${link.inventory_id}`),
          };
        }

        const totalWearNeeded = inventory.wear_rate_per_item * productData.quantity_created;

        if (inventory.wear_percentage < totalWearNeeded) {
          return {
            data: null,
            error: new Error(`Недостаточный ресурс инвентаря (доступно: ${inventory.wear_percentage}%, требуется: ${totalWearNeeded}%)`),
          };
        }
      }
    }
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: productData.name,
      category_id: productData.category_id,
      description: productData.description || '',
      composition: productData.composition || '',
      quantity_created: productData.quantity_created,
      remaining_quantity: productData.quantity_created,
      labor_hours_per_item: productData.labor_hours_per_item || 0,
      cost_price_per_item: costResult.cost,
      selling_price: productData.selling_price || 0,
    })
    .select()
    .single();

  if (productError) {
    console.error('Error creating product:', productError);
    return { data: null, error: productError };
  }

  for (const material of productData.materials) {
    const { error: linkError } = await supabase
      .from('product_materials')
      .insert({
        product_id: product.id,
        material_id: material.material_id,
        volume_per_item: material.volume_per_item,
      });

    if (linkError) {
      console.error('Error linking material to product:', linkError);
      return { data: null, error: linkError };
    }

    const totalVolumeNeeded = material.volume_per_item * productData.quantity_created;

    const { error: updateError } = await supabase.rpc('decrease_material_volume', {
      material_id: material.material_id,
      volume_to_decrease: totalVolumeNeeded,
    });

    if (updateError) {
      const { error: manualUpdateError } = await supabase
        .from('materials')
        .update({
          remaining_volume: supabase.raw(`remaining_volume - ${totalVolumeNeeded}`),
        })
        .eq('id', material.material_id);

      if (manualUpdateError) {
        console.error('Error updating material volume:', manualUpdateError);
      }
    }
  }

  if (productData.category_id) {
    const { data: inventoryLinks } = await supabase
      .from('product_category_inventory')
      .select('inventory_id')
      .eq('category_id', productData.category_id);

    if (inventoryLinks) {
      for (const link of inventoryLinks) {
        const { data: inventory } = await supabase
          .from('inventory')
          .select('wear_rate_per_item')
          .eq('id', link.inventory_id)
          .single();

        if (inventory) {
          const totalWearNeeded = inventory.wear_rate_per_item * productData.quantity_created;

          await supabase
            .from('inventory')
            .update({
              wear_percentage: supabase.raw(`wear_percentage - ${totalWearNeeded}`),
            })
            .eq('id', link.inventory_id);
        }
      }
    }
  }

  return { data: product, error: null };
}

export async function updateProduct(productId: string, productData: Partial<ProductInput>) {
  const updates: any = {};

  if (productData.name !== undefined) updates.name = productData.name;
  if (productData.category_id !== undefined) updates.category_id = productData.category_id;
  if (productData.description !== undefined) updates.description = productData.description;
  if (productData.composition !== undefined) updates.composition = productData.composition;
  if (productData.labor_hours_per_item !== undefined) updates.labor_hours_per_item = productData.labor_hours_per_item;
  if (productData.selling_price !== undefined) updates.selling_price = productData.selling_price;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return { error };
  }

  return { error: null };
}
