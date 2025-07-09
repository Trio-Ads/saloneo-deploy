const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware de base
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Fonction pour vérifier et générer le frontend si nécessaire
const ensureFrontendExists = async () => {
  const frontendPath = path.join(__dirname, 'beauty-flow/dist');
  const indexPath = path.join(frontendPath, 'index.html');
  const fs = require('fs');

  console.log('🔍 Vérification du frontend...');
  console.log('📁 Chemin frontend:', frontendPath);
  
  // Vérifier si le dossier dist existe
  if (!fs.existsSync(frontendPath)) {
    console.log('📁 Création du dossier dist...');
    fs.mkdirSync(frontendPath, { recursive: true });
  }

  // Vérifier si index.html existe
  if (!fs.existsSync(indexPath)) {
    console.log('❌ Frontend non trouvé - Génération automatique...');
    
    try {
      const frontendDir = path.join(__dirname, 'beauty-flow');
      
      console.log('📦 Installation des dépendances frontend (avec devDependencies)...');
      execSync('npm install --include=dev', { 
        cwd: frontendDir, 
        stdio: 'inherit',
        timeout: 300000 // 5 minutes
      });
      
      console.log('🏗️  Build du frontend avec npx...');
      execSync('npx vite build', { 
        cwd: frontendDir, 
        stdio: 'inherit',
        timeout: 300000 // 5 minutes
      });
      
      // Vérifier que le build a réussi
      if (fs.existsSync(indexPath)) {
        console.log('✅ Frontend généré avec succès !');
        console.log('📄 index.html trouvé à:', indexPath);
      } else {
        throw new Error('Le build n\'a pas généré index.html');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération du frontend:', error.message);
      
      // Créer un index.html de fallback
      const fallbackHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saloneo - En cours de déploiement</title>
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
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
            max-width: 600px;
        }
        .status { 
            background: rgba(255,255,255,0.2); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
        }
        .error { 
            background: rgba(255,0,0,0.2); 
            color: #ffcccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>💄 SALONEO</h1>
        <p>Plateforme de gestion pour salons de beauté</p>
        
        <div class="status error">
            <h3>⚠️ Frontend en cours de génération</h3>
            <p>Le frontend n'a pas pu être généré automatiquement.</p>
            <p>Veuillez patienter pendant que nous résolvons ce problème.</p>
        </div>
        
        <div class="status">
            <h3>📊 État du serveur</h3>
            <p>✅ Serveur backend: Actif</p>
            <p>✅ Port: ${PORT}</p>
            <p>✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'En cours...'}</p>
            <p>⚠️ Frontend: En génération</p>
        </div>
        
        <p><small>Timestamp: ${new Date().toISOString()}</small></p>
        <p><small>Environment: ${process.env.NODE_ENV || 'development'}</small></p>
    </div>
    
    <script>
        // Recharger la page toutes les 30 secondes pour vérifier si le frontend est prêt
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>`;
      
      fs.writeFileSync(indexPath, fallbackHtml);
      console.log('📄 Page de fallback créée');
    }
  } else {
    console.log('✅ Frontend trouvé:', indexPath);
  }
};

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
  const frontendPath = path.join(__dirname, 'beauty-flow/dist');
  const indexPath = path.join(frontendPath, 'index.html');
  const fs = require('fs');
  
  res.json({ 
    status: 'OK', 
    message: 'Serveur Saloneo fonctionnel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    frontend: fs.existsSync(indexPath) ? 'ready' : 'missing'
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

// Tentative de montage du backend avec ts-node
try {
  // Configurer ts-node pour l'environnement de production
  require('ts-node').register({
    project: path.join(__dirname, 'beauty-flow-backend/tsconfig.json'),
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs'
    }
  });

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

  // Importer les routes du backend directement depuis les sources TypeScript
  const routes = {
    auth: safeRequire('./beauty-flow-backend/src/routes/auth.routes.ts'),
    clients: safeRequire('./beauty-flow-backend/src/routes/clients.routes.ts'),
    services: safeRequire('./beauty-flow-backend/src/routes/services.routes.ts'),
    appointments: safeRequire('./beauty-flow-backend/src/routes/appointments.routes.ts'),
    team: safeRequire('./beauty-flow-backend/src/routes/team.routes.ts'),
    profile: safeRequire('./beauty-flow-backend/src/routes/profile.routes.ts'),
    public: safeRequire('./beauty-flow-backend/src/routes/public.routes.ts'),
    payment: safeRequire('./beauty-flow-backend/src/routes/payment.routes.ts'),
    subscription: safeRequire('./beauty-flow-backend/src/routes/subscription.routes.ts'),
    marketing: safeRequire('./beauty-flow-backend/src/routes/marketing.routes.ts'),
    affiliation: safeRequire('./beauty-flow-backend/src/routes/affiliation.routes.ts'),
    upload: safeRequire('./beauty-flow-backend/src/routes/upload.routes.ts'),
    products: safeRequire('./beauty-flow-backend/src/routes/products.routes.ts')
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
  const fallbackRoutes = ['auth', 'clients', 'services', 'appointments', 'team', 'profile', 'public', 'payment', 'subscription', 'marketing', 'affiliation', 'upload', 'products', 'serviceDeposit'];
  
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
const frontendPath = path.join(__dirname, 'beauty-flow/dist');
const fs = require('fs');

console.log('📁 Frontend servi depuis:', frontendPath);
app.use(express.static(frontendPath));

// Route catch-all pour React Router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('📄 Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  } else {
    console.log('⚠️  index.html not found at:', indexPath);
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
          <p><small>Frontend path: ${frontendPath}</small></p>
        </div>
      </body>
      </html>
    `);
  }
});

// Démarrage du serveur
const startServer = async () => {
  console.log('🚀 Démarrage de Saloneo...');
  
  // 1. Vérifier et générer le frontend si nécessaire
  await ensureFrontendExists();
  
  // 2. Connecter à MongoDB
  await connectDB();
  
  // 3. Démarrer le serveur
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
