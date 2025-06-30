import { io, Socket } from 'socket.io-client';
import { useAppointmentStore } from '../features/appointments/store';
import { useClientStore } from '../features/clients/store';
import { useTeamStore } from '../features/team/store';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      // Join rooms based on current page
      this.joinCurrentRoom();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Appointment events
    this.socket.on('appointment:created', (appointment: any) => {
      console.log('🔔 Nouveau rendez-vous reçu via WebSocket:', appointment);
      const appointmentsStore = useAppointmentStore.getState();
      // Recharger tous les rendez-vous pour assurer la synchronisation
      appointmentsStore.syncWithBackend();
    });

    this.socket.on('appointment:updated', (appointment: any) => {
      console.log('🔔 Rendez-vous mis à jour via WebSocket:', appointment);
      const appointmentsStore = useAppointmentStore.getState();
      appointmentsStore.syncWithBackend();
    });

    this.socket.on('appointment:statusChanged', (appointment: any) => {
      console.log('🔔 Statut de rendez-vous changé via WebSocket:', appointment);
      const appointmentsStore = useAppointmentStore.getState();
      appointmentsStore.syncWithBackend();
    });

    this.socket.on('appointment:deleted', ({ id }: { id: string }) => {
      console.log('🔔 Rendez-vous supprimé via WebSocket:', id);
      const appointmentsStore = useAppointmentStore.getState();
      appointmentsStore.syncWithBackend();
    });

    // Client events
    this.socket.on('client:created', (client: any) => {
      const clientsStore = useClientStore.getState();
      clientsStore.addClient(client);
    });

    this.socket.on('client:updated', (client: any) => {
      const clientsStore = useClientStore.getState();
      clientsStore.updateClient(client._id, client);
    });

    this.socket.on('client:deleted', ({ id }: { id: string }) => {
      const clientsStore = useClientStore.getState();
      clientsStore.deleteClient(id);
    });

    // Team events
    this.socket.on('team:created', (teamMember: any) => {
      const teamStore = useTeamStore.getState();
      teamStore.addMember(teamMember);
    });

    this.socket.on('team:updated', (teamMember: any) => {
      const teamStore = useTeamStore.getState();
      teamStore.updateMember(teamMember._id, teamMember);
    });

    this.socket.on('team:deleted', ({ id }: { id: string }) => {
      const teamStore = useTeamStore.getState();
      teamStore.deleteMember(id);
    });

    // Notification events
    this.socket.on('notification', (notification: any) => {
      // Handle notifications (can be integrated with a notification system)
      console.log('Received notification:', notification);
    });
  }

  joinRoom(room: 'appointments' | 'clients' | 'team') {
    if (!this.socket?.connected) return;
    
    // Leave other rooms
    this.leaveAllRooms();
    
    // Join new room
    this.socket.emit(`join:${room}`);
  }

  leaveRoom(room: 'appointments' | 'clients' | 'team') {
    if (!this.socket?.connected) return;
    this.socket.emit(`leave:${room}`);
  }

  leaveAllRooms() {
    if (!this.socket?.connected) return;
    
    ['appointments', 'clients', 'team'].forEach(room => {
      this.socket!.emit(`leave:${room}`);
    });
  }

  private joinCurrentRoom() {
    // This can be called based on the current route
    const path = window.location.pathname;
    
    if (path.includes('/appointments')) {
      this.joinRoom('appointments');
    } else if (path.includes('/clients')) {
      this.joinRoom('clients');
    } else if (path.includes('/team')) {
      this.joinRoom('team');
    }
  }

  disconnect() {
    if (this.socket) {
      this.leaveAllRooms();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
