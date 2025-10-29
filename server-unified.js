const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');

const app = express();
const httpServer = createServer(app);

// Configuration des ports
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 === DÉMARRAGE SERVEUR UNIFIÉ SALONEO ===');
console.log(`📍 Environment: ${NODE_ENV}`);
console.log(`🔌 Port: ${PORT}`);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour permettre les assets
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://saloneo-deploy.onrender.com',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // En production, être plus strict
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(null, true); // Temporairement permissif pour debug
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    frontend: 'Integrated',
    backend: 'Active'
  });
});

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import et utilisation des routes backend
try {
  // Simuler la connexion à MongoDB
  console.log('🔗 Connexion à MongoDB...');
  
  // Import des routes backend (simulation pour l'instant)
  // TODO: Intégrer les vraies routes quand le backend sera compilé
  
  // Routes temporaires pour tester
  app.use('/api/auth', (req, res) => {
    res.json({ 
      message: 'Auth endpoint active', 
      method: req.method, 
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });
  
  app.use('/api/public', (req, res) => {
    res.json({ 
      message: 'Public endpoint active', 
      method: req.method, 
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });
  
  // Route pour tester la base de données
  app.get('/api/test-db', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Database connection test',
      mongodb: process.env.MONGODB_URI ? 'Configured' : 'Not configured'
    });
  });
  
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'API endpoint not found', 
      path: req.path,
      message: 'Backend routes will be integrated after TypeScript compilation',
      availableRoutes: ['/api/auth', '/api/public', '/api/test-db']
    });
  });
  
  console.log('✅ Routes API temporaires configurées');
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes:', error.message);
}

// Serve static files from React build
const frontendPath = path.join(__dirname, 'dist');
console.log(`📁 Chemin frontend: ${frontendPath}`);

// Vérifier si le dossier dist existe
const fs = require('fs');
if (fs.existsSync(frontendPath)) {
  console.log('✅ Dossier dist trouvé');
  
  // Servir les fichiers statiques
  app.use(express.static(frontendPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
  
  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    // Skip API routes and uploads
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
      return res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    }
    
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Saloneo - Erreur de déploiement</title>
          <style>
            body { 
              font-family: system-ui; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5;
            }
            .error { 
              background: #fff; 
              padding: 40px; 
              border-radius: 10px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 600px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>🚨 Erreur de déploiement</h1>
            <p>Le fichier index.html n'a pas été trouvé.</p>
            <p>Chemin recherché: ${indexPath}</p>
            <p>Le build du frontend n'a pas été correctement effectué.</p>
          </div>
        </body>
        </html>
      `);
    }
  });
} else {
  console.log('❌ Dossier dist non trouvé');
  
  // Fallback si pas de build frontend
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
      return res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    }
    
    res.status(503).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Saloneo - Build en cours</title>
        <style>
          body { 
            font-family: system-ui; 
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
            background: rgba(255,255,255,0.1); 
            padding: 40px; 
            border-radius: 20px; 
            backdrop-filter: blur(10px);
          }
          .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>💄 SALONEO</h1>
          <div class="spinner"></div>
          <p>Application en cours de déploiement...</p>
          <p>Le frontend n'est pas encore disponible.</p>
          <p><small>Dossier dist manquant: ${frontendPath}</small></p>
        </div>
        <script>
          setTimeout(() => window.location.reload(), 30000);
        </script>
      </body>
      </html>
    `);
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
    message: NODE_ENV === 'production' && statusCode === 500 
      ? 'Something went wrong' 
      : message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Saloneo actif sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Serveur prêt à recevoir des requêtes');
});

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

module.exports = app;
