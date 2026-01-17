/*
  # Create order_items table
  
  Таблица для хранения изделий в заказах (связь many-to-many между orders и products).
  
  1. New Tables
    - `order_items`
      - `id` (uuid, primary key) - уникальный идентификатор элемента заказа
      - `order_id` (uuid, foreign key) - заказ
      - `product_id` (uuid, foreign key) - изделие
      - `quantity` (integer) - количество изделий
      - `is_bonus` (boolean) - является ли бонусным товаром
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - При создании заказа изделия автоматически вычитаются из remaining_quantity в таблице products
    - Бонусные товары (is_bonus = true) не учитываются в расчете total_price заказа
*/

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  is_bonus boolean DEFAULT false
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);