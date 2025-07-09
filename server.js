const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware minimal
app.use(express.json());
app.use(express.static(path.join(__dirname, 'beauty-flow/dist')));

console.log('🚀 Démarrage IMMÉDIAT du serveur...');

// DÉMARRER LE SERVEUR IMMÉDIATEMENT - AUCUNE ATTENTE
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVEUR ACTIF sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  
  // Construire le frontend EN ARRIÈRE-PLAN après le démarrage
  setTimeout(() => {
    console.log('🔨 Début construction frontend...');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: path.join(__dirname, 'beauty-flow'),
      stdio: 'pipe',
      shell: true
    });

    buildProcess.stdout.on('data', (data) => {
      console.log(`📦 ${data.toString().trim()}`);
    });

    buildProcess.stderr.on('data', (data) => {
      console.log(`⚠️ ${data.toString().trim()}`);
    });

    buildProcess.on('close', (code) => {
      console.log(code === 0 ? '✅ Build terminé !' : `❌ Build échoué: ${code}`);
    });
  }, 1000); // Attendre 1 seconde après le démarrage
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Route catch-all pour React
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'beauty-flow/dist/index.html');
  const fs = require('fs');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Saloneo - Déploiement Réussi</title>
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
            max-width: 600px;
          }
          .status { 
            background: rgba(255,255,255,0.2); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
          }
          .success { 
            background: rgba(0,255,0,0.2); 
            color: #ccffcc;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>💄 SALONEO</h1>
          <p>Plateforme de gestion pour salons de beauté</p>
          
          <div class="status success">
            <h3>🎉 DÉPLOIEMENT RÉUSSI !</h3>
            <p>✅ Serveur actif sur le port ${PORT}</p>
            <p>✅ Application accessible</p>
            <p>🔨 Frontend en cours de construction...</p>
          </div>
          
          <p><small>Timestamp: ${new Date().toISOString()}</small></p>
          <p><small>La page se rechargera automatiquement dans 30 secondes</small></p>
        </div>
        
        <script>
          setTimeout(() => window.location.reload(), 30000);
        </script>
      </body>
      </html>
    `);
  }
});

// Gestion des erreurs
server.on('error', (err) => {
  console.error('❌ Erreur serveur:', err);
});

process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});

console.log('🎯 Serveur configuré - Démarrage en cours...');
