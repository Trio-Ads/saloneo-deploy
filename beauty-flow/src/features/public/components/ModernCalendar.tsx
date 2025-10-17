import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfToday, addDays } from 'date-fns';
import { fr, enUS, ar } from 'date-fns/locale';
import './ModernCalendar.css';

interface ModernCalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}

const ModernCalendar: React.FC<ModernCalendarProps> = ({
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate = startOfToday(),
  maxDate = addDays(startOfToday(), 365),
  locale = 'fr'
}) => {
  const { t } = useTranslation('public');
  const [currentMonth, setCurrentMonth] = useState(selectedDate || startOfToday());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const dateLocale = useMemo(() => {
    switch (locale) {
      case 'ar': return ar;
      case 'en': return enUS;
      default: return fr;
    }
  }, [locale]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculer les jours de la semaine précédente pour compléter la grille
  const startDay = monthStart.getDay();
  const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - i));
    return date;
  });

  // Calculer les jours du mois suivant pour compléter la grille
  const totalDays = previousMonthDays.length + daysInMonth.length;
  const remainingDays = 42 - totalDays; // 6 semaines * 7 jours
  const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];

  const isDateAvailable = (date: Date) => {
    if (isBefore(date, minDate) || isBefore(maxDate, date)) return false;
    if (availableDates.length === 0) return true;
    return availableDates.some(availableDate => isSameDay(availableDate, date));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date) && isSameMonth(date, currentMonth)) {
      onSelectDate(date);
    }
  };

  const weekDays = useMemo(() => {
    const days = [];
    const baseDate = new Date(2024, 0, 1); // Lundi
    for (let i = 0; i < 7; i++) {
      const day = new Date(baseDate);
      day.setDate(baseDate.getDate() + i);
      days.push(format(day, 'EEE', { locale: dateLocale }));
    }
    return days;
  }, [dateLocale]);

  return (
    <div className="modern-calendar">
      {/* Header avec navigation */}
      <div className="calendar-header">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousMonth}
              className="calendar-nav-btn"
              aria-label="Mois précédent"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="calendar-month-display">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="calendar-nav-btn"
              aria-label="Mois suivant"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Toggle vue mois/semaine */}
          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode('month')}
              className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
            >
              {t('booking.calendar.month_view')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
            >
              {t('booking.calendar.week_view')}
            </button>
          </div>
        </div>

        {/* Jours de la semaine */}
        <div className="calendar-weekdays">
          {weekDays.map((day, index) => (
            <div key={index} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="calendar-grid">
        {allDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const isAvailable = isDateAvailable(date);
          const isPast = isBefore(date, minDate);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!isAvailable || !isCurrentMonth || isPast}
              className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${
                isSelected ? 'selected' : ''
              } ${isTodayDate ? 'today' : ''} ${isAvailable && isCurrentMonth && !isPast ? 'available' : 'unavailable'}`}
            >
              <span className="day-number">{format(date, 'd')}</span>
              {isAvailable && isCurrentMonth && !isPast && (
                <span className="availability-indicator"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot today"></span>
          <span className="legend-text">{t('booking.calendar.today')}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot available"></span>
          <span className="legend-text">{t('booking.calendar.available')}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot unavailable"></span>
          <span className="legend-text">{t('booking.calendar.unavailable')}</span>
        </div>
      </div>

    </div>
  );
};

export default ModernCalendar;
