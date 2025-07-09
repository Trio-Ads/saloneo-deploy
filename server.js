const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuration
const BACKEND_DIST_PATH = path.join(__dirname, 'beauty-flow-backend', 'dist');
const FRONTEND_DIST_PATH = path.join(__dirname, 'beauty-flow', 'dist');
const BACKEND_COMPILED_APP = path.join(BACKEND_DIST_PATH, 'app.js');

console.log('🚀 === DÉMARRAGE SERVEUR SALONEO OPTIMISÉ ===');
console.log(`📍 Répertoire de travail: ${__dirname}`);
console.log(`🎯 Port: ${PORT}`);
console.log(`📁 Backend compilé: ${BACKEND_COMPILED_APP}`);
console.log(`📁 Frontend build: ${FRONTEND_DIST_PATH}`);

// Variables globales
let backendApp = null;
let isBackendLoaded = false;
let buildInProgress = false;

// Fonction pour charger le backend compilé
async function loadCompiledBackend() {
  try {
    console.log('🔍 Vérification du backend compilé...');
    
    if (fs.existsSync(BACKEND_COMPILED_APP)) {
      console.log('✅ Backend compilé trouvé, chargement...');
      
      // Nettoyer le cache require
      delete require.cache[require.resolve(BACKEND_COMPILED_APP)];
      
      // Charger le backend
      backendApp = require(BACKEND_COMPILED_APP);
      isBackendLoaded = true;
      
      console.log('🎉 Backend Express chargé avec succès !');
      return true;
    } else {
      console.log('❌ Backend compilé non trouvé:', BACKEND_COMPILED_APP);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement du backend:', error.message);
    return false;
  }
}

// Fonction pour compiler le backend
async function compileBackend() {
  return new Promise((resolve) => {
    console.log('🔨 Compilation du backend TypeScript...');
    
    const tscProcess = spawn('npm', ['run', 'build'], {
      cwd: path.join(__dirname, 'beauty-flow-backend'),
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    tscProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    tscProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    tscProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Backend compilé avec succès !');
        console.log('📄 Output:', output);
        resolve(true);
      } else {
        console.error('❌ Erreur de compilation backend:');
        console.error('📄 Error output:', errorOutput);
        resolve(false);
      }
    });

    // Timeout de sécurité
    setTimeout(() => {
      tscProcess.kill();
      console.log('⏰ Timeout de compilation backend');
      resolve(false);
    }, 120000); // 2 minutes
  });
}

// Fonction pour construire le frontend
async function buildFrontend() {
  return new Promise((resolve) => {
    console.log('🎨 Construction du frontend...');
    
    // Vérifier si vite est disponible
    const viteCheck = spawn('npx', ['vite', '--version'], {
      cwd: path.join(__dirname, 'beauty-flow'),
      stdio: 'pipe',
      shell: true
    });

    viteCheck.on('close', (code) => {
      if (code !== 0) {
        console.log('⚠️ Vite non trouvé, installation...');
        // Installer vite si nécessaire
        const installVite = spawn('npm', ['install', 'vite'], {
          cwd: path.join(__dirname, 'beauty-flow'),
          stdio: 'pipe',
          shell: true
        });

        installVite.on('close', () => {
          startBuild();
        });
      } else {
        startBuild();
      }
    });

    function startBuild() {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: path.join(__dirname, 'beauty-flow'),
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          VITE_API_URL: 'https://saloneo-app.onrender.com/api',
          VITE_ENV: 'production',
          VITE_APP_NAME: 'Saloneo',
          VITE_SITE_URL: 'https://saloneo-app.onrender.com'
        }
      });

      let output = '';
      let errorOutput = '';

      buildProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log('📦 Frontend build:', text.trim());
      });

      buildProcess.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        console.log('⚠️ Frontend warning:', text.trim());
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Frontend construit avec succès !');
          resolve(true);
        } else {
          console.error('❌ Erreur de construction frontend:');
          console.error('📄 Error output:', errorOutput);
          resolve(false);
        }
      });

      // Timeout de sécurité
      setTimeout(() => {
        buildProcess.kill();
        console.log('⏰ Timeout de construction frontend');
        resolve(false);
      }, 300000); // 5 minutes
    }
  });
}

