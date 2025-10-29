import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { User } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  establishmentId?: string;
}

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId).select('_id establishmentName');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = (user as any)._id.toString();
      socket.establishmentId = (user as any)._id.toString(); // In this case, user is the establishment
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.userId} connected via WebSocket`);

    // Join user's room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join establishment room
    if (socket.establishmentId) {
      socket.join(`establishment:${socket.establishmentId}`);
    }

    // Handle joining specific rooms
    socket.on('join:appointments', () => {
      if (socket.establishmentId) {
        socket.join(`appointments:${socket.establishmentId}`);
        logger.info(`User ${socket.userId} joined appointments room`);
      }
    });

    socket.on('join:clients', () => {
      if (socket.establishmentId) {
        socket.join(`clients:${socket.establishmentId}`);
        logger.info(`User ${socket.userId} joined clients room`);
      }
    });

    socket.on('join:team', () => {
      if (socket.establishmentId) {
        socket.join(`team:${socket.establishmentId}`);
        logger.info(`User ${socket.userId} joined team room`);
      }
    });

    // Handle leaving rooms
    socket.on('leave:appointments', () => {
      if (socket.establishmentId) {
        socket.leave(`appointments:${socket.establishmentId}`);
      }
    });

    socket.on('leave:clients', () => {
      if (socket.establishmentId) {
        socket.leave(`clients:${socket.establishmentId}`);
      }
    });

    socket.on('leave:team', () => {
      if (socket.establishmentId) {
        socket.leave(`team:${socket.establishmentId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Socket event emitters
export const emitAppointmentUpdate = (
  io: SocketServer,
  establishmentId: string,
  event: string,
  data: any
) => {
  io.to(`appointments:${establishmentId}`).emit(event, data);
};

export const emitClientUpdate = (
  io: SocketServer,
  establishmentId: string,
  event: string,
  data: any
) => {
  io.to(`clients:${establishmentId}`).emit(event, data);
};

export const emitTeamUpdate = (
  io: SocketServer,
  establishmentId: string,
  event: string,
  data: any
) => {
  io.to(`team:${establishmentId}`).emit(event, data);
};

export const emitNotification = (
  io: SocketServer,
  userId: string,
  notification: any
) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
