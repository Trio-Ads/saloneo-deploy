const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware de base
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connexion MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (mongoURI) {
      await mongoose.connect(mongoURI);
      console.log('✅ MongoDB connecté');
    } else {
      console.log('⚠️  MongoDB URI non configuré');
    }
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
  }
};

// Routes de santé
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

// Tentative de montage du backend
try {
  // Fonction pour importer une route de manière sécurisée
  const safeRequire = (path) => {
    try {
      const module = require(path);
      return module.default || module;
    } catch (err) {
      console.warn(`⚠️  Impossible d'importer ${path}:`, err.message);
      return null;
    }
  };

  // Importer les routes du backend
  const routes = {
    auth: safeRequire('./beauty-flow-backend/dist/routes/auth.routes.js'),
    clients: safeRequire('./beauty-flow-backend/dist/routes/clients.routes.js'),
    services: safeRequire('./beauty-flow-backend/dist/routes/services.routes.js'),
    appointments: safeRequire('./beauty-flow-backend/dist/routes/appointments.routes.js'),
    team: safeRequire('./beauty-flow-backend/dist/routes/team.routes.js'),
    profile: safeRequire('./beauty-flow-backend/dist/routes/profile.routes.js'),
    public: safeRequire('./beauty-flow-backend/dist/routes/public.routes.js'),
    payment: safeRequire('./beauty-flow-backend/dist/routes/payment.routes.js'),
    subscription: safeRequire('./beauty-flow-backend/dist/routes/subscription.routes.js'),
    marketing: safeRequire('./beauty-flow-backend/dist/routes/marketing.routes.js'),
    affiliation: safeRequire('./beauty-flow-backend/dist/routes/affiliation.routes.js')
  };

  // Monter les routes qui ont été importées avec succès
  let mountedRoutes = 0;
  Object.entries(routes).forEach(([name, router]) => {
    if (router && typeof router === 'function') {
      app.use(`/api/${name}`, router);
      mountedRoutes++;
      console.log(`✅ Route /api/${name} montée`);
    } else {
      console.warn(`⚠️  Route ${name} non disponible`);
    }
  });

  if (mountedRoutes > 0) {
    console.log(`✅ ${mountedRoutes} routes API montées avec succès`);
  } else {
    throw new Error('Aucune route n\'a pu être montée');
  }
} catch (error) {
  console.warn('⚠️  Impossible de monter les routes backend:', error.message);
  
  // Routes de fallback plus détaillées
  const fallbackRoutes = ['auth', 'clients', 'services', 'appointments', 'team', 'profile', 'public', 'payment', 'subscription', 'marketing', 'affiliation'];
  
  fallbackRoutes.forEach(route => {
    app.use(`/api/${route}/*`, (req, res) => {
      res.status(503).json({
        error: 'Service Unavailable',
        message: `${route} API is not available. Please try again later.`,
        route: `/api/${route}`,
        timestamp: new Date().toISOString()
      });
    });
  });
  
  // Fallback général
  app.use('/api/*', (req, res) => {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Backend API is not available.'
    });
  });
}

// Servir les uploads
app.use('/uploads', express.static(path.join(__dirname, 'beauty-flow-backend/uploads')));

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, 'beauty-flow-backend/dist/public');
app.use(express.static(frontendPath));

// Route catch-all pour React Router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  const fs = require('fs');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Saloneo - Déploiement</title>
        <style>
          body { 
            font-family: system-ui; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; margin: 0; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
          }
          .container { 
            background: rgba(255,255,255,0.1); padding: 40px; 
            border-radius: 20px; backdrop-filter: blur(10px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>💄 SALONEO</h1>
          <p>Application déployée avec succès !</p>
          <p>Serveur actif sur le port ${PORT}</p>
          <p>MongoDB: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'En cours...'}</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Démarrage du serveur
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Saloneo démarré sur le port ${PORT}`);
    console.log(`📱 URL: http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
});

startServer().catch(console.error);
