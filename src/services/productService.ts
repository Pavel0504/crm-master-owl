import { Bolt Database } from '../lib/supabase';
import { checkAndCreatePurchasesForLowStock } from './purchaseService';
import { roundToCents, multiplyCurrency, sumCurrency } from '../utils/currency';

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
  creation_date: string | null;
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
  creation_date?: string;
  materials: ProductMaterial[];
}

export interface ProductWithMaterials extends Product {
  materials: Array<{
    material_id: string;
    volume_per_item: number;
  }>;
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
    const { data: materialData, error } = await Bolt Database
      .from('materials')
      .select('purchase_price, initial_volume')
      .eq('id', material.material_id)
      .single();

    if (error || !materialData) {
      console.error('Error fetching material:', error);
      continue;
    }

    const pricePerUnit = roundToCents(materialData.purchase_price / materialData.initial_volume);
    const materialCost = multiplyCurrency(
      multiplyCurrency(pricePerUnit, material.volume_per_item),
      quantity
    );
    totalCost = sumCurrency(totalCost, materialCost);
  }

  if (categoryId) {
    const { data: category, error: catError } = await Bolt Database
      .from('product_categories')
      .select('energy_costs_electricity, energy_costs_water, labor_cost_per_hour')
      .eq('id', categoryId)
      .single();

    if (!catError && category) {
      const energyCosts = multiplyCurrency(
        sumCurrency(category.energy_costs_electricity, category.energy_costs_water),
        quantity
      );
      totalCost = sumCurrency(totalCost, energyCosts);

      if (category.labor_cost_per_hour > 0 && laborHours > 0) {
        const laborCost = multiplyCurrency(
          multiplyCurrency(category.labor_cost_per_hour, laborHours),
          quantity
        );
        totalCost = sumCurrency(totalCost, laborCost);
      }
    }

    const { data: inventoryLinks, error: linkError } = await Bolt Database
      .from('product_category_inventory')
      .select('inventory_id')
      .eq('category_id', categoryId);

    if (!linkError && inventoryLinks) {
      for (const link of inventoryLinks) {
        const { data: inventory, error: invError } = await Bolt Database
          .from('inventory')
          .select('purchase_price, wear_rate_per_item')
          .eq('id', link.inventory_id)
          .single();

        if (!invError && inventory) {
          const wearCost = multiplyCurrency(
            multiplyCurrency(
              roundToCents(inventory.purchase_price * inventory.wear_rate_per_item / 100),
              quantity
            ),
            1
          );
          totalCost = sumCurrency(totalCost, wearCost);
        }
      }
    }
  }

  return { cost: roundToCents(totalCost / quantity), error: null };
}

export async function getProducts(userId: string) {
  const { data, error } = await Bolt Database
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
  const { data, error } = await Bolt Database
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
  const { data: product, error: productError } = await Bolt Database
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

  if (productData.materials.length > 0) {
    for (const material of productData.materials) {
      const totalVolumeNeeded = material.volume_per_item * productData.quantity_created;

      const { data: materialData, error: materialError } = await Bolt Database
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
  }

  if (productData.category_id) {
    const { data: inventoryLinks, error: linkError } = await Bolt Database
      .from('product_category_inventory')
      .select('inventory_id')
      .eq('category_id', productData.category_id);

    if (!linkError && inventoryLinks) {
      for (const link of inventoryLinks) {
        const { data: inventory, error: invError } = await Bolt Database
          .from('inventory')
          .select('inventory_type, wear_percentage, wear_rate_per_item, remaining_quantity')
          .eq('id', link.inventory_id)
          .single();

        if (invError || !inventory) {
          return {
            data: null,
            error: new Error(`Не удалось найти инвентарь ${link.inventory_id}`),
          };
        }

        if (inventory.inventory_type === 'процент') {
          const totalWearNeeded = (inventory.wear_rate_per_item || 0) * productData.quantity_created;

          if ((inventory.wear_percentage || 0) < totalWearNeeded) {
            return {
              data: null,
              error: new Error(
                `Недостаточный ресурс инвентаря (доступно: ${inventory.wear_percentage}%, требуется: ${totalWearNeeded}%)`
              ),
            };
          }
        } else {
          if ((inventory.remaining_quantity || 0) < productData.quantity_created) {
            return {
              data: null,
              error: new Error(
                `Недостаточное количество инвентаря (доступно: ${inventory.remaining_quantity} шт, требуется: ${productData.quantity_created} шт)`
              ),
            };
          }
        }
      }
    }
  }

  const { data: product, error: productError } = await Bolt Database
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
      creation_date: productData.creation_date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (productError) {
    console.error('Error creating product:', productError);
    return { data: null, error: productError };
  }

  if (productData.materials.length > 0) {
    for (const material of productData.materials) {
      const { error: linkError } = await Bolt Database
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

      const { error: decreaseError } = await supabase.rpc('decrease_material_volume', {
        material_id: material.material_id,
        volume_to_decrease: totalVolumeNeeded,
      });

      if (decreaseError) {
        console.error('Error decreasing material volume:', decreaseError);
        return { data: null, error: new Error(`Не удалось вычесть материал: ${decreaseError.message}`) };
      }
    }
  }

  if (productData.category_id) {
    const { data: inventoryLinks } = await Bolt Database
      .from('product_category_inventory')
      .select('inventory_id')
      .eq('category_id', productData.category_id);

    if (inventoryLinks) {
      for (const link of inventoryLinks) {
        const { data: inventory } = await Bolt Database
          .from('inventory')
          .select('inventory_type, wear_rate_per_item, remaining_quantity')
          .eq('id', link.inventory_id)
          .single();

        if (inventory) {
          if (inventory.inventory_type === 'процент') {
            const totalWearNeeded = (inventory.wear_rate_per_item || 0) * productData.quantity_created;

            const { data: currentInventory } = await Bolt Database
              .from('inventory')
              .select('wear_percentage')
              .eq('id', link.inventory_id)
              .single();

            if (currentInventory) {
              const newWearPercentage = (currentInventory.wear_percentage || 0) - totalWearNeeded;

              await Bolt Database
                .from('inventory')
                .update({
                  wear_percentage: newWearPercentage,
                })
                .eq('id', link.inventory_id);
            }
          } else {
            const { data: currentInventory } = await Bolt Database
              .from('inventory')
              .select('remaining_quantity')
              .eq('id', link.inventory_id)
              .single();

            if (currentInventory) {
              const newQuantity = (currentInventory.remaining_quantity || 0) - productData.quantity_created;

              await Bolt Database
                .from('inventory')
                .update({
                  remaining_quantity: newQuantity,
                })
                .eq('id', link.inventory_id);
            }
          }
        }
      }
    }
  }

  if (productData.materials.length > 0) {
    await checkAndCreatePurchasesForLowStock(userId);
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
  if (productData.creation_date !== undefined) updates.creation_date = productData.creation_date;

  const { data, error } = await Bolt Database
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
  const { error } = await Bolt Database
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return { error };
  }

  return { error: null };
}
