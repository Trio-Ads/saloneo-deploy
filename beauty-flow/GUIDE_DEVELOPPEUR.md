# Guide du Développeur - Beauty Flow

## Vue d'ensemble
Beauty Flow est une application web de gestion de salon de coiffure développée avec React, TypeScript et Vite. Elle permet la gestion des rendez-vous, clients, services, équipe et offre une interface publique de réservation.

## Stack technique
- **Frontend**: React 18.2.0, TypeScript 5.0.2, Vite 4.4.5
- **Styling**: TailwindCSS 3.3.3, PostCSS 8.4.29
- **État**: Zustand 4.4.1
- **Routing**: React Router 6.15.0
- **Formulaires**: React Hook Form 7.45.4
- **Internationalisation**: i18next 23.4.9, react-i18next 13.2.2
- **Tests**: Vitest 0.34.3, Testing Library 14.0.0

## Architecture
L'application suit une architecture modulaire organisée par fonctionnalités (feature-first):
- Chaque module fonctionnel est isolé dans `/src/features/`
- Gestion d'état avec Zustand (stores par fonctionnalité)
- Composants partagés dans `/src/components/`
- Internationalisation multi-langues (FR, EN, AR, ES, TR, PT)

## Modules fonctionnels et état d'avancement

### 1. Authentification (`auth`) - 90%
- ✅ Inscription et connexion
- ✅ Protection des routes
- ⚠️ Manque: Récupération de mot de passe

### 2. Clients (`clients`) - 95%
- ✅ CRUD clients
- ✅ Questionnaires (cheveux/peau)
- ✅ Système de fidélité
- ⚠️ Manque: Export des données clients

### 3. Services (`services`) - 90%
- ✅ Gestion des services et produits
- ✅ Catégorisation
- ✅ Paramètres de réservation
- ⚠️ Manque: Statistiques de vente

### 4. Équipe (`team`) - 85%
- ✅ Gestion des membres
- ✅ Spécialités et compétences
- ⚠️ Manque: Gestion avancée des plannings
- ⚠️ Manque: Calcul des commissions

### 5. Rendez-vous (`appointments`) - 80%
- ✅ Création et gestion
- ✅ Vue calendrier
- ✅ Vérification de disponibilité
- ⚠️ Manque: Rappels automatiques
- ⚠️ Manque: Gestion des récurrences

### 6. Interface publique (`public`) - 85%
- ✅ Réservation en ligne
- ✅ Formulaire client
- ✅ Galerie de services
- ⚠️ Manque: Personnalisation avancée
- ⚠️ Manque: Intégration paiement en ligne

### 7. Abonnement (`subscription`) - 70%
- ✅ Gestion des plans
- ✅ Limites par fonctionnalité
- ⚠️ Manque: Intégration passerelle de paiement
- ⚠️ Manque: Gestion des factures

### 8. Interface (`interface`) - 90%
- ✅ Personnalisation des couleurs
- ✅ Gestion du logo
- ✅ Liens partageables
- ⚠️ Manque: Thèmes prédéfinis

## Points d'intégration critiques

### 1. Stockage des données
- Actuellement: localStorage (temporaire)
- À implémenter: API backend avec base de données
- Points d'intégration: Tous les stores Zustand (`store.ts` dans chaque module)

### 2. Gestion des fichiers
- Actuellement: Simulée via `fileService.ts`
- À implémenter: Service de stockage cloud (AWS S3, Firebase Storage)
- Points d'intégration: `ImageUpload.tsx`, `ServiceImageUpload.tsx`

### 3. Authentification
- Actuellement: Simulée localement
- À implémenter: JWT ou OAuth2 avec backend
- Points d'intégration: `auth/store.ts`, `AuthGuard.tsx`

### 4. Paiements
- Actuellement: Non implémenté
- À implémenter: Stripe, PayPal ou autre
- Points d'intégration: `subscription/store.ts`, interface publique

## Tâches prioritaires à finaliser

1. **Backend et API**
   - Créer API RESTful ou GraphQL
   - Implémenter modèles de données et migrations
   - Connecter les stores Zustand à l'API

2. **Authentification**
   - Implémenter JWT ou OAuth2
   - Ajouter récupération de mot de passe
   - Renforcer sécurité (rate limiting, protection CSRF)

3. **Gestion des fichiers**
   - Intégrer service de stockage cloud
   - Optimiser images (redimensionnement, compression)
   - Gérer quotas par plan d'abonnement

4. **Paiements**
   - Intégrer passerelle de paiement
   - Implémenter abonnements récurrents
   - Générer factures automatiques

5. **Notifications**
   - Ajouter notifications email/SMS
   - Implémenter rappels de rendez-vous
   - Créer système de notifications in-app

## Guide de déploiement

### Prérequis
- Node.js 16+
- npm ou yarn
- Base de données (PostgreSQL recommandé)
- Service de stockage cloud (AWS S3, Firebase)
- Compte passerelle de paiement (Stripe recommandé)

### Étapes de déploiement

1. **Préparation du frontend**
   ```bash
   # Installation des dépendances
   npm install
   
   # Build de production
   npm run build
   ```

2. **Configuration des variables d'environnement**
   - Créer fichier `.env.production`
   - Définir URLs API, clés services cloud, etc.

3. **Déploiement frontend**
   - Option 1: Vercel/Netlify (recommandé)
     - Connecter au repo Git
     - Configurer variables d'environnement
     - Déploiement automatique

   - Option 2: Serveur traditionnel
     - Copier dossier `dist` sur serveur
     - Configurer serveur web (Nginx, Apache)
     - Configurer HTTPS

4. **Déploiement backend**
   - Déployer API sur serveur ou service cloud
   - Configurer base de données
   - Exécuter migrations
   - Configurer CORS pour domaine frontend

5. **Post-déploiement**
   - Vérifier fonctionnement authentification
   - Tester flux de réservation complet
   - Configurer monitoring et alertes
   - Mettre en place sauvegardes automatiques

## Ressources et documentation

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [i18next Documentation](https://www.i18next.com/overview/getting-started)

---

Ce guide est destiné aux développeurs qui reprendront le projet Beauty Flow pour le finaliser à 100%. Il contient les informations essentielles sur l'architecture, les modules fonctionnels, les points d'intégration critiques et les tâches restantes à accomplir.
