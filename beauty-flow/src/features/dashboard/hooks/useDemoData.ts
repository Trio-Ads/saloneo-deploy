import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../appointments/types';
import { Client } from '../../clients/types';
import { Service } from '../../services/types';
import { TeamMember } from '../../team/types';
import { addDays, subDays, startOfMonth, endOfMonth, format, setHours, setMinutes } from 'date-fns';

// Générateur de données de démonstration
export const useDemoData = (enabled: boolean = false) => {
  const [demoAppointments, setDemoAppointments] = useState<Appointment[]>([]);
  const [demoClients, setDemoClients] = useState<Client[]>([]);
  const [demoServices, setDemoServices] = useState<Service[]>([]);
  const [demoTeamMembers, setDemoTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // Générer des services de démonstration
    const services: Service[] = [
      {
        id: 'demo-service-1',
        name: 'Coupe Femme',
        description: 'Coupe personnalisée avec shampoing et brushing',
        duration: 60,
        price: 45,
        category: 'Coiffure',
        isActive: true,
        products: [],
        isOnlineBookingEnabled: true
      },
      {
        id: 'demo-service-2',
        name: 'Coloration',
        description: 'Coloration complète avec soin',
        duration: 120,
        price: 85,
        category: 'Coloration',
        isActive: true,
        products: [],
        isOnlineBookingEnabled: true
      },
      {
        id: 'demo-service-3',
        name: 'Manucure',
        description: 'Soin des mains et pose de vernis',
        duration: 45,
        price: 35,
        category: 'Esthétique',
        isActive: true,
        products: [],
        isOnlineBookingEnabled: true
      },
      {
        id: 'demo-service-4',
        name: 'Soin Visage',
        description: 'Soin complet du visage avec masque',
        duration: 90,
        price: 65,
        category: 'Esthétique',
        isActive: true,
        products: [],
        isOnlineBookingEnabled: true
      },
      {
        id: 'demo-service-5',
        name: 'Massage Relaxant',
        description: 'Massage complet du corps',
        duration: 60,
        price: 70,
        category: 'Spa',
        isActive: true,
        products: [],
        isOnlineBookingEnabled: true
      }
    ];

    // Générer des membres d'équipe
    const teamMembers: TeamMember[] = [
      {
        id: 'demo-team-1',
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 'sophie@demo.com',
        phone: '0601020304',
        role: 'Coiffeuse Senior',
        specialties: ['Coupe', 'Coloration'],
        workingHours: {
          monday: { start: '09:00', end: '18:00', isWorking: true },
          tuesday: { start: '09:00', end: '18:00', isWorking: true },
          wednesday: { start: '09:00', end: '18:00', isWorking: true },
          thursday: { start: '09:00', end: '18:00', isWorking: true },
          friday: { start: '09:00', end: '18:00', isWorking: true },
          saturday: { start: '09:00', end: '14:00', isWorking: true },
          sunday: { isWorking: false }
        },
        isActive: true,
        color: '#FF6B6B'
      },
      {
        id: 'demo-team-2',
        firstName: 'Marie',
        lastName: 'Dubois',
        email: 'marie@demo.com',
        phone: '0605060708',
        role: 'Esthéticienne',
        specialties: ['Soins visage', 'Manucure'],
        workingHours: {
          monday: { start: '10:00', end: '19:00', isWorking: true },
          tuesday: { start: '10:00', end: '19:00', isWorking: true },
          wednesday: { start: '10:00', end: '19:00', isWorking: true },
          thursday: { start: '10:00', end: '19:00', isWorking: true },
          friday: { start: '10:00', end: '19:00', isWorking: true },
          saturday: { start: '10:00', end: '16:00', isWorking: true },
          sunday: { isWorking: false }
        },
        isActive: true,
        color: '#4ECDC4'
      },
      {
        id: 'demo-team-3',
        firstName: 'Lucas',
        lastName: 'Bernard',
        email: 'lucas@demo.com',
        phone: '0609101112',
        role: 'Masseur',
        specialties: ['Massage', 'Spa'],
        workingHours: {
          monday: { start: '11:00', end: '20:00', isWorking: true },
          tuesday: { start: '11:00', end: '20:00', isWorking: true },
          wednesday: { isWorking: false },
          thursday: { start: '11:00', end: '20:00', isWorking: true },
          friday: { start: '11:00', end: '20:00', isWorking: true },
          saturday: { start: '09:00', end: '17:00', isWorking: true },
          sunday: { isWorking: false }
        },
        isActive: true,
        color: '#95E1D3'
      }
    ];

    // Générer des clients
    const clients: Client[] = [
      {
        id: 'demo-client-1',
        firstName: 'Emma',
        lastName: 'Leroy',
        email: 'emma.leroy@demo.com',
        phone: '0612345678',
        birthDate: '1990-05-15',
        address: '123 Rue de la Paix, Paris',
        notes: 'Cliente fidèle, préfère les coupes courtes',
        preferences: {
          favoriteServices: ['demo-service-1', 'demo-service-2'],
          preferredStylists: ['demo-team-1'],
          communicationPreferences: {
            smsReminders: true,
            emailMarketing: true,
            birthdayOffers: true
          }
        },
        loyaltyPoints: 150,
        isActive: true,
        createdAt: subDays(new Date(), 180).toISOString(),
        lastVisit: subDays(new Date(), 7).toISOString()
      },
      {
        id: 'demo-client-2',
        firstName: 'Thomas',
        lastName: 'Petit',
        email: 'thomas.petit@demo.com',
        phone: '0623456789',
        birthDate: '1985-08-22',
        preferences: {
          favoriteServices: ['demo-service-5'],
          preferredStylists: ['demo-team-3'],
          communicationPreferences: {
            smsReminders: true,
            emailMarketing: false,
            birthdayOffers: true
          }
        },
        loyaltyPoints: 80,
        isActive: true,
        createdAt: subDays(new Date(), 90).toISOString(),
        lastVisit: subDays(new Date(), 14).toISOString()
      },
      {
        id: 'demo-client-3',
        firstName: 'Julie',
        lastName: 'Moreau',
        email: 'julie.moreau@demo.com',
        phone: '0634567890',
        birthDate: '1995-03-10',
        preferences: {
          favoriteServices: ['demo-service-3', 'demo-service-4'],
          preferredStylists: ['demo-team-2'],
          communicationPreferences: {
            smsReminders: true,
            emailMarketing: true,
            birthdayOffers: true
          }
        },
        loyaltyPoints: 200,
        isActive: true,
        createdAt: subDays(new Date(), 365).toISOString(),
        lastVisit: subDays(new Date(), 3).toISOString()
      },
      {
        id: 'demo-client-4',
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@demo.com',
        phone: '0645678901',
        preferences: {
          favoriteServices: ['demo-service-1'],
          preferredStylists: ['demo-team-1'],
          communicationPreferences: {
            smsReminders: false,
            emailMarketing: false,
            birthdayOffers: false
          }
        },
        loyaltyPoints: 50,
        isActive: true,
        createdAt: subDays(new Date(), 30).toISOString()
      },
      {
        id: 'demo-client-5',
        firstName: 'Camille',
        lastName: 'Robert',
        email: 'camille.robert@demo.com',
        phone: '0656789012',
        birthDate: '2000-11-28',
        preferences: {
          favoriteServices: ['demo-service-2', 'demo-service-3'],
          preferredStylists: ['demo-team-1', 'demo-team-2'],
          communicationPreferences: {
            smsReminders: true,
            emailMarketing: true,
            birthdayOffers: true
          }
        },
        loyaltyPoints: 120,
        isActive: true,
        createdAt: subDays(new Date(), 60).toISOString(),
        lastVisit: subDays(new Date(), 5).toISOString()
      }
    ];

    // Générer des rendez-vous
    const appointments: Appointment[] = [];
    const statuses: AppointmentStatus[] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'noShow', 'rescheduled'];
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Générer des rendez-vous pour le mois en cours
    for (let i = 0; i < 150; i++) {
      const randomDays = Math.floor(Math.random() * 30) - 15; // -15 à +15 jours
      const appointmentDate = addDays(today, randomDays);
      const randomHour = Math.floor(Math.random() * 9) + 9; // 9h à 18h
      const randomMinute = Math.random() < 0.5 ? 0 : 30; // 0 ou 30 minutes
      
      const service = services[Math.floor(Math.random() * services.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const teamMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      
      // Déterminer le statut en fonction de la date
      let status: AppointmentStatus;
      if (appointmentDate < today) {
        // Rendez-vous passés
        const rand = Math.random();
        if (rand < 0.7) status = 'completed';
        else if (rand < 0.85) status = 'cancelled';
        else if (rand < 0.95) status = 'noShow';
        else status = 'rescheduled';
      } else if (appointmentDate.toDateString() === today.toDateString()) {
        // Rendez-vous d'aujourd'hui
        const rand = Math.random();
        if (rand < 0.3) status = 'completed';
        else if (rand < 0.6) status = 'confirmed';
        else status = 'scheduled';
      } else {
        // Rendez-vous futurs
        const rand = Math.random();
        if (rand < 0.6) status = 'confirmed';
        else if (rand < 0.9) status = 'scheduled';
        else status = 'cancelled';
      }

      const startTime = format(setMinutes(setHours(appointmentDate, randomHour), randomMinute), 'HH:mm');
      const endDateTime = new Date(appointmentDate);
      endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);
      const endTime = format(endDateTime, 'HH:mm');

      appointments.push({
        id: `demo-apt-${i}`,
        clientId: client.id,
        serviceId: service.id,
        serviceName: service.name,
        stylistId: teamMember.id,
        date: format(appointmentDate, 'yyyy-MM-dd'),
        startTime,
        endTime,
        status,
        notes: Math.random() < 0.3 ? 'Rendez-vous de démonstration' : undefined,
        clientInfo: {
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone
        }
      });
    }

    setDemoServices(services);
    setDemoTeamMembers(teamMembers);
    setDemoClients(clients);
    setDemoAppointments(appointments);
  }, [enabled]);

  return {
    appointments: demoAppointments,
    clients: demoClients,
    services: demoServices,
    teamMembers: demoTeamMembers
  };
};
