/*
  # Create profiles table
  
  Расширение встроенной таблицы auth.users для хранения дополнительной информации о пользователях.
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `full_name` (text) - полное имя пользователя
      - `created_at` (timestamptz) - дата создания профиля
      - `updated_at` (timestamptz) - дата последнего обновления
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем индекс для быстрого поиска по id
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Триггер для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();