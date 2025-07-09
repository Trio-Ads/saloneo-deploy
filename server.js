const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Import du backend Express
let backendApp;
try {
  // Essayer d'importer le backend compilé
  backendApp = require('./beauty-flow-backend/dist/app.js');
} catch (error) {
  console.log('⚠️ Backend compilé non trouvé, tentative avec TypeScript...');
  try {
    // Fallback: utiliser ts-node pour exécuter directement le TypeScript
    require('ts-node/register');
    backendApp = require('./beauty-flow-backend/src/app.ts');
  } catch (tsError) {
    console.error('❌ Impossible de charger le backend:', tsError.message);
    // Créer un serveur minimal en cas d'échec
    backendApp = null;
  }
}

const PORT = process.env.PORT || 10000;

// Si le backend n'est pas disponible, créer un serveur minimal
if (!backendApp) {
  console.log('🔄 Création d\'un serveur minimal...');
  
  const app = express();
  
  // Middleware de base
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'beauty-flow/dist')));
  
  // Route de santé
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Serveur minimal actif',
      timestamp: new Date().toISOString()
    });
  });
  
  // API placeholder
  app.use('/api/*', (req, res) => {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Backend en cours de démarrage...'
    });
  });
  
  // Servir le frontend
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'beauty-flow/dist/index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Saloneo - Construction en cours</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
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
              text-align: center;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .logo { 
              font-size: 3em; 
              margin-bottom: 20px;
            }
            .status { 
              background: rgba(255,255,255,0.2); 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0;
            }
            .building { 
              background: rgba(255,165,0,0.2); 
              color: #ffcc99;
            }
            .spinner {
              border: 3px solid rgba(255,255,255,0.3);
              border-top: 3px solid white;
              border-radius: 50%;
              width: 30px;
              height: 30px;
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
            <div class="logo">💄 SALONEO</div>
            <h2>Plateforme de gestion pour salons de beauté</h2>
            
            <div class="status building">
              <h3>🔨 APPLICATION EN CONSTRUCTION</h3>
              <div class="spinner"></div>
              <p>✅ Serveur démarré sur le port ${PORT}</p>
              <p>🔄 Frontend en cours de compilation...</p>
              <p>⚙️ Backend en cours d'initialisation...</p>
            </div>
            
            <p><small>Timestamp: ${new Date().toISOString()}</small></p>
            <p><small>Rechargement automatique dans 15 secondes</small></p>
          </div>
          
          <script>
            setTimeout(() => window.location.reload(), 15000);
          </script>
        </body>
        </html>
      `);
    }
  });
  
  // Démarrer le serveur minimal
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur minimal démarré sur le port ${PORT}`);
    
    // Construire le frontend en arrière-plan
    buildFrontend();
  });
  
  // Gestion des erreurs
  server.on('error', (err) => {
    console.error('❌ Erreur serveur:', err);
  });
  
} else {
  // Le backend est disponible, l'utiliser directement
  console.log('✅ Backend chargé avec succès');
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
}

// Fonction pour construire le frontend
function buildFrontend() {
  console.log('🔨 Début de la construction du frontend...');
  
  const frontendPath = path.join(__dirname, 'beauty-flow');
  
  // Vérifier si le dossier frontend existe
  if (!fs.existsSync(frontendPath)) {
    console.error('❌ Dossier frontend non trouvé:', frontendPath);
    return;
  }
  
  // Installer les dépendances
  console.log('📦 Installation des dépendances frontend...');
  const installProcess = spawn('npm', ['install'], {
    cwd: frontendPath,
    stdio: 'pipe',
    shell: true
  });
  
  installProcess.stdout.on('data', (data) => {
    console.log(`📦 ${data.toString().trim()}`);
  });
  
  installProcess.stderr.on('data', (data) => {
    console.log(`⚠️ ${data.toString().trim()}`);
  });
  
  installProcess.on('close', (installCode) => {
    if (installCode === 0) {
      console.log('✅ Dépendances frontend installées');
      
      // Construire le frontend
      console.log('🏗️ Construction du frontend...');
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: frontendPath,
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          VITE_API_URL: `https://saloneo-app.onrender.com/api`,
          VITE_ENV: 'production',
          VITE_APP_NAME: 'Saloneo',
          VITE_SITE_URL: 'https://saloneo-app.onrender.com'
        }
      });
      
      buildProcess.stdout.on('data', (data) => {
        console.log(`🏗️ ${data.toString().trim()}`);
      });
      
      buildProcess.stderr.on('data', (data) => {
        console.log(`⚠️ ${data.toString().trim()}`);
      });
      
      buildProcess.on('close', (buildCode) => {
        if (buildCode === 0) {
          console.log('✅ Frontend construit avec succès !');
          
          // Vérifier que les fichiers ont été créés
          const distPath = path.join(frontendPath, 'dist');
          const indexPath = path.join(distPath, 'index.html');
          
          if (fs.existsSync(indexPath)) {
            console.log('✅ index.html créé avec succès');
            console.log('🎉 Application prête !');
          } else {
            console.log('⚠️ index.html non trouvé après le build');
          }
        } else {
          console.error(`❌ Échec de la construction frontend (code: ${buildCode})`);
        }
      });
      
    } else {
      console.error(`❌ Échec de l'installation des dépendances (code: ${installCode})`);
    }
  });
}

// Gestion des signaux de fermeture
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});

console.log('🎯 Serveur Saloneo initialisé');
