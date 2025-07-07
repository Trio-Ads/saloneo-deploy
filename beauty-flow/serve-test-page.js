// Script pour servir la page de test de redirection SATIM localement
const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Route pour la page de test
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-payment-success-redirect.html'));
});

// Route pour simuler la redirection vers la page de souscription
app.get('/subscription', (req, res) => {
  // Afficher les paramètres reçus
  console.log('Paramètres de redirection reçus:', req.query);
  
  // Rediriger vers l'application principale avec les mêmes paramètres
  const mainAppUrl = 'http://localhost:3000/subscription';
  const queryString = new URLSearchParams(req.query).toString();
  const redirectUrl = `${mainAppUrl}?${queryString}`;
  
  console.log('Redirection vers:', redirectUrl);
  res.redirect(redirectUrl);
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur de test démarré sur http://localhost:${port}`);
  console.log('Utilisez ce serveur pour tester les redirections SATIM');
  console.log('Pour arrêter le serveur, appuyez sur Ctrl+C');
});
