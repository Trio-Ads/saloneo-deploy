# 🚀 Guide de Déploiement Beauty Flow sur Render

## 📋 Prérequis
- ✅ Compte GitHub
- ✅ Compte MongoDB Atlas (gratuit)
- ✅ Compte Render (gratuit)

## 🔧 Étape 1 : Préparation GitHub

### 1.1 Créer un nouveau repository
1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur le bouton vert **"New"** ou **"+"** en haut à droite
3. Remplissez :
   - **Repository name** : `beauty-flow-app`
   - **Description** : `Application de gestion de salon de beauté`
   - ✅ **Public** (pour le compte gratuit Render)
   - ✅ Cochez **"Add a README file"**
4. Cliquez **"Create repository"**

### 1.2 Uploader votre code
**Option A - Via l'interface web GitHub :**
1. Dans votre nouveau repository, cliquez **"uploading an existing file"**
2. Glissez-déposez TOUT le dossier `Beauty_Flow`
3. Écrivez un message : `Initial commit - Beauty Flow app`
4. Cliquez **"Commit changes"**

**Option B - Via Git (si vous avez Git installé) :**
```bash
cd /Users/MAC/Documents/Trio.digital/Beauty_Flow
git init
git add .
git commit -m "Initial commit - Beauty Flow app"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/beauty-flow-app.git
git push -u origin main
```

## 🗄️ Étape 2 : Configuration MongoDB Atlas

### 2.1 Créer un compte
1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquez **"Try Free"**
3. Inscrivez-vous avec votre email

### 2.2 Créer un cluster
1. Choisissez **"M0 Sandbox"** (GRATUIT)
2. Région : **"Europe (Ireland)"** ou la plus proche
3. Nom du cluster : `beauty-flow-cluster`
4. Cliquez **"Create Cluster"**

### 2.3 Configuration sécurité
1. **Database Access** :
   - Cliquez **"Add New Database User"**
   - Username : `beautyflow-user`
   - Password : Générez un mot de passe fort (NOTEZ-LE !)
   - Rôle : **"Read and write to any database"**

2. **Network Access** :
   - Cliquez **"Add IP Address"**
   - Choisissez **"Allow access from anywhere"** (0.0.0.0/0)
   - Confirmez

### 2.4 Récupérer l'URI de connexion
1. Retournez à **"Clusters"**
2. Cliquez **"Connect"** sur votre cluster
3. Choisissez **"Connect your application"**
4. Copiez l'URI (ressemble à) :
   ```
   mongodb+srv://beautyflow-user:<password>@beauty-flow-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANT** : Remplacez `<password>` par votre vrai mot de passe

## 🌐 Étape 3 : Déploiement sur Render

### 3.1 Créer un compte Render
1. Allez sur [Render.com](https://render.com)
2. Cliquez **"Get Started for Free"**
3. Connectez-vous avec GitHub

### 3.2 Connecter votre repository
1. Dans le dashboard Render, cliquez **"New +"**
2. Choisissez **"Blueprint"**
3. Connectez votre repository GitHub `beauty-flow-app`
4. Render détectera automatiquement le fichier `render.yaml`

### 3.3 Configuration des variables d'environnement
Render vous demandera de configurer :

**Pour le Backend :**
- `MONGODB_URI` : Collez votre URI MongoDB Atlas
- Les autres variables seront générées automatiquement

**Pour le Frontend :**
- Les variables seront configurées automatiquement

### 3.4 Déploiement
1. Cliquez **"Apply"**
2. Attendez le déploiement (5-10 minutes)
3. Render va :
   - Installer les dépendances
   - Builder l'application
   - Déployer les services

## 🎉 Étape 4 : Test et URLs finales

### 4.1 URLs de votre application
Après déploiement, vous aurez :
- **Frontend** : `https://beauty-flow-frontend.onrender.com`
- **Backend API** : `https://beauty-flow-backend.onrender.com`

### 4.2 Pages publiques
- **Page salon** : `https://beauty-flow-frontend.onrender.com/salon/[votre-slug]`
- **Interface admin** : `https://beauty-flow-frontend.onrender.com/auth/login`

### 4.3 Test de fonctionnement
1. Ouvrez l'URL frontend
2. Créez un compte admin
3. Configurez votre salon
4. Testez la page publique

## 🔧 Dépannage

### Problème : Service en veille
- **Cause** : Compte gratuit, service se met en veille après 15min
- **Solution** : Premier chargement peut prendre 30-60 secondes

### Problème : Erreur de connexion base de données
- **Vérifiez** : URI MongoDB correct dans les variables d'environnement
- **Vérifiez** : IP autorisée dans MongoDB Atlas

### Problème : Page blanche
- **Vérifiez** : Variables d'environnement frontend configurées
- **Vérifiez** : Build réussi dans les logs Render

## 📞 Support
Si vous rencontrez des problèmes, vérifiez :
1. Les logs dans Render Dashboard
2. Les variables d'environnement
3. La configuration MongoDB Atlas

---

**🎯 Résultat final :**
- ✅ Application en ligne 24/7
- ✅ Pages publiques partageables
- ✅ Interface admin sécurisée
- ✅ Base de données cloud
- ✅ Prêt pour migration vers domaine personnalisé
