/*
  # Create inventory table
  
  Таблица для хранения инвентаря с информацией об износе.
  
  1. New Tables
    - `inventory`
      - `id` (uuid, primary key) - уникальный идентификатор инвентаря
      - `user_id` (uuid, foreign key) - владелец инвентаря
      - `name` (text) - название инвентаря
      - `category_id` (uuid, foreign key) - категория инвентаря
      - `purchase_price` (decimal) - цена покупки
      - `wear_percentage` (decimal) - текущий процент износа (100% изначально)
      - `wear_rate_per_item` (decimal) - процент износа на единицу изделия
      - `purchase_date` (date) - дата покупки
      - `created_at` (timestamptz) - дата создания записи
      - `updated_at` (timestamptz) - дата обновления записи
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - wear_percentage начинается со 100% (новый инвентарь) и уменьшается до 0%
    - wear_rate_per_item определяет, на сколько процентов уменьшается износ при создании одного изделия
*/

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category_id uuid REFERENCES inventory_categories(id) ON DELETE SET NULL,
  purchase_price decimal(10, 2) DEFAULT 0,
  wear_percentage decimal(5, 2) DEFAULT 100.00,
  wear_rate_per_item decimal(5, 2) DEFAULT 0,
  purchase_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS inventory_user_id_idx ON inventory(user_id);
CREATE INDEX IF NOT EXISTS inventory_category_id_idx ON inventory(category_id);
CREATE INDEX IF NOT EXISTS inventory_purchase_date_idx ON inventory(purchase_date);
CREATE INDEX IF NOT EXISTS inventory_wear_percentage_idx ON inventory(wear_percentage);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();