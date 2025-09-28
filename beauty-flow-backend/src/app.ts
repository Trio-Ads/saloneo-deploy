import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer } from 'http';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { initializeSocket } from './config/socket';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/clients.routes';
import serviceRoutes from './routes/services.routes';
import appointmentRoutes from './routes/appointments.routes';
import teamRoutes from './routes/team.routes';
import profileRoutes from './routes/profile.routes';
import uploadRoutes from './routes/upload.routes';
import publicRoutes from './routes/public.routes';
import productRoutes from './routes/products.routes';
import paymentRoutes from './routes/payment.routes';
import subscriptionRoutes from './routes/subscription.routes';
import marketingRoutes from './routes/marketing.routes';
import affiliationRoutes from './routes/affiliation.routes';
import emailRoutes from './routes/email.routes';
import { emailService } from './services/emailService';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.io
export const io = initializeSocket(httpServer);

// Connect to MongoDB
connectDatabase();

// Initialize email service
emailService.initialize().catch(err => {
  logger.error('Failed to initialize email service:', err);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour permettre les styles et scripts
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // En développement, être plus permissif
    if (isDevelopment) {
      // Autoriser tous les localhost et 127.0.0.1
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Configuration différente selon l'environnement
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isDevelopment ? '60000' : '900000')), // 1 min en dev, 15 min en prod
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDevelopment ? '1000' : '2000')), // 1000 en dev, 2000 en prod (augmenté de 100 à 2000)
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: isDevelopment ? '1 minute' : '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting pour certaines routes en développement
  skip: (req) => {
    if (isDevelopment) {
      // Skip pour les routes de santé et les assets statiques
      return req.path === '/health' || req.path.startsWith('/uploads/');
    }
    return false;
  }
});

// Apply rate limiting to all routes sauf en développement local
if (!isDevelopment || process.env.ENABLE_RATE_LIMIT === 'true') {
  app.use('/api/', limiter);
  logger.info(`🛡️  Rate limiting enabled: ${isDevelopment ? '1000 req/min' : '2000 req/15min (133 req/min)'}`);
} else {
  logger.warn('⚠️  Rate limiting DISABLED for development');
}

// Serve static files (uploads) with CORS headers
app.use('/uploads', (_req, res, next) => {
  // Add CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/affiliation', affiliationRoutes);
app.use('/api/email', emailRoutes);

// Public routes (no authentication required)
app.use('/api/public', publicRoutes);
app.use('/api/marketing', marketingRoutes);

// Serve static files from React build (production only)
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  
  // Configuration pour servir les fichiers statiques avec les bons headers
  app.use(express.static(publicPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Définir les types MIME corrects
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      } else if (path.endsWith('.woff') || path.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2');
      }
      // Permettre le cache et CORS pour les assets
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));
  
  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req: Request, res: Response) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
      res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
      return;
    }
    
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // 404 handler for development
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    res.status(400).json({
      error: 'Validation Error',
      messages: errors,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(400).json({
      error: 'Duplicate Entry',
      message: `${field} already exists`,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid Token',
      message: 'Please authenticate',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token Expired',
      message: 'Please authenticate again',
    });
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 
      ? 'Something went wrong' 
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://${HOST}:${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.info(`🔌 WebSocket server is ready`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

export default app;
