/*
  # Добавление даты создания в таблицу изделий

  1. Изменения
    - Добавляем поле `creation_date` (date) в таблицу `products`
    - Устанавливаем текущую дату как значение по умолчанию для существующих записей
    - Для новых записей используется текущая дата по умолчанию
  
  2. Примечания
    - Поле не обязательное (nullable), но имеет дефолтное значение
    - Существующие записи получат текущую дату
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'creation_date'
  ) THEN
    ALTER TABLE products ADD COLUMN creation_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;
