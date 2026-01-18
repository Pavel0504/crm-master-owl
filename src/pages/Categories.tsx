import { useState, useEffect } from 'react';
import { FolderTree, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/ui';
import CategoryTab from '../components/categories/CategoryTab';
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
} from '../services/productCategoryService';
import {
  getSupplierCategories,
  SupplierCategory,
  updateSupplierCategory,
  deleteSupplierCategory,
} from '../services/supplierCategoryService';

type TabType = 'materials' | 'inventory' | 'products' | 'suppliers';

export default function Categories() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [supplierCategories, setSupplierCategories] = useState<SupplierCategory[]>([]);

  useEffect(() => {
    loadAllCategories();
  }, [user]);

  const loadAllCategories = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [materialsResult, inventoryResult, productsResult, suppliersResult] = await Promise.all([
      getMaterialCategories(user.id),
      getInventoryCategories(user.id),
      getProductCategories(user.id),
      getSupplierCategories(user.id),
    ]);

    if (materialsResult.error || inventoryResult.error || productsResult.error || suppliersResult.error) {
      setError('Не удалось загрузить категории');
    } else {
      setMaterialCategories(materialsResult.data || []);
      setInventoryCategories(inventoryResult.data || []);
      setProductCategories(productsResult.data || []);
      setSupplierCategories(suppliersResult.data || []);
    }

    setLoading(false);
  };

  const handleUpdateMaterialCategory = async (id: string, name: string) => {
    const { error } = await updateMaterialCategory(id, { name });
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

  const handleUpdateInventoryCategory = async (id: string, name: string) => {
    const { error } = await updateInventoryCategory(id, { name });
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

  const handleUpdateProductCategory = async (id: string, name: string) => {
    const { error } = await updateProductCategory(id, { name }, []);
    if (error) {
      setError('Не удалось обновить категорию');
      return false;
    }
    await loadAllCategories();
    return true;
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

  const handleUpdateSupplierCategory = async (id: string, name: string) => {
    const { error } = await updateSupplierCategory(id, { name });
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 dark:text-burgundy-400" />
          </div>
        </div>
      </div>
    );
  }

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
            <CategoryTab
              categories={productCategories}
              onUpdate={handleUpdateProductCategory}
              onDelete={handleDeleteProductCategory}
            />
          )}
          {activeTab === 'suppliers' && (
            <CategoryTab
              categories={supplierCategories}
              onUpdate={handleUpdateSupplierCategory}
              onDelete={handleDeleteSupplierCategory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
