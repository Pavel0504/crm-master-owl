/*
  # Добавление поля quantity_rate_per_item в таблицу inventory

  1. Изменения
    - Добавляем поле `quantity_rate_per_item` (decimal) в таблицу `inventory`
    - Это поле будет использоваться для инвентаря типа "количество"
    - Аналогично `wear_rate_per_item` для процентного типа

  2. Примечания
    - Поле nullable, так как используется только для типа "количество"
    - Для типа "процент" это поле будет null
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory' AND column_name = 'quantity_rate_per_item'
  ) THEN
    ALTER TABLE inventory ADD COLUMN quantity_rate_per_item decimal DEFAULT 0;
  END IF;
END $$;
