import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addMinutes, format } from 'date-fns';
import { CalendarDaysIcon, CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { dateLocale } from './bookingTheme';

export interface BookingConfirmationInfo {
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  duration?: number;
  serviceName: string;
  stylistName?: string;
  priceLabel?: string;
  salonName?: string;
  address?: string;
  modificationUrl: string;
}

const icsText = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/** Client-side .ics so the client can drop the appointment in their own calendar. */
function downloadIcs(info: BookingConfirmationInfo) {
  const start = new Date(`${info.date}T${info.time}`);
  const end = addMinutes(start, info.duration || 60);
  const stamp = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Saloneo//Booking//FR', 'BEGIN:VEVENT',
    `UID:${info.modificationUrl.split('/').pop()}@saloneo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${icsText([info.serviceName, info.salonName].filter(Boolean).join(' · '))}`,
    info.address ? `LOCATION:${icsText(info.address)}` : '',
    `URL:${info.modificationUrl}`,
    `DESCRIPTION:${icsText(info.modificationUrl)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'rendez-vous.ics' });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Step 3 body. Rendered inside the booking sheet (`.bk` root). */
export function BookingConfirmation({ bookingInfo }: { bookingInfo: BookingConfirmationInfo }) {
  const { t, i18n } = useTranslation('public');
  const [copied, setCopied] = useState(false);
  const day = new Date(`${bookingInfo.date}T00:00`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingInfo.modificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (non-HTTPS): the link stays selectable below
    }
  };

  return (
    <div className="space-y-5">
      <div className="bk-card">
        <div className="bk-card-head">
          <p className="text-sm opacity-80 first-letter:uppercase">
            {format(day, 'EEEE d MMMM yyyy', { locale: dateLocale(i18n.language) })}
          </p>
          <p className="bk-num text-4xl font-semibold leading-tight mt-1" style={{ fontFamily: 'var(--bk-heading)' }}>
            {bookingInfo.time}
          </p>
        </div>
        <div className="bk-row"><span>{t('booking.summary.service')}</span><span>{bookingInfo.serviceName}</span></div>
        {bookingInfo.stylistName && (
          <div className="bk-row"><span>{t('booking.summary.with')}</span><span>{bookingInfo.stylistName}</span></div>
        )}
        {bookingInfo.priceLabel && (
          <div className="bk-row"><span>{t('booking.summary.price')}</span><span className="bk-num">{bookingInfo.priceLabel}</span></div>
        )}
        {(bookingInfo.salonName || bookingInfo.address) && (
          <div className="bk-row">
            <span>{t('booking.summary.where')}</span>
            <span>{[bookingInfo.salonName, bookingInfo.address].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>

      <button type="button" className="bk-btn-ghost w-full" onClick={() => downloadIcs(bookingInfo)}>
        <CalendarDaysIcon className="h-5 w-5" />
        {t('booking.confirm.add_calendar')}
      </button>

      <div>
        <p className="bk-label">{t('booking.confirm.manage_link')}</p>
        <div className="bk-field flex items-center gap-2 !py-0 !pe-1">
          <span className="flex-1 min-w-0 truncate text-sm select-all">{bookingInfo.modificationUrl}</span>
          <button type="button" className="bk-icon-btn" onClick={copyLink}
            aria-label={copied ? t('booking.confirm.copied') : t('booking.confirm.copy')}>
            {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
          </button>
        </div>
        <p className="bk-muted text-xs mt-2" aria-live="polite">
          {copied ? t('booking.confirm.copied') : t('booking.confirm.manage_hint')}
        </p>
      </div>
    </div>
  );
}
