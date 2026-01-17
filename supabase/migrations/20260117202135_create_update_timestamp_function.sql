/*
  # Create update timestamp function

  Универсальная функция для автоматического обновления поля updated_at.

  1. Changes
    - Создание функции update_updated_at_column() для триггеров
    - Функция автоматически обновляет поле updated_at при изменении записи

  2. Usage
    - Используется в триггерах таблиц для автоматического обновления временных меток
*/

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;