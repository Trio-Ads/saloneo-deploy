import { useMemo } from 'react';
import { Appointment } from '../../appointments/types';
import { Service } from '../../services/types';
import { Client } from '../../clients/types';
import { AppointmentWithPrice } from '../types';

export const useEnrichedAppointments = (
  appointments: Appointment[],
  services: Service[],
  clients: Client[] = []
): AppointmentWithPrice[] => {
  return useMemo(() => {
    return appointments.map(appointment => {
      const service = services.find(s => s.id === appointment.serviceId);
      const client = clients.find(c => c.id === appointment.clientId);
      
      return {
        ...appointment,
        price: service?.price || 0,
        service,
        clientInfo: client ? {
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone || ''
        } : appointment.clientInfo
      };
    });
  }, [appointments, services, clients]);
};
