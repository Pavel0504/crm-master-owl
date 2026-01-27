/*
  # Создание таблиц для планировщика и планирования закупок

  ## Описание изменений
  Создание структуры для функционала планировщика задач и планирования закупок материалов.
  
  ## 1. Новые таблицы
  
  ### `tasks` - Задачи планировщика
  - `id` (uuid, primary key) - Уникальный идентификатор задачи
  - `user_id` (uuid, FK to auth.users) - Владелец задачи
  - `title` (text) - Название задачи
  - `start_date` (date) - Дата начала задачи
  - `end_date` (date) - Дата окончания задачи
  - `description` (text) - Описание задачи
  - `tag` (text) - Тег/категория задачи
  - `priority` (text) - Степень важности (низкая/средняя/высокая)
  - `status` (text) - Статус задачи (активная/завершена)
  - `completed` (boolean) - Флаг выполнения задачи
  - `created_at` (timestamptz) - Дата создания
  - `updated_at` (timestamptz) - Дата обновления
  
  ### `task_checklist_items` - Пункты чек-листа задач
  - `id` (uuid, primary key) - Уникальный идентификатор пункта
  - `task_id` (uuid, FK to tasks) - Связь с задачей
  - `title` (text) - Название пункта чек-листа
  - `completed` (boolean) - Флаг выполнения пункта
  - `order_index` (integer) - Порядковый номер в списке
  - `created_at` (timestamptz) - Дата создания
  
  ### `purchase_plans` - Планируемые закупки
  - `id` (uuid, primary key) - Уникальный идентификатор закупки
  - `user_id` (uuid, FK to auth.users) - Владелец записи о закупке
  - `name` (text) - Название закупки
  - `quantity` (decimal) - Количество
  - `amount` (decimal) - Сумма закупки
  - `delivery_method` (text) - Способ доставки
  - `notes` (text) - Заметки о закупке
  - `material_id` (uuid, FK to materials, nullable) - Связь с материалом (опционально)
  - `created_at` (timestamptz) - Дата создания
  - `updated_at` (timestamptz) - Дата обновления
  
  ## 2. Безопасность (RLS)
  - Включен RLS для всех таблиц
  - Политики обеспечивают доступ только к собственным данным пользователя
  - Для каждой таблицы созданы политики для SELECT, INSERT, UPDATE, DELETE
  
  ## 3. Индексы
  - `tasks`: индексы на user_id, start_date, end_date, status
  - `task_checklist_items`: индекс на task_id
  - `purchase_plans`: индексы на user_id, material_id
  
  ## 4. Важные примечания
  - Поле `completed` в `tasks` автоматически обновляется при изменении чек-листа
  - Связь с материалами в `purchase_plans` опциональна (nullable)
  - Используется московское время через timestamptz
  - Автоматические триггеры updated_at для tasks и purchase_plans
*/

-- Создание таблицы tasks (задачи планировщика)
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text DEFAULT '',
  tag text DEFAULT '',
  priority text DEFAULT 'средняя' CHECK (priority IN ('низкая', 'средняя', 'высокая')),
  status text DEFAULT 'активная' CHECK (status IN ('активная', 'завершена')),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы task_checklist_items (пункты чек-листа)
CREATE TABLE IF NOT EXISTS task_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы purchase_plans (планируемые закупки)
CREATE TABLE IF NOT EXISTS purchase_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity decimal DEFAULT 0,
  amount decimal DEFAULT 0,
  delivery_method text DEFAULT '',
  notes text DEFAULT '',
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_end_date ON tasks(end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_checklist_items_task_id ON task_checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_purchase_plans_user_id ON purchase_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_plans_material_id ON purchase_plans(material_id);

-- Включение RLS для всех таблиц
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_plans ENABLE ROW LEVEL SECURITY;

-- RLS политики для tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS политики для task_checklist_items
CREATE POLICY "Users can view own task checklist items"
  ON task_checklist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own task checklist items"
  ON task_checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own task checklist items"
  ON task_checklist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND tasks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own task checklist items"
  ON task_checklist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- RLS политики для purchase_plans
CREATE POLICY "Users can view own purchase plans"
  ON purchase_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchase plans"
  ON purchase_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase plans"
  ON purchase_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchase plans"
  ON purchase_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Добавление триггера для автоматического обновления updated_at в tasks
CREATE OR REPLACE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Добавление триггера для автоматического обновления updated_at в purchase_plans
CREATE OR REPLACE TRIGGER set_purchase_plans_updated_at
  BEFORE UPDATE ON purchase_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического обновления статуса задачи при изменении чек-листа
CREATE OR REPLACE FUNCTION update_task_completion_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tasks
  SET completed = (
    SELECT CASE
      WHEN COUNT(*) = 0 THEN false
      WHEN COUNT(*) = COUNT(*) FILTER (WHERE completed = true) THEN true
      ELSE false
    END
    FROM task_checklist_items
    WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)
  ),
  status = (
    SELECT CASE
      WHEN COUNT(*) = 0 THEN 'активная'
      WHEN COUNT(*) = COUNT(*) FILTER (WHERE completed = true) THEN 'завершена'
      ELSE 'активная'
    END
    FROM task_checklist_items
    WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)
  )
  WHERE id = COALESCE(NEW.task_id, OLD.task_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления completed статуса задачи
CREATE TRIGGER update_task_completed_on_checklist_change
  AFTER INSERT OR UPDATE OR DELETE ON task_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_task_completion_status();