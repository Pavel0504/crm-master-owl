/*
  # Create product_categories table
  
  Таблица для хранения категорий изделий с информацией об энергозатратах.
  
  1. New Tables
    - `product_categories`
      - `id` (uuid, primary key) - уникальный идентификатор категории
      - `user_id` (uuid, foreign key) - владелец категории
      - `name` (text) - название категории
      - `parent_id` (uuid, foreign key, nullable) - родительская категория для вложенности
      - `energy_costs_electricity` (decimal) - затраты на электричество
      - `energy_costs_water` (decimal) - затраты на воду
      - `created_at` (timestamptz) - дата создания
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - Энергозатраты задаются на уровне категории и применяются ко всем изделиям этой категории
*/

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES product_categories(id) ON DELETE CASCADE,
  energy_costs_electricity decimal(10, 2) DEFAULT 0,
  energy_costs_water decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS product_categories_user_id_idx ON product_categories(user_id);
CREATE INDEX IF NOT EXISTS product_categories_parent_id_idx ON product_categories(parent_id);