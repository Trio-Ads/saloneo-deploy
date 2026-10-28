import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, isBefore, startOfDay, startOfToday, addDays,
} from 'date-fns';
import { dateLocale } from './bookingTheme';

interface ModernCalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}

/** Month grid (Monday first). Must be rendered inside a `.bk` root. */
const ModernCalendar: React.FC<ModernCalendarProps> = ({
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate = startOfToday(),
  maxDate = addDays(startOfToday(), 365),
  locale = 'fr',
}) => {
  const { t } = useTranslation('public');
  const loc = dateLocale(locale);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || startOfToday());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });
  const weekDays = useMemo(
    () => days.slice(0, 7).map((d) => format(d, 'EEEEEE', { locale: loc })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loc]
  );
  const available = useMemo(() => new Set(availableDates.map((d) => format(d, 'yyyy-MM-dd'))), [availableDates]);

  const isDateAvailable = (date: Date) =>
    !isBefore(date, startOfToday()) && !isBefore(date, startOfDay(minDate)) && !isBefore(maxDate, date) &&
    available.has(format(date, "yyyy-MM-dd"));

  const canGoBack = !isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(minDate));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="bk-h text-base first-letter:uppercase">
          {format(currentMonth, 'MMMM yyyy', { locale: loc })}
        </span>
        <div className="flex gap-1">
          <button type="button" className="bk-icon-btn disabled:opacity-30" disabled={!canGoBack}
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))} aria-label={t('booking.flow.previous_month')}>
            <ChevronLeftIcon className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button type="button" className="bk-icon-btn"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))} aria-label={t('booking.flow.next_month')}>
            <ChevronRightIcon className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <div className="bk-cal-grid">
        {weekDays.map((d, i) => <div key={i} className="bk-weekday capitalize">{d}</div>)}
        {days.map((date) => {
          if (!isSameMonth(date, currentMonth)) return <span key={date.toISOString()} />;
          const ok = isDateAvailable(date);
          const selected = !!selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!ok}
              aria-pressed={selected}
              aria-label={format(date, 'EEEE d MMMM', { locale: loc })}
              onClick={() => onSelectDate(date)}
              className={`bk-day${ok ? ' is-available' : ''}${isToday(date) ? ' is-today' : ''}`}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModernCalendar;
