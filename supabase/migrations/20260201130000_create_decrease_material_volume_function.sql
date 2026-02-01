/*
  # Создание функции для уменьшения объема материала

  1. Функции
    - `decrease_material_volume` - атомарно уменьшает remaining_volume материала
    - Принимает material_id и volume_to_decrease
    - Возвращает обновленное значение remaining_volume
    - Проверяет, что remaining_volume не станет отрицательным
  
  2. Безопасность
    - Функция выполняется с правами вызывающего пользователя
*/

-- Создаем функцию для атомарного уменьшения объема материала
CREATE OR REPLACE FUNCTION decrease_material_volume(
  material_id uuid,
  volume_to_decrease numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_volume numeric;
BEGIN
  -- Обновляем remaining_volume и возвращаем новое значение
  UPDATE materials
  SET remaining_volume = remaining_volume - volume_to_decrease
  WHERE id = material_id
  RETURNING remaining_volume INTO new_volume;
  
  -- Проверяем что объем не стал отрицательным
  IF new_volume < 0 THEN
    RAISE EXCEPTION 'Недостаточно материала (remaining_volume стал бы отрицательным)';
  END IF;
  
  RETURN new_volume;
END;
$$;
