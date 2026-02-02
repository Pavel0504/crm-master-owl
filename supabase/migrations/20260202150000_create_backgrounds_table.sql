/*
  # Создание таблицы фоновых изображений

  1. Новые таблицы
    - `backgrounds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `desktop_light_bg` (text, base64 изображение для десктоп светлой темы)
      - `desktop_dark_bg` (text, base64 изображение для десктоп темной темы)
      - `mobile_light_bg` (text, base64 изображение для мобильной светлой темы)
      - `mobile_dark_bg` (text, base64 изображение для мобильной темной темы)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Безопасность
    - Включить RLS для таблицы `backgrounds`
    - Политика для чтения своих данных
    - Политика для создания своих данных
    - Политика для обновления своих данных
    - Политика для удаления своих данных

  3. Триггеры
    - Автоматическое обновление `updated_at` при изменении записи
*/

CREATE TABLE IF NOT EXISTS backgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  desktop_light_bg text DEFAULT '',
  desktop_dark_bg text DEFAULT '',
  mobile_light_bg text DEFAULT '',
  mobile_dark_bg text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own backgrounds"
  ON backgrounds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own backgrounds"
  ON backgrounds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backgrounds"
  ON backgrounds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backgrounds"
  ON backgrounds
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_backgrounds_updated_at
  BEFORE UPDATE ON backgrounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS backgrounds_user_id_idx ON backgrounds(user_id);
