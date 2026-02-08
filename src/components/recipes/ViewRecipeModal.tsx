import { Modal, Badge } from '../ui';
import { RecipeWithSteps } from '../../services/recipeService';
import { ChefHat, ListOrdered } from 'lucide-react';

interface ViewRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeWithSteps | null;
}

export default function ViewRecipeModal({ isOpen, onClose, recipe }: ViewRecipeModalProps) {
  if (!recipe) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recipe.name} size="lg">
      <div className="space-y-6">
        {recipe.tag_name && (
          <div className="flex items-center gap-2">
            <Badge
              variant="custom"
              size="md"
              style={{
                backgroundColor: `${recipe.tag_color}20`,
                color: recipe.tag_color,
                borderColor: recipe.tag_color,
              }}
            >
              {recipe.tag_name}
            </Badge>
          </div>
        )}

        {recipe.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Описание
            </h3>
            <p className="text-gray-900 dark:text-white">{recipe.description}</p>
          </div>
        )}

        {recipe.steps && recipe.steps.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <ListOrdered className="h-4 w-4" />
              Шаги рецепта
            </h3>
            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex gap-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-burgundy-500 dark:bg-burgundy-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{step.step_text}</p>
                    {(step.step_type || step.step_value) && (
                      <div className="mt-2 flex items-center gap-2">
                        {step.step_type && (
                          <Badge variant="info" size="sm">
                            {step.step_type}
                          </Badge>
                        )}
                        {step.step_value && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {step.step_value}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
