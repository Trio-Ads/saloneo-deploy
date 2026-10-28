import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { addDays, addMonths, endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import ModernCalendar from './ModernCalendar';
import { dateLocale } from './bookingTheme';
import { availabilityCode, fetchPublicAvailability, PublicAvailability, StaffOption } from '../../appointments/availability';
import WaitlistForm from './WaitlistForm';

interface DateTimeSelectionProps {
  serviceId: string;
  /** Salon slug — availability comes from the server engine (hours, breaks, absences, closures, bookings) */
  slug?: string;
  selectedDate?: string;
  selectedTime?: string;
  /** '' = "peu importe" (any eligible staff; the server assigns one) */
  stylistId?: string;
  showTeamSelection?: boolean;
  /** Modification token when rescheduling: the appointment's own slot does not count as taken */
  token?: string;
  /** Change it to reload the slots (e.g. after a 409 "slot taken") */
  refreshKey?: number;
  onSelect: (date: string, time: string, stylistId: string, stylistName?: string) => void;
}

const PERIODS = [
  { key: 'morning', until: '12:00' },
  { key: 'afternoon', until: '17:00' },
  { key: 'evening', until: '24:00' },
] as const;

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  serviceId,
  slug,
  selectedDate,
  selectedTime,
  stylistId = '',
  showTeamSelection = true,
  token,
  refreshKey = 0,
  onSelect,
}) => {
  const { t, i18n } = useTranslation('public');
  const [stylist, setStylist] = useState(stylistId);
  const [month, setMonth] = useState(() => startOfMonth(selectedDate ? parseISO(selectedDate) : new Date()));
  const [day, setDay] = useState<string | undefined>(selectedDate);
  const [result, setResult] = useState<{ base: string; data: PublicAvailability } | null>(null);
  const [staff, setStaff] = useState<StaffOption[] | null>(null);
  /** false, or the reason the slots could not be loaded ('SERVICE_UNAVAILABLE' when the service is offline) */
  const [failed, setFailed] = useState<false | string>(false);
  const [tick, setTick] = useState(0);
  const [joining, setJoining] = useState(false);
  // Waitlist offer link (?offer=…): its slot may be held for this client only
  const [offer] = useState(() => new URLSearchParams(window.location.search).get('offer') || undefined);
  const slotsRef = useRef<HTMLElement>(null);
  const autoAdvanced = useRef(!!selectedDate);
  const lastStylist = useRef(stylistId);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(month, 'yyyy-MM-dd');
  const from = monthStart > todayKey ? monthStart : todayKey;
  const to = format(endOfMonth(month), 'yyyy-MM-dd');
  const base = [slug, serviceId, stylist, from, to, token, refreshKey, offer].join('|');

  // Slots stay fresh while the sheet is open
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!slug || !serviceId) return;
    let alive = true;
    setFailed(false);
    fetchPublicAvailability(slug, { serviceId, stylistId: stylist, token, offer }, from, to)
      .then((data) => {
        if (!alive) return;
        setResult({ base, data });
        setStaff(data.staff);
      })
      .catch((err) => alive && setFailed(availabilityCode(err) || 'load_error'));
    return () => { alive = false; };
  // base covers every input of the request; tick re-polls it
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, tick]);

  const data = result?.data;
  const loading = !failed && result?.base !== base;
  const days = useMemo(() => new Map((data?.days ?? []).map((d) => [d.date, d])), [data]);
  const availableDates = useMemo(
    () => (data?.days ?? []).filter((d) => d.slots.length > 0).map((d) => parseISO(d.date)),
    [data]
  );
  const horizon = data ? parseISO(data.horizon) : addDays(new Date(), 60);

  // Nothing left this month (e.g. the 30th): open the next month once, before the client has picked anything
  useEffect(() => {
    if (loading || !data || autoAdvanced.current) return;
    autoAdvanced.current = true;
    if (!availableDates.length && endOfMonth(month) < horizon) setMonth((m) => addMonths(m, 1));
  }, [loading, data, availableDates.length, month, horizon]);

  // A salon that does not allow "peu importe" makes the client pick someone
  useEffect(() => {
    if (data && !data.allowAnyStaff && !stylist && data.staff.length) setStylist(data.staff[0].id);
  }, [data, stylist]);

  // Changing staff resets the picked day (not on mount, so going back a step keeps it)
  useEffect(() => {
    if (lastStylist.current === stylist) return;
    lastStylist.current = stylist;
    setDay(undefined);
    onSelect('', '', stylist);
  // onSelect is the parent's setter; only a staff change matters here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stylist]);

  // A slot chosen by the parent after mount (waitlist offer link) opens that day and staff
  useEffect(() => {
    if (stylistId !== lastStylist.current) { lastStylist.current = stylistId; setStylist(stylistId); }
    if (selectedDate && selectedDate !== day) {
      autoAdvanced.current = true;
      setDay(selectedDate);
      setMonth(startOfMonth(parseISO(selectedDate)));
      requestAnimationFrame(() => slotsRef.current?.scrollIntoView({ block: 'nearest' }));
    }
  // day is local state: only a change coming from the parent matters here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stylistId, selectedDate]);

  if (!slug) return <div className="flex justify-center py-8 bk-muted"><span className="bk-spinner" /></div>;

  if (joining && data) {
    return (
      <WaitlistForm
        slug={slug}
        serviceId={serviceId}
        stylistId={stylist}
        staff={staff ?? []}
        allowAnyStaff={data.allowAnyStaff !== false}
        showTeamSelection={showTeamSelection}
        initialDay={day || data.today}
        today={data.today}
        horizon={data.horizon}
        onBack={() => setJoining(false)}
      />
    );
  }

  if (staff && staff.length === 0) {
    return <p className="bk-muted text-sm py-6 text-center">{t('booking.flow.no_stylist')}</p>;
  }

  const nameOf = (id: string) => {
    const m = staff?.find((s) => s.id === id);
    return m ? `${m.firstName} ${m.lastName || ''}`.trim() : undefined;
  };
  const daySlots = day ? days.get(day)?.slots ?? [] : [];
  const groups = PERIODS.map((p, i) => ({
    key: p.key,
    slots: daySlots.filter((s) => s.time < p.until && (i === 0 || s.time >= PERIODS[i - 1].until)),
  })).filter((g) => g.slots.length);
  const allowAny = data?.allowAnyStaff !== false;

  return (
    <div className="space-y-6">
      {showTeamSelection && staff && staff.length > 1 && (
        <section>
          <h3 className="bk-label">{t('booking.flow.with_who')}</h3>
          <div className="bk-scroll-x">
            {allowAny && (
              <button type="button" className="bk-chip" aria-pressed={!stylist} onClick={() => setStylist('')}>
                <span className="bk-avatar"><UserGroupIcon className="h-4 w-4" /></span>
                {t('booking.flow.any_stylist')}
              </button>
            )}
            {staff.map((member) => (
              <button
                key={member.id}
                type="button"
                className="bk-chip"
                aria-pressed={stylist === member.id}
                onClick={() => setStylist(member.id)}
              >
                <span className="bk-avatar">
                  {member.avatar
                    ? <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                    : `${(member.firstName || '?')[0]}${(member.lastName || '')[0] || ''}`.toUpperCase()}
                </span>
                {member.firstName}
              </button>
            ))}
          </div>
        </section>
      )}

      {failed && (
        <div className="bk-notice is-error" role="alert">
          <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
          <span className="flex-1">{failed === 'load_error' ? t('booking.flow.load_error') : t(`errors:availability.${failed}`)}</span>
          {failed === 'load_error' && (
            <button type="button" className="underline underline-offset-2 font-medium" onClick={() => setTick((n) => n + 1)}>
              {t('booking.flow.retry')}
            </button>
          )}
        </div>
      )}

      <section>
        <h3 className="bk-label">{t('booking.flow.choose_date')}</h3>
        <ModernCalendar
          selectedDate={day ? parseISO(day) : undefined}
          month={month}
          onMonthChange={(m) => setMonth(startOfMonth(m))}
          loading={loading}
          onSelectDate={(date) => {
            const key = format(date, 'yyyy-MM-dd');
            if (!days.get(key)?.slots.length) return;
            setDay(key);
            requestAnimationFrame(() => slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
          }}
          availableDates={availableDates}
          minDate={new Date()}
          maxDate={horizon}
          locale={i18n.language}
        />
        {!loading && data && !availableDates.length && (
          <p className="bk-muted text-sm mt-3 text-center">{t('booking.flow.no_slots_month')}</p>
        )}
      </section>

      {day && (
        <section ref={slotsRef} className="scroll-mt-4" aria-busy={loading}>
          <h3 className="bk-label first-letter:uppercase">
            {format(parseISO(day), 'EEEE d MMMM', { locale: dateLocale(i18n.language) })}
          </h3>
          {loading && daySlots.length === 0 ? (
            <div className="flex justify-center py-8 bk-muted"><span className="bk-spinner" /></div>
          ) : daySlots.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium">{t('booking.flow.no_slots_available')}</p>
              <p className="bk-muted text-sm mt-1">{t('booking.flow.choose_another_date')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.key}>
                  <p className="bk-muted text-xs mb-2">{t(`booking.flow.${g.key}`)}</p>
                  <div className="bk-slots">
                    {g.slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        aria-pressed={slot.time === selectedTime && day === selectedDate}
                        onClick={() => onSelect(day, slot.time, stylist, stylist ? nameOf(stylist) : undefined)}
                        className="bk-slot bk-num"
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {data?.waitlist && !token && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4" style={{ borderTop: '1px solid var(--bk-border)' }}>
          <p className="bk-muted text-sm">{t('waitlist.cta.question')}</p>
          <button type="button" className="bk-btn-ghost !min-h-[44px]" onClick={() => setJoining(true)}>
            {t('waitlist.cta.join')}
          </button>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
