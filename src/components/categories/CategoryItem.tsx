import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Edit2, Trash2 } from 'lucide-react';
import { IconButton } from '../ui';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategoryItemProps {
  category: Category;
  getChildren: (parentId: string) => Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  level: number;
}

export default function CategoryItem({
  category,
  getChildren,
  onEdit,
  onDelete,
  level,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = getChildren(category.id);
  const hasChildren = children.length > 0;

  const indentClass = `ml-${level * 6}`;
  const indentStyle = { marginLeft: `${level * 1.5}rem` };

  return (
    <div>
      <div
        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 dark:hover:border-burgundy-600 transition-all"
        style={indentStyle}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            p-1 rounded transition-all
            ${hasChildren ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'invisible'}
          `}
          disabled={!hasChildren}
        >
          {hasChildren && (
            <>
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </>
          )}
        </button>

        <Folder className="h-5 w-5 text-orange-500 dark:text-burgundy-400 flex-shrink-0" />

        <span className="flex-1 font-medium text-gray-900 dark:text-white truncate">
          {category.name}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0">
          <IconButton
            icon={<Edit2 />}
            size="sm"
            variant="ghost"
            onClick={() => onEdit(category)}
          />
          <IconButton
            icon={<Trash2 />}
            size="sm"
            variant="danger"
            onClick={() => onDelete(category)}
          />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              getChildren={getChildren}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
