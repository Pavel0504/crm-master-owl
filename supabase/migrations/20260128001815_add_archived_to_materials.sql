/*
  # Добавление поля archived для материалов

  1. Изменения
    - Добавляем поле `archived` в таблицу `materials`
      - Тип: boolean
      - По умолчанию: false
      - Используется для отметки архивных материалов (не показывать уведомления)

  2. Примечания
    - Архивные материалы не участвуют в проверках низких остатков
    - Пользователь может пометить материал как архивный из уведомления
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materials' AND column_name = 'archived'
  ) THEN
    ALTER TABLE materials ADD COLUMN archived boolean DEFAULT false;
  END IF;
END $$;
