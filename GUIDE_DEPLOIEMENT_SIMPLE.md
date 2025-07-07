# 🚀 GUIDE DE DÉPLOIEMENT SALONEO - ÉTAPES SIMPLES

## ✅ ÉTAPE 1 : CRÉER UN COMPTE RENDER

1. Va sur **https://render.com**
2. Clique sur **"Get Started for Free"**
3. Inscris-toi avec ton email ou GitHub

## ✅ ÉTAPE 2 : CONNECTER TON REPOSITORY GITHUB

1. Dans Render, clique sur **"New +"**
2. Sélectionne **"Web Service"**
3. Connecte ton compte GitHub
4. Sélectionne le repository : **"saloneo-deploy"**
5. Clique sur **"Connect"**

## ✅ ÉTAPE 3 : CONFIGURER LE SERVICE

### Paramètres de base :
- **Name** : `saloneo-app`
- **Region** : `Frankfurt (EU Central)`
- **Branch** : `main`
- **Root Directory** : (laisser vide)
- **Runtime** : `Node`

### Commandes de build :
- **Build Command** : `npm run build`
- **Start Command** : `npm start`

### Plan :
- Sélectionne **"Free"** (0$/mois)

## ✅ ÉTAPE 4 : AJOUTER LES VARIABLES D'ENVIRONNEMENT

Dans la section **"Environment Variables"**, ajoute :

```
MONGODB_URI=mongodb+srv://tradi:AAZij4XCzq0Hz3h2@tradition-elle.tnpkqvw.mongodb.net/?retryWrites=true&w=majority&appName=Tradition-ELLE

JWT_SECRET=saloneo_super_secret_key_2025_production_xyz789

NODE_ENV=production

PORT=10000

SATIM_USERNAME=SAT2507010254

SATIM_PASSWORD=satim120

SATIM_BASE_URL=https://test.satim.dz

FRONTEND_URL=https://saloneo-app.onrender.com
```

## ✅ ÉTAPE 5 : DÉPLOYER

1. Clique sur **"Create Web Service"**
2. Attends que le déploiement se termine (5-10 minutes)
3. Ton app sera disponible sur : `https://saloneo-app.onrender.com`

## 🎉 TERMINÉ !

Ton application Saloneo est maintenant en ligne avec :
- ✅ Frontend React
- ✅ Backend Node.js/Express
- ✅ Base de données MongoDB
- ✅ Système de paiement SATIM
- ✅ Toutes les fonctionnalités

## 🔧 DÉPANNAGE

Si le déploiement échoue :
1. Vérifie les logs dans Render
2. Assure-toi que toutes les variables d'environnement sont correctes
3. Redémarre le service si nécessaire

## 📱 ACCÈS À L'APPLICATION

- **URL principale** : https://saloneo-app.onrender.com
- **API** : https://saloneo-app.onrender.com/api
- **Test de santé** : https://saloneo-app.onrender.com/api/health

---

**Note** : Le premier démarrage peut prendre 1-2 minutes car Render doit installer les dépendances.
