/*
  # Добавление типов инвентаря (проценты или количество)

  1. Изменения
    - Добавлено поле `inventory_type` для выбора между процентами и количеством
    - Добавлено поле `quantity` для количества штук
    - Добавлено поле `remaining_quantity` для оставшегося количества
    - Поля `wear_percentage` и `wear_rate_per_item` теперь опциональны (nullable)
  
  2. Типы
    - 'процент' - инвентарь с процентным износом (кастрюли, машинки и т.д.)
    - 'количество' - расходный инвентарь поштучно (одноразовые ложки и т.д.)
*/

-- Добавляем новые поля к таблице inventory
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS inventory_type text DEFAULT 'процент' NOT NULL,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_quantity integer DEFAULT 0;

-- Делаем поля износа опциональными
ALTER TABLE inventory
ALTER COLUMN wear_percentage DROP NOT NULL,
ALTER COLUMN wear_rate_per_item DROP NOT NULL;

-- Добавляем комментарии
COMMENT ON COLUMN inventory.inventory_type IS 'Тип инвентаря: процент или количество';
COMMENT ON COLUMN inventory.quantity IS 'Количество штук (для типа количество)';
COMMENT ON COLUMN inventory.remaining_quantity IS 'Оставшееся количество штук (для типа количество)';
