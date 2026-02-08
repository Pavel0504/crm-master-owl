import { useState, useEffect } from 'react';
import { ChefHat, Plus, FolderPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeWithSteps,
  Recipe,
  RecipeWithSteps,
  RecipeInput,
} from '../services/recipeService';
import {
  getRecipeCategories,
  createRecipeCategory,
  RecipeCategory,
} from '../services/recipeCategoryService';
import { Button, FilterPanel, Select, ConfirmDialog, PageHeader, SortBar } from '../components/ui';
import SearchInput from '../components/ui/SearchInput';
import RecipeCard from '../components/recipes/RecipeCard';
import CreateRecipeCategoryModal from '../components/recipes/CreateRecipeCategoryModal';
import CreateRecipeModal from '../components/recipes/CreateRecipeModal';
import EditRecipeModal from '../components/recipes/EditRecipeModal';

export default function Recipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesWithSteps, setRecipesWithSteps] = useState<RecipeWithSteps[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithSteps | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeWithSteps | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [recipesResult, categoriesResult] = await Promise.all([
      getRecipes(user.id),
      getRecipeCategories(user.id),
    ]);

    if (recipesResult.error || categoriesResult.error) {
      setError('Не удалось загрузить данные');
    } else {
      setRecipes(recipesResult.data || []);
      setCategories(categoriesResult.data || []);

      const detailsPromises = (recipesResult.data || []).map((recipe) =>
        getRecipeWithSteps(recipe.id)
      );

      const detailsResults = await Promise.all(detailsPromises);
      const details = detailsResults
        .filter((result) => result.data !== null)
        .map((result) => result.data!);

      setRecipesWithSteps(details);
    }

    setLoading(false);
  };

  const handleCreateCategory = async (data: { name: string; parent_id: string | null }) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createRecipeCategory(user.id, data);

    if (error) {
      setError('Не удалось создать категорию');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleCreateRecipe = async (data: RecipeInput) => {
    if (!user) return;

    setActionLoading(true);
    const { error } = await createRecipe(user.id, data);

    if (error) {
      setError('Не удалось создать рецепт');
    } else {
      await loadData();
    }

    setActionLoading(false);
  };

  const handleEditRecipe = async (data: RecipeInput) => {
    if (!selectedRecipe) return;

    setActionLoading(true);
    const { error } = await updateRecipe(selectedRecipe.id, data);

    if (error) {
      setError('Не удалось обновить рецепт');
    } else {
      await loadData();
      setSelectedRecipe(null);
    }

    setActionLoading(false);
  };

  const handleDeleteRecipe = async () => {
    if (!recipeToDelete) return;

    setActionLoading(true);
    const { error } = await deleteRecipe(recipeToDelete.id);

    if (error) {
      setError('Не удалось удалить рецепт');
    } else {
      await loadData();
      setRecipeToDelete(null);
    }

    setActionLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (recipe: RecipeWithSteps) => {
    setRecipeToDelete(recipe);
    setIsDeleteDialogOpen(true);
  };

  const openEditModal = (recipe: RecipeWithSteps) => {
    setSelectedRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const uniqueTags = Array.from(
    new Set(recipes.filter((r) => r.tag_name).map((r) => r.tag_name))
  ).sort((a, b) => a.localeCompare(b, 'ru'));

  const filteredRecipes = recipesWithSteps.filter((recipe) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = recipe.name.toLowerCase().includes(query);
      const matchesDescription = recipe.description?.toLowerCase().includes(query);
      const matchesTag = recipe.tag_name?.toLowerCase().includes(query);

      if (!matchesName && !matchesDescription && !matchesTag) {
        return false;
      }
    }

    if (filterTag && recipe.tag_name !== filterTag) {
      return false;
    }

    return true;
  });

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name, 'ru');
        break;
      case 'tag':
        compareValue = a.tag_name.localeCompare(b.tag_name, 'ru');
        break;
      default:
        compareValue = a.name.localeCompare(b.name, 'ru');
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setFilterTag('');
  };

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
        <PageHeader
          icon={<ChefHat className="h-6 w-6 text-white" />}
          title="Рецепты"
          subtitle="Коллекция рецептов"
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
                <span className="hidden sm:inline">Создать рецепт</span>
                <span className="sm:hidden">Создать</span>
              </Button>
            </>
          }
        />

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск по названию, описанию или тегу..."
          />
        </div>

        {uniqueTags.length > 0 && (
          <FilterPanel onReset={resetFilters} showActions={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Метка"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                options={[
                  { value: '', label: 'Все метки' },
                  ...uniqueTags.map((tag) => ({
                    value: tag,
                    label: tag,
                  })),
                ]}
              />
            </div>

            {(searchQuery || filterTag) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
                Сбросить фильтры
              </Button>
            )}
          </FilterPanel>
        )}

        <div className="mt-4">
          <SortBar
            options={[
              { value: 'name', label: 'По названию' },
              { value: 'tag', label: 'По метке' },
            ]}
            value={sortBy}
            direction={sortDirection}
            onChange={setSortBy}
            onDirectionChange={setSortDirection}
          />
        </div>
      </div>

      {sortedRecipes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <ChefHat className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Нет рецептов
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {recipes.length === 0
              ? 'Создайте первый рецепт для начала работы'
              : 'Попробуйте изменить фильтры'}
          </p>
          {recipes.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Создать рецепт
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              categories={categories}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <CreateRecipeCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        categories={sortedCategories}
        loading={actionLoading}
      />

      <CreateRecipeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRecipe}
        categories={sortedCategories}
        loading={actionLoading}
      />

      <EditRecipeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecipe(null);
        }}
        onSubmit={handleEditRecipe}
        categories={sortedCategories}
        recipe={selectedRecipe}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setRecipeToDelete(null);
        }}
        onConfirm={handleDeleteRecipe}
        title="Удалить рецепт?"
        message={
          <>
            Вы уверены что хотите удалить рецепт{' '}
            <strong>{recipeToDelete?.name}</strong>? Это действие нельзя отменить.
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
