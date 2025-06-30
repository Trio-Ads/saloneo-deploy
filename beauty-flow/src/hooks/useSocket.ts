import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { socketService } from '../services/socket';

export const useSocket = () => {
  const location = useLocation();

  useEffect(() => {
    // Join the appropriate room based on the current route
    const path = location.pathname;
    
    if (path.includes('/appointments')) {
      socketService.joinRoom('appointments');
    } else if (path.includes('/clients')) {
      socketService.joinRoom('clients');
    } else if (path.includes('/team')) {
      socketService.joinRoom('team');
    }

    // Cleanup: leave all rooms when component unmounts or route changes
    return () => {
      socketService.leaveAllRooms();
    };
  }, [location.pathname]);

  return {
    isConnected: socketService.isConnected(),
    joinRoom: socketService.joinRoom.bind(socketService),
    leaveRoom: socketService.leaveRoom.bind(socketService),
  };
};