// Middleware pour servir les fichiers statiques du frontend
function setupFrontendStatic() {
  if (fs.existsSync(FRONTEND_DIST_PATH)) {
    console.log('📁 Configuration des fichiers statiques frontend...');
    app.use(express.static(FRONTEND_DIST_PATH));
    
    // Route catch-all pour React Router
    app.get('*', (req, res) => {
      // Éviter les routes API et uploads
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
        return res.status(404).json({
          error: 'Not Found',
          message: `Cannot ${req.method} ${req.originalUrl}`,
          timestamp: new Date().toISOString()
        });
      }
      
      const indexPath = path.join(FRONTEND_DIST_PATH, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Saloneo - En construction</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .logo { font-size: 2.5em; color: #6366f1; margin-bottom: 20px; }
              .status { color: #059669; font-weight: bold; margin: 20px 0; }
              .progress { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin: 20px 0; }
              .progress-bar { background: #6366f1; height: 100%; width: 70%; animation: pulse 2s infinite; }
              @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">💄 SALONEO</div>
              <h1>Plateforme de gestion pour salons de beauté</h1>
              <div class="status">🔨 APPLICATION EN CONSTRUCTION</div>
              <div class="progress"><div class="progress-bar"></div></div>
              <p>✅ Serveur démarré sur le port ${PORT}</p>
              <p>🔄 Frontend en cours de compilation...</p>
              <p>⚙️ Backend en cours d'initialisation...</p>
              <p><small>Timestamp: ${new Date().toISOString()}</small></p>
              <p><small>Rechargement automatique dans 15 secondes</small></p>
              <script>setTimeout(() => window.location.reload(), 15000);</script>
            </div>
          </body>
          </html>
        `);
      }
    });
    
    return true;
  }
  return false;
}

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    backend: isBackendLoaded ? 'loaded' : 'loading',
    frontend: fs.existsSync(FRONTEND_DIST_PATH) ? 'available' : 'building',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Middleware pour rediriger vers le backend si chargé
app.use((req, res, next) => {
  if (isBackendLoaded && backendApp && req.path.startsWith('/api/')) {
    return backendApp(req, res, next);
  }
  next();
});

// Initialisation asynchrone
async function initialize() {
  console.log('🔄 Initialisation du serveur...');
  
  // Démarrer le serveur immédiatement
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎯 Serveur Saloneo initialisé`);
    console.log(`🚀 Serveur minimal démarré sur le port ${PORT}`);
    console.log(`🌐 Accessible sur: https://saloneo-app.onrender.com`);
  });

  // Configuration initiale du frontend
  setupFrontendStatic();

  // Processus d'initialisation en arrière-plan
  if (!buildInProgress) {
    buildInProgress = true;
    
    setTimeout(async () => {
      console.log('🔨 Début de la construction du frontend...');
      
      // Vérifier si le frontend existe déjà
      if (!fs.existsSync(FRONTEND_DIST_PATH)) {
        console.log('📦 Installation des dépendances frontend...');
        await buildFrontend();
        setupFrontendStatic();
      } else {
        console.log('✅ Frontend déjà construit');
      }

      // Charger ou compiler le backend
      console.log('⚙️ Initialisation du backend...');
      
      let backendReady = await loadCompiledBackend();
      
      if (!backendReady) {
        console.log('⚠️ Backend compilé non trouvé, tentative avec TypeScript...');
        const compiled = await compileBackend();
        
        if (compiled) {
          backendReady = await loadCompiledBackend();
        }
      }

      if (!backendReady) {
        console.log('❌ Impossible de charger le backend: utilisation du serveur minimal');
      }

      buildInProgress = false;
      console.log('🎉 Initialisation terminée !');
      
    }, 1000);
  }

  return server;
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée:', reason);
});

// Démarrage
initialize().catch(console.error);

module.exports = app;
