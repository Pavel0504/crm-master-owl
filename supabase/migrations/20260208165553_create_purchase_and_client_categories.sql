/*
  # Create Purchase and Client Categories Tables

  1. New Tables
    - `purchase_categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text, category name)
      - `parent_id` (uuid, self-referencing for hierarchy)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `client_categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text, category name)
      - `parent_id` (uuid, self-referencing for hierarchy)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `category_id` to `purchase_plans` table
    - Add `category_id` to `clients` table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to manage their own categories
*/

-- Create purchase_categories table
CREATE TABLE IF NOT EXISTS purchase_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES purchase_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchase categories"
  ON purchase_categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchase categories"
  ON purchase_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase categories"
  ON purchase_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchase categories"
  ON purchase_categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create client_categories table
CREATE TABLE IF NOT EXISTS client_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES client_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own client categories"
  ON client_categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own client categories"
  ON client_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client categories"
  ON client_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client categories"
  ON client_categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add category_id to purchase_plans table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'purchase_plans' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE purchase_plans ADD COLUMN category_id uuid REFERENCES purchase_categories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_purchase_plans_category_id ON purchase_plans(category_id);
  END IF;
END $$;

-- Add category_id to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN category_id uuid REFERENCES client_categories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_clients_category_id ON clients(category_id);
  END IF;
END $$;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_purchase_categories_updated_at ON purchase_categories;
CREATE TRIGGER update_purchase_categories_updated_at
  BEFORE UPDATE ON purchase_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_categories_updated_at ON client_categories;
CREATE TRIGGER update_client_categories_updated_at
  BEFORE UPDATE ON client_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
