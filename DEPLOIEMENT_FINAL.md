# 🚀 Guide de Déploiement Final - Saloneo sur Render

## 📋 Vue d'ensemble
Ce guide documente le processus complet de déploiement de l'application Saloneo sur Render.com

## 🛠️ Architecture
- **Frontend** : React (Vite) + TypeScript
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : MongoDB Atlas
- **Hébergement** : Render.com (service unifié)
- **Paiement** : SATIM Test

## 📁 Structure du Projet
```
Beauty_Flow/
├── beauty-flow/          # Frontend React
├── beauty-flow-backend/  # Backend Node.js
├── server.js            # Serveur unifié
├── build-and-deploy.sh  # Script de build
├── render.yaml          # Configuration Render
└── package.json         # Dépendances racine
```

## 🔧 Configuration Préalable

### 1. MongoDB Atlas
1. Créer un cluster sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un utilisateur avec les permissions read/write
3. Ajouter 0.0.0.0/0 dans la liste blanche IP
4. Récupérer l'URI de connexion

### 2. Variables SATIM (Test)
Obtenir les credentials de test SATIM :
- `SATIM_TEST_USERNAME`
- `SATIM_TEST_PASSWORD`
- `SATIM_TEST_TERMINAL_ID`

## 📝 Fichiers de Configuration

### render.yaml
```yaml
services:
  - type: web
    name: saloneo-deploy
    env: node
    plan: starter
    region: oregon
    buildCommand: chmod +x build-and-deploy.sh && ./build-and-deploy.sh
    startCommand: node server.js
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        value: [Votre URI MongoDB]
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: JWT_REFRESH_EXPIRES_IN
        value: 30d
      - key: FRONTEND_URL
        value: https://saloneo-app.onrender.com
      - key: CORS_ORIGIN
        value: https://saloneo-app.onrender.com
```

### build-and-deploy.sh
Script qui :
1. Compile le backend TypeScript
2. Build le frontend avec Vite (NODE_ENV=development pour installer les devDependencies)
3. Copie le frontend buildé dans le dossier dist

### server.js
Serveur unifié qui :
1. Charge le backend compilé
2. Sert les fichiers statiques du frontend
3. Gère le routing SPA avec fallback sur index.html

## 🚀 Étapes de Déploiement

### 1. Préparation du Code
```bash
# S'assurer que tous les fichiers sont committés
git add .
git commit -m "Préparation pour déploiement"
git push origin main
```

### 2. Création du Service sur Render
1. Connectez-vous à [Render](https://render.com)
2. Cliquez sur "New +" > "Web Service"
3. Connectez votre repo GitHub
4. Sélectionnez la branche `main`
5. Render détectera automatiquement le fichier `render.yaml`

### 3. Configuration des Variables d'Environnement
Dans Render > Environment, ajoutez :

#### Variables Essentielles
- `MONGODB_URI` : Votre URI MongoDB Atlas
- `JWT_SECRET` : (généré automatiquement ou définir manuellement)
- `JWT_REFRESH_SECRET` : (généré automatiquement ou définir manuellement)

#### Variables SATIM
- `SATIM_TEST_USERNAME`
- `SATIM_TEST_PASSWORD`
- `SATIM_TEST_TERMINAL_ID`
- `SATIM_TEST_URL` : https://test.satim.dz/payment/rest/register.do
- `SATIM_TEST_STATUS_URL` : https://test.satim.dz/payment/rest/getOrderStatusExtended.do

#### Variables Optionnelles
- `TWILIO_ACCOUNT_SID` : Pour les SMS
- `TWILIO_AUTH_TOKEN` : Pour les SMS
- `TWILIO_PHONE_NUMBER` : Pour les SMS
- `STABILITY_API_KEY` : Pour la génération d'images IA

### 4. Déploiement
1. Cliquez sur "Create Web Service"
2. Render lancera automatiquement le build et le déploiement
3. Suivez les logs pour vérifier que tout se passe bien

## 🔍 Vérification Post-Déploiement

### 1. Vérifier l'Application
- Frontend : https://[votre-service].onrender.com
- API Health : https://[votre-service].onrender.com/api/health

### 2. Créer un Premier Compte
1. Allez sur /register
2. Créez un compte salon
3. Configurez votre profil

### 3. Tester les Fonctionnalités
- ✅ Connexion/Déconnexion
- ✅ Gestion des services
- ✅ Gestion des clients
- ✅ Prise de rendez-vous
- ✅ Interface publique (/public/[slug-salon])

## 🌐 Configuration du Domaine Personnalisé

Voir [CONFIGURATION_DOMAINE_GODADDY.md](./CONFIGURATION_DOMAINE_GODADDY.md) pour les instructions détaillées.

## 🚨 Dépannage

### Erreur de Build
- Vérifiez que `build-and-deploy.sh` a les permissions d'exécution
- Assurez-vous que toutes les dépendances sont dans package.json

### Erreur 401 Unauthorized
- Vérifiez que JWT_SECRET est défini
- Créez un nouveau compte si la base de données est vide

### Erreur CORS
- Vérifiez FRONTEND_URL et CORS_ORIGIN
- Assurez-vous qu'ils correspondent à votre domaine

### Erreur MongoDB
- Vérifiez l'URI MongoDB
- Vérifiez la liste blanche IP (0.0.0.0/0)
- Testez la connexion avec MongoDB Compass

## 📊 Monitoring

### Logs
Dans Render Dashboard :
- Logs > Live pour voir en temps réel
- Logs > Past pour l'historique

### Métriques
- CPU et mémoire dans l'onglet Metrics
- Temps de réponse et statut

## 🔄 Mises à Jour

### Déploiement Automatique
Avec `autoDeploy: true`, chaque push sur `main` déclenche un nouveau déploiement.

### Déploiement Manuel
1. Dashboard Render > Manual Deploy
2. Sélectionnez le commit
3. Deploy

## 📝 Notes Importantes

1. **Base de données** : Les données ne sont pas transférées automatiquement du local vers la production
2. **Uploads** : Les fichiers uploadés sont stockés temporairement sur Render (utilisez un service cloud pour la persistance)
3. **SSL** : Render fournit automatiquement HTTPS
4. **Domaine** : Le domaine .onrender.com est gratuit mais vous pouvez configurer votre propre domaine

## 🎯 Checklist Finale

- [ ] MongoDB Atlas configuré et accessible
- [ ] Toutes les variables d'environnement définies
- [ ] Build réussi sans erreurs
- [ ] Application accessible via HTTPS
- [ ] Compte créé et fonctionnel
- [ ] Tests des fonctionnalités principales
- [ ] Domaine personnalisé configuré (optionnel)

## 📞 Support

- **Render** : [render.com/docs](https://render.com/docs)
- **MongoDB Atlas** : [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **SATIM** : Documentation fournie par SATIM

---

*Dernière mise à jour : Juillet 2025*
