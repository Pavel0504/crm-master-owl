import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductMaterials,
  calculateProductCost,
  Product,
} from '../services/productService';
import {
  getProductCategories,
  createProductCategory,
  ProductCategory,
} from '../services/productCategoryService';
import { getMaterials, Material } from '../services/materialService';
import { getInventory, Inventory } from '../services/inventoryService';
import { Button, FilterPanel, Select, Input, ConfirmDialog, PageHeader } from '../components/ui';
import ProductCard from '../components/products/ProductCard';
import CreateProductCategoryModal from '../components/products/CreateProductCategoryModal';
import CreateProductModal from '../components/products/CreateProductModal';
import EditProductModal from '../components/products/EditProductModal';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [productMaterials, setProductMaterials] = useState<
    Record<string, Array<{ material_id: string; volume_per_item: number; material_name: string }>>
  >({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPriceFrom, setFilterPriceFrom] = useState<string>('');
  const [filterPriceTo, setFilterPriceTo] = useState<string>('');
  const [filterQuantityFrom, setFilterQuantityFrom] = useState<string>('');
  const [filterQuantityTo, setFilterQuantityTo] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [productsResult, categoriesResult, materialsResult, inventoryResult] =
      await Promise.all([
        getProducts(user.id),
        getProductCategories(user.id),
        getMaterials(user.id),
        getInventory(user.id),
      ]);

    if (
      productsResult.error ||
      categoriesResult.error ||
      materialsResult.error ||
      inventoryResult.error
    ) {
      setError('Не удалось загрузить данные');
    } else {
      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setMaterials(materialsResult.data || []);
      setInventory(inventoryResult.data || []);

      const materialsMap: Record<
        string,
        Array<{ material_id: string; volume_per_item: number; material_name: string }>
      > = {};

      for (const product of productsResult.data || []) {
        const { data: productMats } = await getProductMaterials(product.id);
        if (productMats) {
          materialsMap[product.id] = productMats.map((pm) => {
            const material = (materialsResult.data || []).find((m) => m.id === pm.material_id);
            return {
              ...pm,
              material_name: material?.name || 'Неизвестный материал',
            };
          });
        }
      }

      setProductMaterials(materialsMap);
    }

    setLoading(false);
  };

  const handleCreateCategory = async (
    data: {
      name: string;
      parent_id: string | null;
      energy_costs_electricity: number;
      energy_costs_water: number;
    },
    inventoryIds: string[]
  ) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createProductCategory(user.id, data, inventoryIds);

    if (error) {
      setError('Не удалось создать категорию');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleCalculateCost = async (
    categoryId: string | null,
    materials: Array<{ material_id: string; volume_per_item: number }>,
    laborHours: number,
    quantity: number
  ): Promise<number> => {
    if (!user) return 0;

    const { cost } = await calculateProductCost(categoryId, materials, laborHours, quantity, user.id);
    return cost;
  };

  const handleCreateProduct = async (data: {
    name: string;
    category_id?: string | null;
    description?: string;
    composition?: string;
    quantity_created: number;
    labor_hours_per_item?: number;
    selling_price?: number;
    materials: Array<{ material_id: string; volume_per_item: number }>;
  }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createProduct(user.id, data);

    if (error) {
      setError(error.message || 'Не удалось создать изделие');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEditProduct = async (data: {
    name: string;
    category_id?: string | null;
    description?: string;
    composition?: string;
    labor_hours_per_item?: number;
    selling_price?: number;
  }) => {
    if (!selectedProduct) return;

    setActionLoading(true);
    const { error } = await updateProduct(selectedProduct.id, data);

    if (error) {
      setError('Не удалось обновить изделие');
    } else {
      await loadData();
      setSelectedProduct(null);
    }

    setActionLoading(false);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setActionLoading(true);
    const { error } = await deleteProduct(productToDelete.id);

    if (error) {
      setError('Не удалось удалить изделие');
    } else {
      await loadData();
      setProductToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const filteredProducts = products.filter((product) => {
    if (filterCategory && product.category_id !== filterCategory) {
      return false;
    }

    if (filterPriceFrom && product.selling_price < parseFloat(filterPriceFrom)) {
      return false;
    }

    if (filterPriceTo && product.selling_price > parseFloat(filterPriceTo)) {
      return false;
    }

    if (filterQuantityFrom && product.remaining_quantity < parseInt(filterQuantityFrom)) {
      return false;
    }

    if (filterQuantityTo && product.remaining_quantity > parseInt(filterQuantityTo)) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterCategory('');
    setFilterPriceFrom('');
    setFilterPriceTo('');
    setFilterQuantityFrom('');
    setFilterQuantityTo('');
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
          icon={<ShoppingBag className="h-6 w-6 text-white" />}
          title="Изделия"
          subtitle="Каталог готовых изделий"
          actions={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                size="md"
              >
                <FolderPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Категория</span>
                <span className="sm:hidden">Кат.</span>
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                size="md"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Создать изделие</span>
                <span className="sm:hidden">Создать</span>
              </Button>
            </>
          }
        />

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FilterPanel onReset={resetFilters} showActions={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Категория"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: '', label: 'Все категории' },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />

            <Input
              label="Цена от (руб.)"
              type="number"
              step="0.01"
              min="0"
              value={filterPriceFrom}
              onChange={(e) => setFilterPriceFrom(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Цена до (руб.)"
              type="number"
              step="0.01"
              min="0"
              value={filterPriceTo}
              onChange={(e) => setFilterPriceTo(e.target.value)}
              placeholder="10000"
            />

            <Input
              label="Количество от (шт)"
              type="number"
              min="0"
              value={filterQuantityFrom}
              onChange={(e) => setFilterQuantityFrom(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Количество до (шт)"
              type="number"
              min="0"
              value={filterQuantityTo}
              onChange={(e) => setFilterQuantityTo(e.target.value)}
              placeholder="100"
            />
          </div>

          {(filterCategory ||
            filterPriceFrom ||
            filterPriceTo ||
            filterQuantityFrom ||
            filterQuantityTo) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
              Сбросить фильтры
            </Button>
          )}
        </FilterPanel>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет изделий
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {products.length === 0
              ? 'Создайте первое изделие для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {products.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Создать изделие
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categories={categories}
              materials={productMaterials[product.id] || []}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreateProductCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        categories={categories}
        inventory={inventory}
        loading={actionLoading}
      />

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
        categories={categories}
        materials={materials}
        loading={actionLoading}
        onCalculateCost={handleCalculateCost}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditProduct}
        categories={categories}
        product={selectedProduct}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Удалить изделие?"
        message={
          <>
            Вы уверены что хотите удалить изделие <strong>{productToDelete?.name}</strong>? Это
            действие нельзя отменить.
          </>
        }
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
