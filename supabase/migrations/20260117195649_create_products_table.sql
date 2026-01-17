/*
  # Create products table
  
  Таблица для хранения изделий с информацией о себестоимости и продажах.
  
  1. New Tables
    - `products`
      - `id` (uuid, primary key) - уникальный идентификатор изделия
      - `user_id` (uuid, foreign key) - владелец изделия
      - `name` (text) - название изделия
      - `category_id` (uuid, foreign key) - категория изделия
      - `description` (text) - описание изделия
      - `composition` (text) - состав изделия
      - `quantity_created` (integer) - количество созданных изделий
      - `remaining_quantity` (integer) - оставшееся количество (для продажи)
      - `labor_hours_per_item` (decimal) - трудочасы на единицу изделия
      - `cost_price_per_item` (decimal) - себестоимость единицы изделия
      - `selling_price` (decimal) - цена продажи
      - `created_at` (timestamptz) - дата создания записи
      - `updated_at` (timestamptz) - дата обновления записи
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - cost_price_per_item рассчитывается автоматически по формуле:
      (затраченный материал + износ инвентаря + трудочасы + энергозатраты)
    - remaining_quantity уменьшается при создании заказов
    - Если remaining_quantity = 0, изделие считается "продано"
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  description text DEFAULT '',
  composition text DEFAULT '',
  quantity_created integer DEFAULT 0,
  remaining_quantity integer DEFAULT 0,
  labor_hours_per_item decimal(10, 2) DEFAULT 0,
  cost_price_per_item decimal(10, 2) DEFAULT 0,
  selling_price decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_remaining_quantity_idx ON products(remaining_quantity);
CREATE INDEX IF NOT EXISTS products_selling_price_idx ON products(selling_price);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();