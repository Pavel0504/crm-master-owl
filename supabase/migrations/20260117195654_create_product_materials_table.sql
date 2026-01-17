/*
  # Create product_materials table
  
  Связующая таблица между изделиями и материалами (many-to-many) с указанием объема.
  
  1. New Tables
    - `product_materials`
      - `id` (uuid, primary key) - уникальный идентификатор связи
      - `product_id` (uuid, foreign key) - изделие
      - `material_id` (uuid, foreign key) - материал
      - `volume_per_item` (decimal) - объем материала на единицу изделия
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - Определяет, какие материалы и в каком количестве используются для создания одной единицы изделия
    - При создании изделия материалы автоматически вычитаются из остатков
*/

CREATE TABLE IF NOT EXISTS product_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  volume_per_item decimal(10, 3) DEFAULT 0,
  UNIQUE(product_id, material_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS product_materials_product_id_idx ON product_materials(product_id);
CREATE INDEX IF NOT EXISTS product_materials_material_id_idx ON product_materials(material_id);