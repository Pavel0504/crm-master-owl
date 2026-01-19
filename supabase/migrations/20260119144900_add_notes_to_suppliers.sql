/*
  # Добавление поля заметок для поставщиков

  1. Изменения
    - Добавление поля `notes` (text) в таблицу `suppliers` для хранения заметок о поставщике
  
  2. Примечания
    - Поле необязательное (nullable)
    - По умолчанию пустая строка
*/

-- Добавляем поле заметок в таблицу suppliers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;
