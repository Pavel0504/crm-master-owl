/*
  # Create clients table
  
  Таблица для хранения информации о клиентах.
  
  1. New Tables
    - `clients`
      - `id` (uuid, primary key) - уникальный идентификатор клиента
      - `user_id` (uuid, foreign key) - владелец (мастер)
      - `full_name` (text) - полное имя клиента
      - `phone` (text) - телефон клиента
      - `social_link` (text) - ссылка на социальную сеть
      - `address` (text) - адрес клиента
      - `birth_date` (date) - дата рождения
      - `tag_name` (text) - название метки
      - `tag_color` (text) - цвет метки (hex)
      - `created_at` (timestamptz) - дата создания записи
      - `updated_at` (timestamptz) - дата обновления записи
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - Метка (tag) используется для категоризации клиентов
    - Статистика заказов (количество и сумма) рассчитывается динамически из таблицы orders
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  phone text DEFAULT '',
  social_link text DEFAULT '',
  address text DEFAULT '',
  birth_date date,
  tag_name text DEFAULT '',
  tag_color text DEFAULT '#808080',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS clients_full_name_idx ON clients(full_name);
CREATE INDEX IF NOT EXISTS clients_tag_name_idx ON clients(tag_name);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();