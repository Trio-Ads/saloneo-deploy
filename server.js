const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid issues with React
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://saloneo.app',
  'https://www.saloneo.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // En production, être plus strict
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // En développement, être plus permissif
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Connexion MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saloneo';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuant sans MongoDB en mode développement...');
    }
  }
};

// Import backend routes
let backendApp = null;
try {
  // Try to import the compiled backend first
  try {
    backendApp = require('./beauty-flow-backend/dist/app.js');
    console.log('✅ Backend loaded from compiled dist');
  } catch (distError) {
    // Fallback to source with ts-node
    require('ts-node/register');
    backendApp = require('./beauty-flow-backend/src/app.ts');
    console.log('✅ Backend loaded from source with ts-node');
  }
} catch (error) {
  console.warn('⚠️  Backend not available:', error.message);
  console.log('🔄 Continuing with frontend-only mode...');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur Saloneo fonctionnel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Saloneo fonctionnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Test réussie',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'beauty-flow-backend/uploads')));

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, 'beauty-flow/dist');
app.use(express.static(frontendPath));

// Route catch-all pour le frontend React
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
    return;
  }

  // Vérifier si le fichier dist existe
  const indexPath = path.join(frontendPath, 'index.html');
  const fs = require('fs');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si pas de build frontend, servir une page simple
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Saloneo - En cours de déploiement</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          .logo { 
            font-size: 3em; 
            margin-bottom: 20px; 
            font-weight: bold;
          }
          .status {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          a {
            color: #fff;
            text-decoration: none;
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin: 10px;
          }
          a:hover {
            background: rgba(255,255,255,0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">💄 SALONEO</div>
          <h1>Déploiement en cours...</h1>
          <p>L'application sera bientôt disponible !</p>
          <div class="status">
            <p><strong>Statut:</strong> Serveur actif</p>
            <p><strong>Environnement:</strong> ${process.env.NODE_ENV}</p>
            <p><strong>MongoDB:</strong> ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'}</p>
          </div>
          <div>
            <a href="/health">Santé du serveur</a>
            <a href="/api/health">Santé de l'API</a>
            <a href="/api/test">Test API</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
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

// Démarrage du serveur
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 MongoDB: ${process.env.MONGODB_URI ? 'Configuré' : 'Local'}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

startServer().catch(console.error);
