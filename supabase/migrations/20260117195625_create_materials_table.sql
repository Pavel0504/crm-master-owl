/*
  # Create materials table
  
  Таблица для хранения материалов с информацией о закупках и остатках.
  
  1. New Tables
    - `materials`
      - `id` (uuid, primary key) - уникальный идентификатор материала
      - `user_id` (uuid, foreign key) - владелец материала
      - `name` (text) - название материала
      - `category_id` (uuid, foreign key) - категория материала
      - `supplier` (text) - поставщик
      - `delivery_method` (text) - способ доставки
      - `purchase_price` (decimal) - цена закупки
      - `initial_volume` (decimal) - начальный объем
      - `remaining_volume` (decimal) - оставшийся объем
      - `purchase_date` (date) - дата закупки
      - `unit_of_measurement` (text) - единица измерения
      - `created_at` (timestamptz) - дата создания записи
      - `updated_at` (timestamptz) - дата обновления записи
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - Поле remaining_volume используется для отслеживания остатков
    - При создании изделий из этих материалов, remaining_volume будет автоматически уменьшаться
*/

CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category_id uuid REFERENCES material_categories(id) ON DELETE SET NULL,
  supplier text DEFAULT '',
  delivery_method text DEFAULT '',
  purchase_price decimal(10, 2) DEFAULT 0,
  initial_volume decimal(10, 3) DEFAULT 0,
  remaining_volume decimal(10, 3) DEFAULT 0,
  purchase_date date DEFAULT CURRENT_DATE,
  unit_of_measurement text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS materials_user_id_idx ON materials(user_id);
CREATE INDEX IF NOT EXISTS materials_category_id_idx ON materials(category_id);
CREATE INDEX IF NOT EXISTS materials_purchase_date_idx ON materials(purchase_date);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();