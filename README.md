# 💄 Saloneo - Système de Gestion de Salon de Beauté

Une application moderne et complète pour la gestion de salons de beauté avec interface publique de réservation.

## 🌟 Fonctionnalités

### 👨‍💼 Interface Administrateur
- ✅ Gestion des clients
- ✅ Gestion des services et prix
- ✅ Planification des rendez-vous
- ✅ Gestion de l'équipe
- ✅ Tableau de bord analytique
- ✅ Gestion des produits
- ✅ Interface multilingue (FR, EN, ES, AR)

### 🌐 Interface Publique
- ✅ **Pages salon partageables** (`/salon/votre-slug`)
- ✅ **Réservation en ligne** pour les clients
- ✅ **Templates personnalisables** pour chaque salon
- ✅ **Gestion des rendez-vous** sans inscription
- ✅ **Responsive design** pour mobile et desktop

## 🚀 Déploiement

### Version BETA en ligne
- **Frontend** : [https://saloneo-frontend.onrender.com](https://saloneo-frontend.onrender.com)
- **API** : [https://saloneo-backend.onrender.com](https://saloneo-backend.onrender.com)

### Déploiement local
```bash
# Backend
cd beauty-flow-backend
npm install
npm run dev

# Frontend
cd beauty-flow
npm install
npm run dev
```

## 🛠️ Technologies

### Frontend
- **React 18** + TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **React Router** pour la navigation
- **i18next** pour l'internationalisation

### Backend
- **Node.js** + Express + TypeScript
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Socket.io** pour le temps réel
- **Multer** pour l'upload de fichiers

## 📱 Pages Publiques

### URL de démonstration
```
https://saloneo-frontend.onrender.com/salon/demo-salon
```

### Fonctionnalités publiques
- 🎨 **Templates modernes** et personnalisables
- 📅 **Réservation en temps réel** avec disponibilités
- 👥 **Présentation de l'équipe** et services
- 📞 **Informations de contact** et horaires
- 🌍 **Support multilingue**

## 🔧 Configuration

### Variables d'environnement

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_ENV=production
```

## 📖 Guide de Déploiement

Consultez le fichier `deploy-guide.md` pour un guide détaillé de déploiement sur Render.

## 🎯 Utilisation

### Pour les propriétaires de salon
1. Créez un compte administrateur
2. Configurez votre salon (nom, services, équipe)
3. Personnalisez votre template
4. Partagez votre lien public : `/salon/votre-slug`

### Pour les clients
1. Visitez la page publique du salon
2. Choisissez un service
3. Sélectionnez date/heure
4. Remplissez vos informations
5. Confirmez la réservation

## 🔗 Liens Utiles

- **Documentation** : Voir `DOCUMENTATION.md`
- **Guide développeur** : Voir `GUIDE_DEVELOPPEUR.md`
- **Résolution de problèmes** : Voir `GUIDE_RESOLUTION_PROBLEMES.md`

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 👨‍💻 Développement

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build de production
npm run build

# Tests
npm run test
```

## 🌍 Support Multilingue

- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇪🇸 Espagnol
- 🇸🇦 Arabe

## 📞 Support

Pour toute question ou problème, consultez la documentation ou les guides de dépannage inclus.

---

**🎉 Prêt à transformer votre salon de beauté avec Saloneo !**
