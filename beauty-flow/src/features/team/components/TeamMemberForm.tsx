import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import clsx from 'clsx';
import { TeamMemberFormData } from '../types';
import { TEAM_ROLES } from '../store';
import { useServiceStore } from '../../services/store';
import { Panel, IconButton } from '../../../components/ui';
import { StaffAvatar } from '../StaffAvatar';
import { ImageOptimizer } from '../../../services/imageOptimizer';
import { fileService } from '../../../services/fileService';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { getDateLocale } from '../../appointments/utils';

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

const Section: React.FC<{ title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="grid gap-4 px-5 py-6 md:grid-cols-3 md:gap-8">
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
    <div className="md:col-span-2">{children}</div>
  </div>
);

interface TeamMemberFormProps {
  initialData?: TeamMemberFormData;
  onSubmit: (data: TeamMemberFormData) => void;
  onCancel: () => void;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { t, i18n } = useTranslation('team');
  const services = useServiceStore((state) => state.services);
  const [defaultCountry, setDefaultCountry] = React.useState<string>('DZ');
  const [formData, setFormData] = React.useState<TeamMemberFormData>(
    initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: TEAM_ROLES[0],
      specialties: [],
      workingHours: {
        monday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        tuesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        wednesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        thursday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        friday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        saturday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        sunday: { isWorking: false }
      },
      isActive: true
    }
  );

  // Détecter le pays basé sur l'IP de l'utilisateur
  React.useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          setDefaultCountry(data.country_code);
        }
      } catch (error) {
        console.log('Impossible de détecter le pays, utilisation de DZ par défaut');
      }
    };
    detectCountry();
  }, []);

  // Photo: centered square crop to 600×600 JPEG in the browser, uploaded at once, saved to `avatar` with the form
  // ponytail: a replaced/abandoned photo stays in storage; clean up when storage cost matters
  const photoInput = React.useRef<HTMLInputElement>(null);
  const [photoState, setPhotoState] = React.useState<'idle' | 'uploading' | 'error'>('idle');
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setPhotoState('error'); return; }
    setPhotoState('uploading');
    try {
      const { blob } = await ImageOptimizer.resizeToExactDimensions(file, { width: 600, height: 600 }, 0.88, 'image/jpeg');
      const url = await fileService.uploadImage(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }), 'team');
      setFormData((prev) => ({ ...prev, avatar: url }));
      setPhotoState('idle');
    } catch {
      setPhotoState('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Append on check so the selection order (= display priority) is kept.
  const toggleSpecialty = (serviceId: string) => {
    setFormData((prev) => {
      const specialties = prev.specialties.includes(serviceId)
        ? prev.specialties.filter((id) => id !== serviceId)
        : [...prev.specialties, serviceId];
      return { ...prev, specialties, services: specialties }; // services: backend compatibility
    });
  };

  const setBreaks = (day: string, breaks: { start: string; end: string }[]) =>
    setFormData((prev) => ({ ...prev, workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], breaks } } }));

  const [absence, setAbsence] = React.useState({ from: '', to: '', start: '', end: '', reason: '' });
  // A time window needs both ends, in order; no times = whole days
  const absenceTimesInvalid = !!(absence.start || absence.end) && !(absence.start && absence.end && absence.start < absence.end);
  const absences = formData.absences ?? [];
  const addAbsence = () => {
    if (!absence.from || absenceTimesInvalid) return;
    const to = absence.to && absence.to >= absence.from ? absence.to : absence.from;
    setFormData((prev) => ({
      ...prev,
      absences: [...(prev.absences ?? []), {
        from: absence.from,
        to,
        ...(absence.start ? { start: absence.start, end: absence.end } : {}),
        ...(absence.reason.trim() ? { reason: absence.reason.trim() } : {}),
      }]
        .sort((a, b) => a.from.localeCompare(b.from)),
    }));
    setAbsence({ from: '', to: '', start: '', end: '', reason: '' });
  };
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayLabel = (key: string) => format(parseISO(key), 'EEE d MMM yyyy', { locale: getDateLocale(i18n.language) });

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  // The Algerian work week: Saturday first (same order as the salon hours)
  const daysOfWeek = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    .map((key) => ({ key, label: t(`team_member_form.working_days.${key}`) }));

  return (
    <form onSubmit={handleSubmit}>
      <Panel flush bodyClassName="divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-5 py-5">
          <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-50">
            {initialData ? t('team_member_form.title_edit') : t('team_member_form.title_new')}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t('team_member_form.subtitle')}</p>
        </div>

        <Section title={t('team_member_form.sections.personal_info')}>
          <div className="mb-5 flex items-center gap-4">
            <StaffAvatar member={formData} className="size-20 text-xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-secondary" onClick={() => photoInput.current?.click()} disabled={photoState === 'uploading'}>
                  {photoState === 'uploading' && <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />}
                  {t(formData.avatar ? 'team_member_form.photo.change' : 'team_member_form.photo.add')}
                </button>
                {formData.avatar && (
                  <button type="button" className="btn-ghost" onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))} disabled={photoState === 'uploading'}>
                    {t('team_member_form.photo.remove')}
                  </button>
                )}
              </div>
              <p className={photoState === 'error' ? 'mt-1.5 text-xs text-red-600 dark:text-red-400' : 'mt-1.5 text-xs text-gray-500 dark:text-gray-400'} role={photoState === 'error' ? 'alert' : undefined}>
                {t(photoState === 'error' ? 'team_member_form.photo.error' : photoState === 'uploading' ? 'team_member_form.photo.uploading' : 'team_member_form.photo.help')}
              </p>
              <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto}
                aria-label={t('team_member_form.photo.add')} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelClass}>{t('team_member_form.labels.first_name_required')}</label>
              <input type="text" id="firstName" name="firstName" autoComplete="off" value={formData.firstName} onChange={handleChange} required className="field" placeholder={t('team_member_form.placeholders.first_name')} />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>{t('team_member_form.labels.last_name_required')}</label>
              <input type="text" id="lastName" name="lastName" autoComplete="off" value={formData.lastName} onChange={handleChange} required className="field" placeholder={t('team_member_form.placeholders.last_name')} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>{t('team_member_form.labels.email_required')}</label>
              <input type="email" id="email" name="email" autoComplete="off" value={formData.email} onChange={handleChange} required className="field" placeholder={t('team_member_form.placeholders.email_example')} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>{t('team_member_form.labels.phone_required')}</label>
              <PhoneInput
                id="phone"
                international
                defaultCountry={defaultCountry as any}
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                className="field flex items-center gap-2 focus-within:border-orange-500 focus-within:ring-[3px] focus-within:ring-orange-500/15"
                numberInputProps={{
                  className: 'min-w-0 flex-1 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100',
                  required: true
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="role" className={labelClass}>{t('team_member_form.labels.role_required')}</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} required className="field">
                {TEAM_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`role_values.${role}`, role)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        <Section title={t('team_member_form.sections.specialties')} description={`${t('team_member_form.help_messages.specialties_help')} ${t('team_member_form.help_messages.order_help')}`}>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('team_member_form.help_messages.no_services')}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((service) => {
                const checked = formData.specialties.includes(service.id);
                return (
                  <label
                    key={service.id}
                    className={clsx(
                      'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors duration-150 ease-out',
                      checked
                        ? 'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-100'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSpecialty(service.id)}
                      className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="min-w-0 truncate">{service.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </Section>

        <Section title={t('team_member_form.sections.working_hours')} description={t('team_member_form.help_messages.hours_help')}>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {daysOfWeek.map(({ key, label }) => {
              const daySchedule = formData.workingHours[key];
              const breaks = daySchedule?.breaks ?? [];
              return (
                <div key={key} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <label htmlFor={`${key}-working`} className="flex w-36 cursor-pointer items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      id={`${key}-working`}
                      checked={daySchedule?.isWorking || false}
                      onChange={(e) => handleWorkingHoursChange(key, 'isWorking', e.target.checked)}
                      className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    {label}
                  </label>

                  {daySchedule?.isWorking ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        aria-label={`${label} ${t('team_member_form.schedule_labels.from')}`}
                        value={daySchedule.start || '09:00'}
                        onChange={(e) => handleWorkingHoursChange(key, 'start', e.target.value)}
                        className="field w-[7.5rem] py-2 tabular-nums"
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="time"
                        aria-label={`${label} ${t('team_member_form.schedule_labels.to')}`}
                        value={daySchedule.end || '18:00'}
                        onChange={(e) => handleWorkingHoursChange(key, 'end', e.target.value)}
                        className="field w-[7.5rem] py-2 tabular-nums"
                      />
                      <button type="button" onClick={() => setBreaks(key, [...breaks, { start: '12:30', end: '13:30' }])}
                        className="inline-flex min-h-[40px] items-center gap-1 px-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                        <PlusIcon className="size-4" />
                        {t('team_member_form.schedule_labels.add_break')}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">{t('schedule.day_off')}</span>
                  )}
                </div>
                {daySchedule?.isWorking && breaks.map((b, i) => (
                  <div key={i} className="mt-2 flex flex-wrap items-center gap-2 sm:ps-40">
                    <span className="w-full text-sm text-gray-500 sm:w-12 dark:text-gray-400">{t('team_member_form.schedule_labels.break')}</span>
                    <input type="time" aria-label={`${label} ${t('team_member_form.schedule_labels.break')} ${t('team_member_form.schedule_labels.from')}`} value={b.start}
                      onChange={(e) => setBreaks(key, breaks.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))}
                      className="field w-[7rem] py-2 tabular-nums sm:w-[7.5rem]" />
                    <span className="text-gray-400">–</span>
                    <input type="time" aria-label={`${label} ${t('team_member_form.schedule_labels.break')} ${t('team_member_form.schedule_labels.to')}`} value={b.end}
                      onChange={(e) => setBreaks(key, breaks.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))}
                      className="field w-[7rem] py-2 tabular-nums sm:w-[7.5rem]" />
                    <IconButton label={t('team_member_form.schedule_labels.remove_break')} tone="danger" onClick={() => setBreaks(key, breaks.filter((_, j) => j !== i))}>
                      <XMarkIcon className="size-4" />
                    </IconButton>
                  </div>
                ))}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title={t('team_member_form.sections.absences')} description={t('team_member_form.help_messages.absences_help')}>
          {absences.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('team_member_form.absences.none')}</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {absences.map((a, i) => (
                <li key={`${a.from}-${i}`} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium tabular-nums text-gray-900 first-letter:uppercase dark:text-gray-50">
                      {a.from === a.to ? dayLabel(a.from) : `${dayLabel(a.from)} – ${dayLabel(a.to)}`}
                      {a.start && <span className="font-normal text-gray-500 dark:text-gray-400"> · {a.start}–{a.end}</span>}
                    </p>
                    {a.reason && <p className="truncate text-gray-500 dark:text-gray-400">{a.reason}</p>}
                  </div>
                  <IconButton label={t('team_member_form.absences.remove')} tone="danger"
                    onClick={() => setFormData((prev) => ({ ...prev, absences: absences.filter((_, j) => j !== i) }))}>
                    <XMarkIcon className="size-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 dark:border-gray-800">
            <div>
              <label htmlFor="absenceFrom" className={labelClass}>{t('team_member_form.absences.from')}</label>
              <input type="date" id="absenceFrom" min={today} value={absence.from} className="field"
                onChange={(e) => setAbsence((x) => ({ ...x, from: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="absenceTo" className={labelClass}>{t('team_member_form.absences.to')}</label>
              <input type="date" id="absenceTo" min={absence.from || today} value={absence.to} className="field"
                onChange={(e) => setAbsence((x) => ({ ...x, to: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <p className={labelClass}>{t('team_member_form.absences.hours')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <input type="time" aria-label={t('team_member_form.absences.start')} value={absence.start}
                  onChange={(e) => setAbsence((x) => ({ ...x, start: e.target.value }))} className="field w-[7rem] py-2 tabular-nums sm:w-[7.5rem]" />
                <span className="text-gray-400">–</span>
                <input type="time" aria-label={t('team_member_form.absences.end')} value={absence.end}
                  onChange={(e) => setAbsence((x) => ({ ...x, end: e.target.value }))} className="field w-[7rem] py-2 tabular-nums sm:w-[7.5rem]" />
              </div>
              <p className={absenceTimesInvalid ? 'mt-1.5 text-xs text-red-600 dark:text-red-400' : 'mt-1.5 text-xs text-gray-500 dark:text-gray-400'}>
                {t(absenceTimesInvalid ? 'team_member_form.absences.hours_invalid' : 'team_member_form.absences.hours_help')}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="absenceReason" className={labelClass}>{t('team_member_form.absences.reason')}</label>
              <div className="flex gap-2">
                <input type="text" id="absenceReason" maxLength={120} value={absence.reason} className="field min-w-0 flex-1"
                  placeholder={t('team_member_form.absences.reason_placeholder')}
                  onChange={(e) => setAbsence((x) => ({ ...x, reason: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAbsence(); } }} />
                <button type="button" onClick={addAbsence} disabled={!absence.from || absenceTimesInvalid} className="btn-secondary shrink-0">
                  <PlusIcon className="size-4" />
                  {t('team_member_form.absences.add')}
                </button>
              </div>
            </div>
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            {t('team_member_form.buttons.cancel')}
          </button>
          <button type="submit" className="btn-primary">
            {initialData ? t('team_member_form.buttons.modify') : t('team_member_form.buttons.add')}
          </button>
        </div>
      </Panel>
    </form>
  );
};

export default TeamMemberForm;
