const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Routes API simples pour tester
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur Saloneo fonctionnel' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Test réussie',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'beauty-flow/dist')));

// Route catch-all pour le frontend React
app.get('*', (req, res) => {
  // Vérifier si le fichier dist existe
  const indexPath = path.join(__dirname, 'beauty-flow/dist/index.html');
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
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          .logo { font-size: 2em; color: #e91e63; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">💄 SALONEO</div>
          <h1>Déploiement en cours...</h1>
          <p>L'application sera bientôt disponible !</p>
          <p><a href="/api/health">Tester l'API</a></p>
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
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);
