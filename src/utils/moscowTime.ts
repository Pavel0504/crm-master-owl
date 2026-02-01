/**
 * Утилиты для работы с московским временем (MSK, UTC+3)
 */

/**
 * Получает текущее московское время
 */
export function getMoscowTime(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const moscowTime = new Date(utc + (3600000 * 3));
  return moscowTime;
}

/**
 * Преобразует дату в московское время
 */
export function toMoscowTime(date: Date): Date {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const moscowTime = new Date(utc + (3600000 * 3));
  return moscowTime;
}

/**
 * Получает текущую дату в московском времени в формате YYYY-MM-DD
 */
export function getMoscowDateString(): string {
  const moscowTime = getMoscowTime();
  const year = moscowTime.getFullYear();
  const month = String(moscowTime.getMonth() + 1).padStart(2, '0');
  const day = String(moscowTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Преобразует Date в строку формата YYYY-MM-DD в московском времени
 */
export function toMoscowDateString(date: Date): string {
  const moscowTime = toMoscowTime(date);
  const year = moscowTime.getFullYear();
  const month = String(moscowTime.getMonth() + 1).padStart(2, '0');
  const day = String(moscowTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Создает Date объект из строки YYYY-MM-DD в московском времени
 */
export function createMoscowDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const moscowDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  return moscowDate;
}

/**
 * Проверяет, является ли дата сегодняшним днем по московскому времени
 */
export function isMoscowToday(date: Date): boolean {
  const moscowToday = getMoscowDateString();
  const checkDate = toMoscowDateString(date);
  return moscowToday === checkDate;
}

/**
 * Получает начало недели (понедельник) в московском времени
 */
export function getMoscowWeekStart(date?: Date): Date {
  const moscowDate = date ? toMoscowTime(date) : getMoscowTime();
  const d = new Date(moscowDate);
  d.setHours(0, 0, 0, 0);
  
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  
  d.setDate(d.getDate() + diff);
  
  return d;
}
