/*
  # Создание таблиц для поставщиков

  1. Новые таблицы
    - `supplier_categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `parent_id` (uuid, nullable, self-reference)
      - `created_at` (timestamp)
    
    - `suppliers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `category_id` (uuid, nullable, foreign key to supplier_categories)
      - `delivery_method` (text)
      - `delivery_price` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Безопасность
    - Enable RLS на обеих таблицах
    - Добавить политики для аутентифицированных пользователей
*/

-- Создание таблицы категорий поставщиков
CREATE TABLE IF NOT EXISTS supplier_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES supplier_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Создание таблицы поставщиков
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category_id uuid REFERENCES supplier_categories(id) ON DELETE SET NULL,
  delivery_method text DEFAULT '' NOT NULL,
  delivery_price decimal(10, 2) DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Включение RLS
ALTER TABLE supplier_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Политики для supplier_categories
CREATE POLICY "Users can view own supplier categories"
  ON supplier_categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own supplier categories"
  ON supplier_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplier categories"
  ON supplier_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplier categories"
  ON supplier_categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Политики для suppliers
CREATE POLICY "Users can view own suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Триггер для обновления updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();