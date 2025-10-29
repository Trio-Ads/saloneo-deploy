const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);

// Configuration des ports
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 === DÉMARRAGE SERVEUR UNIFIÉ SALONEO ===');
console.log(`📍 Environment: ${NODE_ENV}`);
console.log(`🔌 Port: ${PORT}`);

// Trust proxy pour Render (IMPORTANT pour express-rate-limit)
app.set('trust proxy', 1);

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
  'https://saloneo-app.onrender.com',
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
const backendPath = path.join(__dirname, 'beauty-flow-backend/dist/app.js');
const backendExists = fs.existsSync(backendPath);

if (backendExists) {
  try {
    console.log('🔍 Backend compilé trouvé, tentative d\'intégration...');
    
    // Charger le backend compilé
    const backendApp = require(backendPath);
    
    // Si le backend exporte une app Express, utiliser ses routes
    if (backendApp && backendApp._router) {
      console.log('✅ Backend Express détecté, intégration des routes...');
      
      // Monter toutes les routes du backend
      app.use(backendApp);
      
      console.log('✅ Routes backend intégrées avec succès');
    } else {
      console.log('⚠️ Le backend ne semble pas exporter une app Express valide');
      throw new Error('Backend app invalide');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement du backend:', error.message);
    console.log('📌 Utilisation des routes API temporaires comme fallback');
    
    // Routes temporaires en cas d'échec
    setupTemporaryRoutes();
  }
} else {
  console.log('⚠️ Backend non compilé, utilisation des routes temporaires');
  console.log(`📍 Chemin attendu: ${backendPath}`);
  
  // Routes temporaires si le backend n'est pas compilé
  setupTemporaryRoutes();
}

// Fonction pour configurer les routes temporaires
function setupTemporaryRoutes() {
  // Simuler la connexion à MongoDB
  console.log('🔗 Simulation de connexion à MongoDB...');
  
  // Routes temporaires pour tester
  app.use('/api/auth', (req, res) => {
    res.json({ 
      message: 'Auth endpoint active (temporaire)', 
      method: req.method, 
      path: req.path,
      timestamp: new Date().toISOString()
    });
  });
  
  app.use('/api/public', (req, res) => {
    res.json({ 
      message: 'Public endpoint active (temporaire)', 
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
      mongodb: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
      backend: 'Routes temporaires'
    });
  });
  
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'API endpoint not found', 
      path: req.path,
      message: 'Backend routes temporaires actives',
      availableRoutes: ['/api/auth', '/api/public', '/api/test-db']
    });
  });
  
  console.log('✅ Routes API temporaires configurées');
}

// Serve static files from React build
const frontendPath = path.join(__dirname, 'dist');

console.log(`📁 Chemin frontend: ${frontendPath}`);

// Vérifier si le dossier dist existe
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
  console.log('❌ ERREUR CRITIQUE: Dossier dist non trouvé !');
  console.log('💡 Le build doit être effectué pendant la phase de build de Render');
  console.log('📝 Vérifiez que build-and-deploy.sh copie bien le dossier dist à la racine');
  
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
        <title>Saloneo - Build manquant</title>
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
          h1 { margin-bottom: 20px; }
          .error-details {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>💄 SALONEO - Erreur de déploiement</h1>
          <p>Le dossier de build frontend n'a pas été trouvé.</p>
          <div class="error-details">
            <p><strong>Problème:</strong> Le dossier /dist est manquant</p>
            <p><strong>Solution:</strong> Le build doit être fait pendant la phase de build de Render</p>
            <p><strong>Script:</strong> build-and-deploy.sh doit copier le dossier dist à la racine</p>
          </div>
        </div>
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
  
  // Vérification finale du build
  if (fs.existsSync(frontendPath)) {
    console.log('✅ Frontend disponible dans:', frontendPath);
    const files = fs.readdirSync(frontendPath);
    console.log(`📦 Fichiers dans dist: ${files.length} fichiers`);
    console.log(`📄 Fichiers principaux: ${files.filter(f => f.endsWith('.html') || f.endsWith('.js')).join(', ')}`);
  } else {
    console.log('⚠️ ATTENTION: Frontend non disponible !');
    console.log('🔧 Vérifiez le processus de build');
  }
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
