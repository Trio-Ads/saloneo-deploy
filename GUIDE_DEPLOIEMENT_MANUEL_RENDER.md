# 🚀 GUIDE DÉPLOIEMENT MANUEL RENDER - SALONEO

## 📋 ÉTAPES RAPIDES

### 1. **Créer le service sur Render**
- Va sur https://render.com
- Clique "New +" → "Web Service"
- Connecte le repo GitHub: `https://github.com/Trio-Ads/saloneo-deploy`
- Branch: `main`

### 2. **Configuration du service**

**Nom du service:** `saloneo-deploy`
**Environment:** `Node`
**Region:** `Oregon (US West)`
**Branch:** `main`

**Build Command:**
```bash
echo "=== INSTALLATION BACKEND ===" && cd beauty-flow-backend && npm install && echo "=== BUILD BACKEND ===" && npm run build && echo "=== INSTALLATION FRONTEND ===" && cd ../beauty-flow && npm install && echo "=== BUILD FRONTEND ===" && npm run build && echo "=== COPIE FRONTEND VERS BACKEND ===" && cp -r dist/* ../beauty-flow-backend/dist/public/ && echo "=== BUILD TERMINÉ ==="
```

**Start Command:**
```bash
cd beauty-flow-backend && npm start
```

### 3. **Variables d'environnement**

**OBLIGATOIRES:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Render va générer automatiquement]
JWT_SECRET=[Render va générer automatiquement]
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://saloneo-deploy.onrender.com
CORS_ORIGIN=https://saloneo-deploy.onrender.com
```

**OPTIONNELLES:**
```
JWT_REFRESH_SECRET=[Auto-généré]
JWT_REFRESH_EXPIRES_IN=30d
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 4. **Ajouter PostgreSQL**
- Dans le dashboard Render, va dans ton service
- Clique "Environment" → "Add Database"
- Sélectionne "PostgreSQL"
- Nom: `saloneo-db`
- Plan: `Free` (pour commencer)

### 5. **Configuration finale**

**Auto-Deploy:** ✅ Activé
**Health Check Path:** `/health`

## 🔧 COMMANDES DE VÉRIFICATION

Une fois déployé, teste ces URLs :

```bash
# Health check
curl https://saloneo-deploy.onrender.com/health

# Frontend
curl https://saloneo-deploy.onrender.com/

# API
curl https://saloneo-deploy.onrender.com/api/public/health
```

## 📁 STRUCTURE DU PROJET

```
/
├── beauty-flow/          # Frontend React
├── beauty-flow-backend/  # Backend Node.js
├── render-simple.yaml    # Config Render
└── package.json          # Root package
```

## 🚨 PROBLÈMES COURANTS

**Build qui échoue:**
- Vérifie que Node.js version >= 18
- Assure-toi que toutes les dépendances sont dans package.json

**Service qui démarre pas:**
- Vérifie que PORT=10000
- Vérifie que DATABASE_URL est configuré

**Frontend pas accessible:**
- Vérifie que les fichiers sont copiés dans `beauty-flow-backend/dist/public/`
- Vérifie que le backend sert les fichiers statiques

## 💡 TIPS

1. **Logs en temps réel:** Dashboard Render → Service → "Logs"
2. **Redéployer:** Dashboard → "Manual Deploy"
3. **Variables d'env:** Dashboard → "Environment"

## 🎯 RÉSULTAT ATTENDU

- **URL principale:** https://saloneo-deploy.onrender.com
- **API:** https://saloneo-deploy.onrender.com/api/*
- **Health:** https://saloneo-deploy.onrender.com/health

Le site complet (frontend + backend + base de données) sera accessible sur une seule URL !
