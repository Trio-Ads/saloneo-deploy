import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  SparklesIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { TeamMemberFormData } from '../types';
import { TEAM_ROLES } from '../store';
import { useServiceStore } from '../../services/store';

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

  const handleSpecialtiesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const specialties = selectedOptions.map(option => option.value);
    setFormData((prev) => ({
      ...prev,
      specialties,
      services: specialties // For backend compatibility
    }));
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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {initialData ? t('team_member_form.title_edit') : t('team_member_form.title_new')}
            </h2>
          </div>
          <p className="text-gray-600">{t('team_member_form.subtitle')}</p>
        </div>

        {/* Informations personnelles */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <UserIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('team_member_form.sections.personal_info')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                {t('team_member_form.labels.first_name_required')}
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                placeholder={t('team_member_form.placeholders.first_name')}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                {t('team_member_form.labels.last_name_required')}
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                placeholder={t('team_member_form.placeholders.last_name')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                {t('team_member_form.labels.email_required')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                placeholder={t('team_member_form.placeholders.email_example')}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                {t('team_member_form.labels.phone_required')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                placeholder={t('team_member_form.placeholders.phone_example')}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                <BriefcaseIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                {t('team_member_form.labels.role_required')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
              >
                {TEAM_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Spécialités */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('team_member_form.sections.specialties')}</h3>
          </div>
          
          <div>
            <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-2">
              <StarIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
              {t('form.personal_info.specialties')}
            </label>
            <select
              id="specialties"
              name="specialties"
              value={formData.specialties}
              onChange={handleSpecialtiesChange}
              multiple
              size={6}
              className="glass-input w-full rounded-xl border-0 bg-white/70 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <div className="mt-3 space-y-2">
              <div className="glass-card bg-blue-50/50 p-3 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  💡 {t('team_member_form.help_messages.specialties_help')}
                </p>
              </div>
              <div className="glass-card bg-indigo-50/50 p-3 rounded-lg">
                <p className="text-sm text-indigo-700 font-medium">
                  ⭐ {t('team_member_form.help_messages.order_help')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horaires de travail */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ClockIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('team_member_form.sections.working_hours')}</h3>
          </div>
          
          <div className="space-y-4">
            {daysOfWeek.map(({ key, label }) => {
              const daySchedule = formData.workingHours[key];
              return (
                <div key={key} className="glass-card bg-white/50 p-4 rounded-xl hover:bg-white/70 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${key}-working`}
                        checked={daySchedule?.isWorking || false}
                        onChange={(e) => handleWorkingHoursChange(key, 'isWorking', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`${key}-working`} className="text-sm text-gray-600">
                        {t('team_member_form.schedule_labels.works')}
                      </label>
                    </div>
                    
                    {daySchedule?.isWorking && (
                      <>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">{t('team_member_form.schedule_labels.from')}</label>
                          <input
                            type="time"
                            value={daySchedule.start || '09:00'}
                            onChange={(e) => handleWorkingHoursChange(key, 'start', e.target.value)}
                            className="glass-input rounded-lg border-0 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">{t('team_member_form.schedule_labels.to')}</label>
                          <input
                            type="time"
                            value={daySchedule.end || '18:00'}
                            onChange={(e) => handleWorkingHoursChange(key, 'end', e.target.value)}
                            className="glass-input rounded-lg border-0 bg-white/70 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="glass-button bg-white/70 hover:bg-white/90 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {t('team_member_form.buttons.cancel')}
          </button>
          <button
            type="submit"
            className="glass-button bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {initialData ? t('team_member_form.buttons.modify') : t('team_member_form.buttons.add')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamMemberForm;
