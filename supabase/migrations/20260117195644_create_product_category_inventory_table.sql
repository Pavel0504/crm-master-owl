/*
  # Create product_category_inventory table
  
  Связующая таблица между категориями изделий и инвентарем (many-to-many).
  
  1. New Tables
    - `product_category_inventory`
      - `id` (uuid, primary key) - уникальный идентификатор связи
      - `category_id` (uuid, foreign key) - категория изделия
      - `inventory_id` (uuid, foreign key) - инвентарь
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - Определяет, какой инвентарь используется для изделий определенной категории
    - При создании изделия инвентарь из связанной категории будет изнашиваться
*/

CREATE TABLE IF NOT EXISTS product_category_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES product_categories(id) ON DELETE CASCADE NOT NULL,
  inventory_id uuid REFERENCES inventory(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(category_id, inventory_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS product_category_inventory_category_id_idx ON product_category_inventory(category_id);
CREATE INDEX IF NOT EXISTS product_category_inventory_inventory_id_idx ON product_category_inventory(inventory_id);