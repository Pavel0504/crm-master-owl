import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Badge } from '../ui';

interface WeekCalendarProps {
  onDayClick: (date: Date) => void;
  tasksCountByDate: Record<string, number>;
}

interface DayData {
  date: Date;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  tasksCount: number;
}

export default function WeekCalendar({ onDayClick, tasksCountByDate }: WeekCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));

  useEffect(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    
    d.setDate(d.getDate() + diff);
    
    return d;
  }

  function getWeekDays(weekStart: Date): DayData[] {
    const days: DayData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const dayName = dayNames[date.getDay()];

      const dateKey = date.toISOString().split('T')[0];
      const tasksCount = tasksCountByDate[dateKey] || 0;

      days.push({
        date: new Date(date),
        dayNumber: date.getDate(),
        dayName,
        isToday: date.getTime() === today.getTime(),
        isCurrentMonth: date.getMonth() === today.getMonth(),
        tasksCount,
      });
    }

    return days;
  }

  function goToPreviousWeek() {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  }

  function goToNextWeek() {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  }

  function goToToday() {
    setCurrentWeekStart(getWeekStart(new Date()));
  }

  const weekDays = getWeekDays(currentWeekStart);
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const formatWeekRange = () => {
    const startMonth = monthNames[currentWeekStart.getMonth()];
    const endMonth = monthNames[weekEnd.getMonth()];
    const startDay = currentWeekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = currentWeekStart.getFullYear();

    if (currentWeekStart.getMonth() === weekEnd.getMonth()) {
      return `${startDay} - ${endDay} ${startMonth} ${year}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatWeekRange()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={goToPreviousWeek}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Назад</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={goToToday}
          >
            Сегодня
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={goToNextWeek}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Вперед</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day, index) => (
          <button
            key={index}
            onClick={() => onDayClick(day.date)}
            className={`
              relative p-4 rounded-xl border-2 transition-all
              hover:shadow-lg hover:scale-105 active:scale-95
              ${
                day.isToday
                  ? 'border-orange-500 dark:border-burgundy-500 bg-gradient-to-br from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-burgundy-600'
              }
            `}
          >
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {day.dayName}
              </div>
              <div
                className={`
                  text-2xl font-bold mb-2
                  ${
                    day.isToday
                      ? 'text-orange-600 dark:text-orange-400'
                      : day.isCurrentMonth
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-600'
                  }
                `}
              >
                {day.dayNumber}
              </div>

              {day.tasksCount > 0 && (
                <div className="flex items-center justify-center">
                  <Badge variant="primary" size="sm">
                    {day.tasksCount} {day.tasksCount === 1 ? 'задача' : day.tasksCount < 5 ? 'задачи' : 'задач'}
                  </Badge>
                </div>
              )}

              {day.tasksCount === 0 && (
                <div className="text-xs text-gray-400 dark:text-gray-600">
                  Нет задач
                </div>
              )}
            </div>

            {day.isToday && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-rose-50 dark:from-burgundy-900/20 dark:to-burgundy-800/20 rounded-xl p-4 border border-orange-200 dark:border-burgundy-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Московское время (MSK)</strong> - все даты и время отображаются в московском часовом поясе
        </p>
      </div>
    </div>
  );
}
