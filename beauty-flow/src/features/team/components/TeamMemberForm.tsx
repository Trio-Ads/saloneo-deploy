import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import clsx from 'clsx';
import { TeamMemberFormData } from '../types';
import { TEAM_ROLES } from '../store';
import { useServiceStore } from '../../services/store';
import { Panel } from '../../../components/ui';

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
  const { t } = useTranslation('team');
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

  const daysOfWeek = [
    { key: 'monday', label: t('team_member_form.working_days.monday') },
    { key: 'tuesday', label: t('team_member_form.working_days.tuesday') },
    { key: 'wednesday', label: t('team_member_form.working_days.wednesday') },
    { key: 'thursday', label: t('team_member_form.working_days.thursday') },
    { key: 'friday', label: t('team_member_form.working_days.friday') },
    { key: 'saturday', label: t('team_member_form.working_days.saturday') },
    { key: 'sunday', label: t('team_member_form.working_days.sunday') }
  ];

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
                    {role}
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

        <Section title={t('team_member_form.sections.working_hours')}>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {daysOfWeek.map(({ key, label }) => {
              const daySchedule = formData.workingHours[key];
              return (
                <div key={key} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 first:pt-0 last:pb-0">
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
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">{t('schedule.day_off')}</span>
                  )}
                </div>
              );
            })}
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
