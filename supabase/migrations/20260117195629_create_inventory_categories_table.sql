/*
  # Create inventory_categories table
  
  Таблица для хранения категорий инвентаря с поддержкой вложенности.
  
  1. New Tables
    - `inventory_categories`
      - `id` (uuid, primary key) - уникальный идентификатор категории
      - `user_id` (uuid, foreign key) - владелец категории
      - `name` (text) - название категории
      - `parent_id` (uuid, foreign key, nullable) - родительская категория для вложенности
      - `created_at` (timestamptz) - дата создания
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
*/

CREATE TABLE IF NOT EXISTS inventory_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_id uuid REFERENCES inventory_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS inventory_categories_user_id_idx ON inventory_categories(user_id);
CREATE INDEX IF NOT EXISTS inventory_categories_parent_id_idx ON inventory_categories(parent_id);