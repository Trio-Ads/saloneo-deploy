const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware basique
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import et montage du backend
try {
  const backendModule = require('./beauty-flow-backend/dist/app.js');
  const backendApp = backendModule.default || backendModule;
  
  // Monter le backend sans démarrer son serveur
  app.use('/', backendApp);
  console.log('✅ Backend API monté avec succès');
} catch (error) {
  console.warn('⚠️  Backend non disponible:', error.message);
  
  // Routes de fallback
  app.use('/api/*', (req, res) => {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Backend API is not available.'
    });
  });
}

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, 'beauty-flow/dist');
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
          <p>Application en cours de déploiement...</p>
          <p>Serveur actif sur le port ${PORT}</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Saloneo démarré sur le port ${PORT}`);
  console.log(`📱 URL: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});
