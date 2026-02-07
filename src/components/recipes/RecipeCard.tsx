import { Edit2, Trash2, ChefHat } from 'lucide-react';
import { RecipeWithSteps } from '../../services/recipeService';
import { RecipeCategory } from '../../services/recipeCategoryService';
import { ExpandableCard, IconButton, Badge } from '../ui';

interface RecipeCardProps {
  recipe: RecipeWithSteps;
  categories: RecipeCategory[];
  onEdit: (recipe: RecipeWithSteps) => void;
  onDelete: (recipe: RecipeWithSteps) => void;
}

export default function RecipeCard({ recipe, categories, onEdit, onDelete }: RecipeCardProps) {
  const category = categories.find((cat) => cat.id === recipe.category_id);

  const title = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {recipe.name}
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        {recipe.tag_name && (
          <Badge customColor={recipe.tag_color} size="md">
            {recipe.tag_name}
          </Badge>
        )}
      </div>
    </div>
  );

  const headerContent = (
    <>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
        <IconButton
          icon={<Edit2 />}
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(recipe);
          }}
        />
        <IconButton
          icon={<Trash2 />}
          size="sm"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(recipe);
          }}
        />
      </div>
    </>
  );

  return (
    <ExpandableCard title={title} headerContent={headerContent}>
      <div className="mt-4 space-y-4">
        {category && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Категория</p>
            <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
          </div>
        )}

        {recipe.description && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Описание</p>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {recipe.description}
            </p>
          </div>
        )}

        {recipe.steps && recipe.steps.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Пошаговое выполнение
            </h4>
            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium mb-1">
                      {step.step_text}
                    </p>
                    {step.step_type && step.step_value && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="primary" size="sm">
                          {step.step_type === 'quantity' && 'Количество'}
                          {step.step_type === 'time' && 'Время'}
                          {step.step_type === 'weight' && 'Вес'}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {step.step_value}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ExpandableCard>
  );
}
