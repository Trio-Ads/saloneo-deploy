# Beauty Flow Backend API

Backend API pour l'application Beauty Flow - Système de gestion pour salons de coiffure.

## 🚀 Technologies

- **Node.js** (v18+)
- **TypeScript** 
- **Express.js**
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Bcrypt** pour le hachage des mots de passe
- **Winston** pour les logs
- **Joi** pour la validation
- **Multer** pour l'upload de fichiers

## 📋 Prérequis

- Node.js v18 ou supérieur
- MongoDB installé localement ou accès à MongoDB Atlas
- npm ou yarn

## 🛠️ Installation

1. Cloner le repository
```bash
cd beauty-flow-backend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. Démarrer MongoDB (si local)
```bash
mongod
```

## 🏃‍♂️ Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm run build
npm start
```

## 📁 Structure du projet

```
beauty-flow-backend/
├── src/
│   ├── config/         # Configuration (DB, etc.)
│   ├── controllers/    # Contrôleurs des routes
│   ├── middleware/     # Middleware Express
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Définition des routes
│   ├── services/       # Logique métier
│   ├── types/          # Types TypeScript
│   ├── utils/          # Utilitaires
│   └── app.ts          # Point d'entrée
├── uploads/            # Fichiers uploadés
├── logs/               # Fichiers de logs
└── dist/               # Build de production
```

## 🔑 Variables d'environnement

```env
# Server
PORT=5000
HOST=localhost
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/beauty-flow

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Frontend
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion

### Clients
- `GET /api/clients` - Liste des clients
- `POST /api/clients` - Créer un client
- `GET /api/clients/:id` - Détails d'un client
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client

### Services
- `GET /api/services` - Liste des services
- `POST /api/services` - Créer un service
- `GET /api/services/:id` - Détails d'un service
- `PUT /api/services/:id` - Modifier un service
- `DELETE /api/services/:id` - Supprimer un service

### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments/:id` - Détails d'un rendez-vous
- `PUT /api/appointments/:id` - Modifier un rendez-vous
- `DELETE /api/appointments/:id` - Annuler un rendez-vous
- `GET /api/appointments/availability` - Vérifier la disponibilité

### Équipe
- `GET /api/team` - Liste des membres
- `POST /api/team` - Ajouter un membre
- `GET /api/team/:id` - Détails d'un membre
- `PUT /api/team/:id` - Modifier un membre
- `DELETE /api/team/:id` - Supprimer un membre

## 🔒 Sécurité

- Authentification JWT avec refresh tokens
- Hachage des mots de passe avec bcrypt
- Protection CORS
- Rate limiting
- Validation des entrées avec Joi
- Headers de sécurité avec Helmet

## 📝 Modèles de données

### User
- Compte salon avec abonnement
- Paramètres de langue et devise
- Gestion des plans (Free, Starter, Pro, Enterprise)

### Client
- Informations personnelles
- Questionnaires cheveux/peau
- Programme de fidélité
- Historique des visites

### Service
- Catégories de services
- Durée et prix
- Produits associés
- Configuration pour réservation en ligne

### Appointment
- Réservation avec tokens de modification
- Statuts (planifié, confirmé, terminé, etc.)
- Système de rappels
- Notes et évaluations

### TeamMember
- Spécialités et niveaux
- Planning et horaires
- Gestion des congés

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 📦 Déploiement

### Avec Docker
```bash
docker build -t beauty-flow-backend .
docker run -p 5000:5000 beauty-flow-backend
```

### Sur Heroku
```bash
heroku create beauty-flow-api
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT.
