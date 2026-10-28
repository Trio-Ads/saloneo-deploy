import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Appointment } from '../types';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';
import { useStaffName } from '../../team/staff';
import { useAppointmentStore } from '../store';
import { Panel, Badge, statusTone, IconButton, EmptyState } from '../../../components/ui';
import { getDateLocale, dayKey, sortKey, durationMinutes, statusKey } from '../utils';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
  onComplete: (appointmentId: string) => void;
  onNoShow: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEdit,
  onCancel,
  onComplete,
  onNoShow,
  onConfirm,
}) => {
  const { t, i18n } = useTranslation('appointments');
  const clients = useClientStore((state) => state.clients);
  const services = useServiceStore((state) => state.services);
  const getStylistName = useStaffName();
  const isPastAppointment = useAppointmentStore((state) => state.isPastAppointment);

  const getClientName = (appointment: Appointment) => {
    if (appointment.clientInfo?.firstName) {
      return `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName || ''}`.trim();
    }
    const client = clients.find((c) => c.id === appointment.clientId);
    return client ? `${client.firstName} ${client.lastName}` : t('appointment_form.unknown.client');
  };

  const getServiceName = (appointment: Appointment) =>
    services.find((s) => s.id === appointment.serviceId)?.name || appointment.serviceName || t('appointment_form.unknown.service');

  const formatDay = (day: string) => {
    const date = new Date(`${day}T00:00:00`);
    return isNaN(date.getTime())
      ? t('appointment_list.invalid_date')
      : format(date, 'EEEE d MMMM yyyy', { locale: getDateLocale(i18n.language) });
  };

  const appointmentsByDate = (Array.isArray(appointments) ? appointments : [])
    .filter((a) => a && typeof a.date === 'string' && a.date)
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    .reduce((acc, appointment) => {
      (acc[dayKey(appointment.date)] ||= []).push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);

  if (Object.keys(appointmentsByDate).length === 0) {
    return (
      <Panel>
        <EmptyState icon={CalendarDaysIcon} title={t('appointment_list.no_appointments')} body={t('appointment_list.no_appointments_period')} />
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(appointmentsByDate).map(([date, dayAppointments]) => (
        <Panel
          key={date}
          flush
          title={
            <>
              <span className="inline-block first-letter:uppercase">{formatDay(date)}</span>
              <span className="font-normal text-gray-500 dark:text-gray-400"> · {t('appointment_list.appointments_count', { count: dayAppointments.length })}</span>
            </>
          }
        >
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {dayAppointments.map((appointment, i) => {
              const isOpen = appointment.status === 'scheduled' || appointment.status === 'confirmed';
              const isOverdue = isOpen && isPastAppointment(appointment);
              const duration = durationMinutes(appointment);

              return (
                <li key={appointment.id || `${date}-${i}`} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="w-14 shrink-0">
                      <p className="font-display text-[0.9375rem] font-semibold tabular-nums text-gray-900 dark:text-gray-50">{appointment.startTime}</p>
                      {duration > 0 && <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{duration} min</p>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate font-medium text-gray-900 dark:text-gray-50">{getClientName(appointment)}</p>
                        <Badge tone={statusTone(appointment.status)}>{t(`status.${statusKey(appointment.status)}`, appointment.status)}</Badge>
                        {isOverdue && (
                          <Badge tone="amber">
                            <ExclamationTriangleIcon className="size-3" />
                            {t('appointment_list.past_appointment')}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                        {getServiceName(appointment)} · {t('appointment_list.with', { name: getStylistName(appointment.stylistId) })}
                      </p>
                      {appointment.notes && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{appointment.notes}</p>
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="flex items-center justify-end gap-1 shrink-0">
                      {appointment.status === 'scheduled' && onConfirm ? (
                        <button type="button" onClick={() => onConfirm(appointment.id)} className="btn-secondary me-1" title={t('appointment_list.tooltips.confirm')}>
                          {t('actions.confirm')}
                        </button>
                      ) : (
                        <button type="button" onClick={() => onComplete(appointment.id)} className="btn-secondary me-1" title={t('appointment_list.tooltips.complete')}>
                          {t('actions.complete')}
                        </button>
                      )}
                      {appointment.status === 'scheduled' && onConfirm && (
                        <IconButton label={t('appointment_list.tooltips.complete')} onClick={() => onComplete(appointment.id)}>
                          <CheckIcon className="size-5" />
                        </IconButton>
                      )}
                      <IconButton label={t('appointment_list.tooltips.edit')} onClick={() => onEdit(appointment)}>
                        <PencilIcon className="size-5" />
                      </IconButton>
                      <IconButton label={t('appointment_list.tooltips.no_show')} onClick={() => onNoShow(appointment.id)}>
                        <EyeSlashIcon className="size-5" />
                      </IconButton>
                      <IconButton tone="danger" label={t('appointment_list.tooltips.cancel')} onClick={() => onCancel(appointment.id)}>
                        <XMarkIcon className="size-5" />
                      </IconButton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </div>
  );
};

export default AppointmentList;
