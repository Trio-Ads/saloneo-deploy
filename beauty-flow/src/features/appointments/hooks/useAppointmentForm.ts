import { useMemo } from 'react';
import { useClientStore } from '../../clients/store';
import { useServiceStore } from '../../services/store';
import { useTeamStore } from '../../team/store';
import { useAppointmentStore } from '../store';

export const useAppointmentForm = () => {
  const allClients = useClientStore((state) => state.clients);
  const allServices = useServiceStore((state) => state.services);
  const allStylists = useTeamStore((state) => state.members);
  const {
    generateTimeSlots,
    isSlotAvailable,
    getDaySchedule,
    addPreBooking,
    removePreBooking,
    cleanupExpiredPreBookings
  } = useAppointmentStore();

  const clients = useMemo(() => 
    allClients.filter((c) => c.isActive),
    [allClients]
  );

  const services = useMemo(() => 
    allServices,
    [allServices]
  );

  const stylists = useMemo(() => 
    allStylists.filter((m) => m.isActive),
    [allStylists]
  );


  return {
    clients,
    services,
    stylists,
    generateTimeSlots,
    isSlotAvailable,
    getDaySchedule,
    addPreBooking,
    removePreBooking,
    cleanupExpiredPreBookings
  };
};
