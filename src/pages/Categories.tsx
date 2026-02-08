import { useState, useEffect } from 'react';
import { FolderTree, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui';
import CategoryTab from '../components/categories/CategoryTab';
import ProductCategoryTab from '../components/categories/ProductCategoryTab';
import {
  getMaterialCategories,
  MaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory,
} from '../services/materialCategoryService';
import {
  getInventoryCategories,
  InventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} from '../services/inventoryCategoryService';
import {
  getProductCategories,
  ProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getProductCategoryInventory,
} from '../services/productCategoryService';
import {
  getSupplierCategories,
  SupplierCategory,
  updateSupplierCategory,
  deleteSupplierCategory,
} from '../services/supplierCategoryService';
import {
  getRecipeCategories,
  RecipeCategory,
  updateRecipeCategory,
  deleteRecipeCategory,
} from '../services/recipeCategoryService';
import {
  getInventory,
  Inventory,
} from '../services/inventoryService';
import {
  getPurchaseCategories,
  PurchaseCategory,
  updatePurchaseCategory,
  deletePurchaseCategory,
} from '../services/purchaseCategoryService';
import {
  getClientCategories,
  ClientCategory,
  updateClientCategory,
  deleteClientCategory,
} from '../services/clientCategoryService';


type TabType = 'materials' | 'inventory' | 'products' | 'suppliers' | 'recipes' | 'purchases' | 'clients';

export default function Categories() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [supplierCategories, setSupplierCategories] = useState<SupplierCategory[]>([]);
  const [recipeCategories, setRecipeCategories] = useState<RecipeCategory[]>([]);
  const [purchaseCategories, setPurchaseCategories] = useState<PurchaseCategory[]>([]);
  const [clientCategories, setClientCategories] = useState<ClientCategory[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);


  useEffect(() => {
    loadAllCategories();
  }, [user]);

  const loadAllCategories = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [materialsResult, inventoryResult, productsResult, suppliersResult, recipesResult, purchasesResult, clientsResult, inventoryDataResult] = await Promise.all([
      getMaterialCategories(user.id),
      getInventoryCategories(user.id),
      getProductCategories(user.id),
      getSupplierCategories(user.id),
      getRecipeCategories(user.id),
      getPurchaseCategories(user.id),
      getClientCategories(user.id),
      getInventory(user.id),
    ]);


    if (materialsResult.error || inventoryResult.error || productsResult.error || suppliersResult.error || inventoryDataResult.error) {
      setError('Не удалось загрузить категории');
    } else {
      setMaterialCategories(materialsResult.data || []);
      setInventoryCategories(inventoryResult.data || []);
      setProductCategories(productsResult.data || []);
      setSupplierCategories(suppliersResult.data || []);
      setRecipeCategories(recipesResult.data || []);
      setPurchaseCategories(purchasesResult.data || []);
      setClientCategories(clientsResult.data || []);
      setInventory(inventoryDataResult.data || []);
    }

    setLoading(false);
  };

  const handleUpdateMaterialCategory = async (id: string, data: { name: string; parent_id: string | null }) => {
    const { error } = await updateMaterialCategory(id, data);
    if (error) {
      setError('Не удалось обновить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

  const handleDeleteMaterialCategory = async (id: string) => {
    const { error } = await deleteMaterialCategory(id);
    if (error) {
      setError('Не удалось удалить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

  const handleUpdateInventoryCategory = async (id: string, data: { name: string; parent_id: string | null }) => {
    const { error } = await updateInventoryCategory(id, data);
    if (error) {
      setError('Не удалось обновить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

  const handleDeleteInventoryCategory = async (id: string) => {
    const { error } = await deleteInventoryCategory(id);
    if (error) {
      setError('Не удалось удалить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

  const handleUpdateProductCategory = async (
    id: string,
    data: {
      name: string;
      parent_id: string | null;
      energy_costs_electricity: number;
      energy_costs_water: number;
      labor_cost_per_hour: number;
    },
    inventoryIds: string[]
  ) => {
    const { error } = await updateProductCategory(id, data, inventoryIds);
    if (error) {
      setError('Не удалось обновить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

  const handleLoadProductCategoryInventory = async (categoryId: string): Promise<string[]> => {
    const { data, error } = await getProductCategoryInventory(categoryId);
    if (error || !data) {
      return [];
    }
    return data;
  };

  const handleDeleteProductCategory = async (id: string) => {
    const { error } = await deleteProductCategory(id);
    if (error) {
      setError('Не удалось удалить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

  const handleUpdateSupplierCategory = async (id: string, data: { name: string; parent_id: string | null }) => {
    const { error } = await updateSupplierCategory(id, data);
    if (error) {
      setError('Не удалось обновить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

  const handleDeleteSupplierCategory = async (id: string) => {
    const { error } = await deleteSupplierCategory(id);
    if (error) {
      setError('Не удалось удалить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
  };

const handleUpdateRecipeCategory = async (id: string, data: { name: string; parent_id: string | null }) => {
  const { error } = await updateRecipeCategory(id, data);
  if (error) {
    setError('Не удалось обновить категорию');
    return false;
  }
  await loadAllCategories();
  return true;
};

const handleDeleteRecipeCategory = async (id: string) => {
  const { error } = await deleteRecipeCategory(id);
  if (error) {
    setError('Не удалось удалить категорию');
    return false;
  }
  await loadAllCategories();
  return true;
};

const handleUpdatePurchaseCategory = async (id: string, data: { name: string; parent_id: string | null }) => {
  const { error } = await updatePurchaseCategory(id, data);
  if (error) {
    setError('Не удалось обновить категорию');
    return false;
  }
  await loadAllCategories();
  return true;
};

const handleDeletePurchaseCategory = async (id: string) => {
  const { error } = await deletePurchaseCategory(id);
  if (error) {
    setError('Не удалось удалить категорию');
    return false;
  }
  await loadAllCategories();
  return true;
};

const handleUpdateClientCategory = async (id: string, data: { name: string; parent_id: string | null }) => {
  const { error } = await updateClientCategory(id, data);
  if (error) {
    setError('Не удалось обновить категорию');
    return false;
  }
  await loadAllCategories();
  return true;
};

const handleDeleteClientCategory = async (id: string) => {
  const { error } = await deleteClientCategory(id);
  if (error) {
    setError('Не удалось удалить категорию');
    return false;
  }
  await loadAllCategories();
  return true;
};


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<FolderTree className="h-6 w-6 text-white" />}
          title="Категории"
          subtitle="Управление всеми категориями"
        />

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            <button
              onClick={() => setActiveTab('materials')}
              className={`
                px-4 py-2 font-medium rounded-t-lg transition-all whitespace-nowrap
                ${
                  activeTab === 'materials'
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              Материалы
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`
                px-4 py-2 font-medium rounded-t-lg transition-all whitespace-nowrap
                ${
                  activeTab === 'inventory'
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              Инвентарь
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`
                px-4 py-2 font-medium rounded-t-lg transition-all whitespace-nowrap
                ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              Изделия
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`
                px-4 py-2 font-medium rounded-t-lg transition-all whitespace-nowrap
                ${
                  activeTab === 'suppliers'
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              Поставщики
            </button>
            <button
  onClick={() => setActiveTab('recipes')}
  className={`
    px-4 py-2 font-medium rounded-t-lg transition-all whitespace-nowrap
    ${
      activeTab === 'recipes'
        ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
    }
  `}
>
  Рецепты
</button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`
                px-4 py-2 font-medium rounded-t-lg transition-all whitespace-nowrap
                ${
                  activeTab === 'purchases'
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              Закупки
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`
                px-4 py-2 font-medium rounded-t-lg transition-all whitespace-nowrap
                ${
                  activeTab === 'clients'
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              Клиенты
            </button>

          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'materials' && (
            <CategoryTab
              categories={materialCategories}
              onUpdate={handleUpdateMaterialCategory}
              onDelete={handleDeleteMaterialCategory}
            />
          )}
          {activeTab === 'inventory' && (
            <CategoryTab
              categories={inventoryCategories}
              onUpdate={handleUpdateInventoryCategory}
              onDelete={handleDeleteInventoryCategory}
            />
          )}
          {activeTab === 'products' && (
            <ProductCategoryTab
              categories={productCategories}
              inventory={inventory}
              onUpdate={handleUpdateProductCategory}
              onDelete={handleDeleteProductCategory}
              onLoadInventoryIds={handleLoadProductCategoryInventory}
            />
          )}
          {activeTab === 'suppliers' && (
            <CategoryTab
              categories={supplierCategories}
              onUpdate={handleUpdateSupplierCategory}
              onDelete={handleDeleteSupplierCategory}
            />
          )}
          {activeTab === 'recipes' && (
  <CategoryTab
    categories={recipeCategories}
    onUpdate={handleUpdateRecipeCategory}
    onDelete={handleDeleteRecipeCategory}
  />
)}
          {activeTab === 'purchases' && (
            <CategoryTab
              categories={purchaseCategories}
              onUpdate={handleUpdatePurchaseCategory}
              onDelete={handleDeletePurchaseCategory}
            />
          )}
          {activeTab === 'clients' && (
            <CategoryTab
              categories={clientCategories}
              onUpdate={handleUpdateClientCategory}
              onDelete={handleDeleteClientCategory}
            />
          )}

        </div>
      </div>
    </div>
  );
}
