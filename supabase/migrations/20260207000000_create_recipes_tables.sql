/*
  # Создание таблиц для рецептов

  1. Новые таблицы
    - `recipe_categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `parent_id` (uuid, nullable, foreign key to self)
      - `created_at` (timestamptz)
    
    - `recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `category_id` (uuid, nullable, foreign key)
      - `tag_name` (text)
      - `tag_color` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `recipe_steps`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, foreign key)
      - `step_text` (text)
      - `step_type` (text, nullable - quantity/time/weight)
      - `step_value` (text, nullable)
      - `order_index` (integer)
      - `created_at` (timestamptz)

  2. Безопасность
    - Включить RLS для всех таблиц
    - Политики для аутентифицированных пользователей
*/

-- Создание таблицы категорий рецептов
CREATE TABLE IF NOT EXISTS recipe_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES recipe_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipe categories"
  ON recipe_categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe categories"
  ON recipe_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipe categories"
  ON recipe_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe categories"
  ON recipe_categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Создание таблицы рецептов
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category_id uuid REFERENCES recipe_categories(id) ON DELETE SET NULL,
  tag_name text DEFAULT '',
  tag_color text DEFAULT '#808080',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Создание таблицы пунктов рецептов
CREATE TABLE IF NOT EXISTS recipe_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  step_text text NOT NULL,
  step_type text,
  step_value text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipe steps for own recipes"
  ON recipe_steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recipe steps for own recipes"
  ON recipe_steps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recipe steps for own recipes"
  ON recipe_steps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete recipe steps for own recipes"
  ON recipe_steps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
