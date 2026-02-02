/*
  # Создание таблицы сотрудников

  1. Новые таблицы
    - `employees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users, nullable) - null пока не присоединился
      - `created_by_user_id` (uuid, FK to auth.users) - кто создал
      - `full_name` (text) - ФИО
      - `phone` (text) - номер телефона
      - `email` (text, unique) - email
      - `role` (text) - роль (admin/user)
      - `position_name` (text) - название должности
      - `position_color` (text) - цвет метки должности
      - `allowed_pages` (text[]) - массив доступных страниц
      - `invite_token` (uuid, unique) - токен для регистрации
      - `joined` (boolean) - присоединился ли
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Безопасность
    - Enable RLS на `employees` таблице
    - Политики для authenticated пользователей
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  phone text DEFAULT '',
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  position_name text DEFAULT '',
  position_color text DEFAULT '#808080',
  allowed_pages text[] DEFAULT '{}',
  invite_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  joined boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employees they created"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by_user_id);

CREATE POLICY "Users can insert employees"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can update their employees"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by_user_id)
  WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can delete their employees"
  ON employees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by_user_id);

CREATE POLICY "Employees can view themselves by invite token"
  ON employees
  FOR SELECT
  TO authenticated
  USING (invite_token IN (
    SELECT (current_setting('request.jwt.claims', true)::json->>'invite_token')::uuid
  ));

CREATE POLICY "Employees can update themselves after joining"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_employees_created_by ON employees(created_by_user_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_invite_token ON employees(invite_token);
CREATE INDEX idx_employees_email ON employees(email);
