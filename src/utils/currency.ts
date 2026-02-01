/**
 * Утилиты для работы с денежными суммами в рублях и числами
 * Обеспечивают точность до копеек (2 знака) для валюты и до тысячных (3 знака) для чисел
 */

/**
 * Парсит строку с денежной суммой, поддерживает как точку, так и запятую
 * @param value - строка с суммой (например: "1500,50" или "1500.50")
 * @returns число с точностью до копеек
 */
export function parseCurrency(value: string | number): number {
  if (typeof value === 'number') {
    return roundToCents(value);
  }
  
  // Заменяем запятую на точку
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  
  if (isNaN(parsed)) {
    return 0;
  }
  
  return roundToCents(parsed);
}

/**
 * Парсит строку с числом до тысячных, поддерживает как точку, так и запятую
 * @param value - строка с числом (например: "1500,525" или "1500.525")
 * @returns число с точностью до тысячных
 */
export function parseDecimal(value: string | number): number {
  if (typeof value === 'number') {
    return roundToThousandths(value);
  }
  
  // Заменяем запятую на точку
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  
  if (isNaN(parsed)) {
    return 0;
  }
  
  return roundToThousandths(parsed);
}

/**
 * Округляет число до копеек (2 знака после запятой)
 * @param value - число для округления
 * @returns число округленное до копеек
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Округляет число до тысячных (3 знака после запятой)
 * @param value - число для округления
 * @returns число округленное до тысячных
 */
export function roundToThousandths(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Форматирует число в строку с 2 знаками после запятой
 * @param value - число для форматирования
 * @returns строка вида "1500.50"
 */
export function formatCurrency(value: number): string {
  return roundToCents(value).toFixed(2);
}

/**
 * Форматирует число в строку с 3 знаками после запятой
 * @param value - число для форматирования
 * @returns строка вида "1500.525"
 */
export function formatDecimal(value: number): string {
  return roundToThousandths(value).toFixed(3);
}

/**
 * Форматирует число в строку для отображения пользователю (с запятой)
 * @param value - число для форматирования
 * @returns строка вида "1 500,50 руб."
 */
export function formatCurrencyDisplay(value: number): string {
  const rounded = roundToCents(value);
  return `${rounded.toFixed(2).replace('.', ',')} руб.`;
}

/**
 * Форматирует число для отображения с пробелами между разрядами
 * @param value - число для форматирования
 * @returns строка вида "1 500,50"
 */
export function formatCurrencyWithSpaces(value: number): string {
  const rounded = roundToCents(value);
  const [integerPart, decimalPart] = rounded.toFixed(2).split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInteger},${decimalPart}`;
}

/**
 * Обработчик изменения для input полей с денежными суммами
 * @param value - значение из input
 * @returns число с точностью до копеек
 */
export function handleCurrencyInput(value: string): number {
  // Разрешаем только цифры, точку и запятую
  const cleaned = value.replace(/[^\d.,]/g, '');
  return parseCurrency(cleaned);
}

/**
 * Обработчик изменения для input полей с десятичными числами
 * @param value - значение из input
 * @returns число с точностью до тысячных
 */
export function handleDecimalInput(value: string): number {
  // Разрешаем только цифры, точку и запятую
  const cleaned = value.replace(/[^\d.,]/g, '');
  return parseDecimal(cleaned);
}

/**
 * Суммирует массив денежных значений с точностью до копеек
 * @param values - массив чисел
 * @returns сумма округленная до копеек
 */
export function sumCurrency(...values: number[]): number {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return roundToCents(sum);
}

/**
 * Умножает денежное значение на количество с точностью до копеек
 * @param price - цена
 * @param quantity - количество
 * @returns произведение округленное до копеек
 */
export function multiplyCurrency(price: number, quantity: number): number {
  return roundToCents(price * quantity);
}
