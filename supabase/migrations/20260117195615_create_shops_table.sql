/*
  # Create shops table
  
  Таблица для хранения информации о магазинах пользователей.
  
  1. New Tables
    - `shops`
      - `id` (uuid, primary key) - уникальный идентификатор магазина
      - `user_id` (uuid, foreign key) - владелец магазина
      - `name` (text) - название магазина
      - `category` (text) - категория магазина
      - `social_networks` (jsonb) - социальные сети в формате JSON
      - `owner` (text) - имя владельца
      - `created_at` (timestamptz) - дата создания
      - `updated_at` (timestamptz) - дата обновления
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
*/

CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text DEFAULT '',
  category text DEFAULT '',
  social_networks jsonb DEFAULT '{}',
  owner text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS shops_user_id_idx ON shops(user_id);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();