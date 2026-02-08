/*
  # Add recipe reference to products

  1. Changes
    - Add `recipe_id` column to `products` table as optional foreign key to `recipes` table
    - Add index for efficient recipe lookups

  2. Notes
    - Products can optionally have an associated recipe
    - When a recipe is deleted, the product's recipe_id is set to NULL
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'recipe_id'
  ) THEN
    ALTER TABLE products ADD COLUMN recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS products_recipe_id_idx ON products(recipe_id);
  END IF;
END $$;
