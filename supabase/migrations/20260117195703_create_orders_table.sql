/*
  # Create orders table
  
  Таблица для хранения заказов с информацией о клиенте, сроках и ценах.
  
  1. New Tables
    - `orders`
      - `id` (uuid, primary key) - уникальный идентификатор заказа
      - `user_id` (uuid, foreign key) - владелец (мастер)
      - `order_number` (integer) - номер заказа (автоинкремент)
      - `client_id` (uuid, foreign key) - клиент
      - `order_date` (date) - дата создания заказа
      - `deadline` (date) - срок выполнения заказа
      - `source` (text) - источник заказа (откуда пришел)
      - `delivery` (text) - способ доставки
      - `status` (text) - статус: В процессе, На утверждении, Отменен, Выполнен
      - `bonus_type` (text) - тип бонуса: скидка, доп.товар, нет
      - `discount_type` (text) - тип скидки: процент, сумма (если bonus_type = скидка)
      - `discount_value` (decimal) - значение скидки
      - `total_price` (decimal) - итоговая цена заказа
      - `created_at` (timestamptz) - дата создания записи
      - `updated_at` (timestamptz) - дата обновления записи
  
  2. Security
    - RLS отключен согласно требованиям ТЗ
  
  3. Notes
    - order_number генерируется автоматически для каждого пользователя
    - total_price рассчитывается с учетом скидок
    - Оставшийся срок рассчитывается динамически как процент от (deadline - order_date)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number integer NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  order_date date DEFAULT CURRENT_DATE,
  deadline date,
  source text DEFAULT '',
  delivery text DEFAULT '',
  status text DEFAULT 'В процессе',
  bonus_type text DEFAULT 'нет',
  discount_type text DEFAULT 'процент',
  discount_value decimal(10, 2) DEFAULT 0,
  total_price decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_client_id_idx ON orders(client_id);
CREATE INDEX IF NOT EXISTS orders_order_date_idx ON orders(order_date);
CREATE INDEX IF NOT EXISTS orders_deadline_idx ON orders(deadline);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON orders(user_id, order_number);

-- Функция для генерации следующего номера заказа для пользователя
CREATE OR REPLACE FUNCTION get_next_order_number(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  next_number integer;
BEGIN
  SELECT COALESCE(MAX(order_number), 0) + 1 INTO next_number
  FROM orders
  WHERE user_id = p_user_id;
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации order_number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = 0 THEN
    NEW.order_number := get_next_order_number(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();