# Documentation Technique de Beauty Flow

<div align="center">
  <img src="https://via.placeholder.com/200x200.png?text=Beauty+Flow" alt="Beauty Flow Logo" width="200"/>
  <h3>Solution complète de gestion pour salons de coiffure</h3>
  <p>Version 1.0.0</p>
</div>

---

## Table des matières

1. [Introduction et Présentation](#1-introduction-et-présentation)
2. [Architecture Technique](#2-architecture-technique)
3. [Modules Fonctionnels](#3-modules-fonctionnels)
4. [Modèles de Données](#4-modèles-de-données)
5. [Gestion d'État](#5-gestion-détat)
6. [Flux Utilisateur](#6-flux-utilisateur)
7. [Internationalisation](#7-internationalisation)
8. [Système d'Abonnement](#8-système-dabonnement)
9. [Sécurité](#9-sécurité)
10. [Guide de Déploiement](#10-guide-de-déploiement)
11. [Feuille de Route](#11-feuille-de-route)
12. [Annexes](#12-annexes)

---

## 1. Introduction et Présentation

### 1.1 Qu'est-ce que Beauty Flow ?

Beauty Flow est une application web complète et moderne conçue spécifiquement pour la gestion des salons de coiffure et d'esthétique. Elle offre une suite d'outils intégrés permettant aux professionnels de la beauté de gérer efficacement tous les aspects de leur activité, de la prise de rendez-vous à la gestion des clients, en passant par l'administration des services et des équipes.

### 1.2 Objectifs et Avantages

Beauty Flow a été développée avec plusieurs objectifs clés :

- **Centralisation des données** : Regrouper toutes les informations essentielles du salon en un seul endroit
- **Optimisation du temps** : Automatiser les tâches répétitives pour permettre aux professionnels de se concentrer sur leur métier
- **Amélioration de l'expérience client** : Offrir des services en ligne comme la réservation et le suivi des rendez-vous
- **Personnalisation poussée** : Adapter l'application aux besoins spécifiques de chaque salon
- **Analyse et statistiques** : Fournir des insights précieux pour optimiser l'activité

Les principaux avantages de Beauty Flow incluent :

- Interface utilisateur intuitive et moderne
- Système de réservation en ligne disponible 24/7
- Gestion détaillée des profils clients avec historique complet
- Système de fidélité intégré
- Support multilingue pour une clientèle internationale
- Architecture évolutive adaptée aux salons de toutes tailles

### 1.3 Public Cible et Cas d'Utilisation

Beauty Flow s'adresse principalement à :

- **Salons de coiffure indépendants**
- **Chaînes de salons multi-sites**
- **Barbershops**
- **Instituts de beauté**
- **Spas proposant des services capillaires**

Cas d'utilisation typiques :

1. **Gestion quotidienne des rendez-vous** : Un réceptionniste utilise l'application pour planifier, modifier ou annuler des rendez-vous en temps réel.
2. **Réservation en ligne** : Un client réserve un rendez-vous depuis son smartphone en dehors des heures d'ouverture.
3. **Suivi client personnalisé** : Un coiffeur consulte l'historique détaillé d'un client pour adapter ses recommandations.
4. **Analyse de performance** : Un gérant de salon examine les statistiques mensuelles pour identifier les services les plus rentables.
5. **Gestion d'équipe** : Un manager organise les plannings de son équipe en fonction des compétences et disponibilités.

## 2. Architecture Technique

### 2.1 Stack Technologique

Beauty Flow est développée avec des technologies modernes et robustes :

| Catégorie | Technologies | Versions |
|-----------|--------------|----------|
| **Frontend** | React | 18.2.0 |
| | TypeScript | 5.0.2 |
| | Vite | 4.4.5 |
| **Styling** | TailwindCSS | 3.3.3 |
| | PostCSS | 8.4.29 |
| **État** | Zustand | 4.4.1 |
| | Zustand/middleware | 4.4.1 |
| **Routing** | React Router | 6.15.0 |
| **Formulaires** | React Hook Form | 7.45.4 |
| **Internationalisation** | i18next | 23.4.9 |
| | react-i18next | 13.2.2 |
| **Utilitaires** | date-fns | 2.30.0 |
| | uuid | 9.0.0 |
| **Tests** | Vitest | 0.34.3 |
| | Testing Library | 14.0.0 |

### 2.2 Structure du Projet

Beauty Flow suit une architecture modulaire organisée par fonctionnalités (feature-based), ce qui facilite la maintenance et l'évolutivité du code :

```
beauty-flow/
├── public/                 # Fichiers statiques et traductions publiques
│   ├── locales/            # Fichiers de traduction publics (par langue)
│   └── ...
├── src/
│   ├── assets/             # Images et ressources statiques
│   ├── components/         # Composants partagés réutilisables
│   │   ├── CurrencySelector.tsx
│   │   ├── DirectionProvider.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── LoadingFallback.tsx
│   │   ├── Toast.tsx
│   │   ├── UserMenu.tsx
│   │   └── ...
│   ├── contexts/           # Contextes React pour l'état global
│   │   └── DirectionContext.ts
│   ├── features/           # Modules fonctionnels (organisation par domaine)
│   │   ├── appointments/   # Gestion des rendez-vous
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store.ts
│   │   │   ├── types.ts
│   │   │   └── ...
│   │   ├── auth/           # Authentification
│   │   ├── clients/        # Gestion des clients
│   │   ├── interface/      # Personnalisation de l'interface
│   │   ├── profile/        # Gestion du profil
│   │   ├── public/         # Interface publique
│   │   ├── services/       # Gestion des services
│   │   ├── subscription/   # Gestion des abonnements
│   │   └── team/           # Gestion de l'équipe
│   ├── hooks/              # Hooks personnalisés
│   │   └── useDirection.ts
│   ├── layouts/            # Layouts de l'application
│   │   └── MainLayout.tsx
│   ├── locales/            # Fichiers de traduction source
│   │   ├── fr/
│   │   ├── en/
│   │   └── ...
│   ├── services/           # Services partagés
│   │   └── fileService.ts
│   ├── App.tsx             # Composant racine
│   ├── i18n.ts             # Configuration i18next
│   ├── index.css           # Styles globaux
│   ├── index.tsx           # Point d'entrée React
│   └── main.tsx            # Point d'entrée Vite
├── scripts/                # Scripts utilitaires
├── .gitignore
├── index.html              # Template HTML
├── package.json            # Dépendances et scripts
├── postcss.config.js       # Configuration PostCSS
├── tailwind.config.js      # Configuration Tailwind
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite
└── vitest.config.ts        # Configuration Vitest
```

### 2.3 Patterns de Conception

Beauty Flow implémente plusieurs patterns de conception pour assurer une architecture robuste et maintenable :

#### 2.3.1 Feature-First Architecture

L'application est organisée par fonctionnalités plutôt que par types de fichiers, ce qui permet une meilleure cohésion et facilite la compréhension du code. Chaque module fonctionnel (feature) contient tous les éléments nécessaires à son fonctionnement (composants, hooks, store, types, etc.).

#### 2.3.2 Flux de Données Unidirectionnel

Beauty Flow utilise un flux de données unidirectionnel avec Zustand, où :
- Les stores centralisent l'état et la logique métier
- Les composants consomment l'état et déclenchent des actions
- Les actions mettent à jour l'état, ce qui provoque le re-rendu des composants

#### 2.3.3 Composition de Composants

L'application favorise la composition de composants plutôt que l'héritage, avec :
- Des composants de présentation (UI pure)
- Des composants conteneurs (logique et état)
- Des Higher-Order Components (HOC) pour la réutilisation de logique

#### 2.3.4 Hooks Personnalisés

Des hooks personnalisés encapsulent la logique réutilisable, comme :
- `useDirection` pour la gestion des langues RTL/LTR
- `useSubscriptionLimits` pour vérifier les limites d'abonnement
- `useAppointmentForm` pour la logique des formulaires de rendez-vous

#### 2.3.5 Middleware Pattern

Zustand utilise des middlewares pour étendre ses fonctionnalités :
- `persist` pour la persistance dans le localStorage
- Middleware personnalisé pour la validation des données

### 2.4 Diagrammes d'Architecture

#### 2.4.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                      Interface Utilisateur                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Composants  │  │   Layouts   │  │ Pages/Fonctionnalités│  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Gestion d'État                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Stores    │  │    Hooks    │  │      Contextes      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Services Partagés                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │FileService  │  │    i18n     │  │  Autres Services    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Stockage Local                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ localStorage│  │SessionStorage│  │     IndexedDB      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 2.4.2 Flux de Données

```
┌──────────────┐    Actions     ┌──────────────┐
│              │───────────────▶│              │
│  Composants  │                │    Stores    │
│              │◀───────────────│              │
└──────────────┘   État mis à   └──────────────┘
                      jour            │
                                      │ Persistance
                                      ▼
                              ┌──────────────┐
                              │  localStorage │
                              └──────────────┘
```

## 3. Modules Fonctionnels

### 3.1 Module d'Authentification (`auth`)

Le module d'authentification gère l'inscription, la connexion et la sécurisation des routes de l'application.

#### 3.1.1 Fonctionnalités

- Inscription avec validation des données
- Connexion avec gestion des sessions
- Protection des routes privées
- Gestion des rôles et permissions

#### 3.1.2 Composants Principaux

- `LoginForm` : Formulaire de connexion
- `RegisterForm` : Formulaire d'inscription
- `AuthGuard` : HOC pour protéger les routes
- `AuthLayout` : Layout pour les pages d'authentification

#### 3.1.3 Store et État

Le store d'authentification (`useAuthStore`) gère :
- L'état de connexion de l'utilisateur
- Les informations de l'utilisateur connecté
- Les tokens d'authentification
- Les erreurs d'authentification

#### 3.1.4 Interactions avec d'autres modules

- Interagit avec le module `profile` pour récupérer les informations de l'utilisateur
- Contrôle l'accès aux autres modules via `AuthGuard`

### 3.2 Module de Gestion des Clients (`clients`)

Ce module permet de gérer la base de clients du salon avec des informations détaillées et un historique complet.

#### 3.2.1 Fonctionnalités

- Création et modification de profils clients
- Questionnaires détaillés sur les cheveux et la peau
- Système de fidélité avec points
- Historique des rendez-vous et achats
- Recherche et filtrage avancés

#### 3.2.2 Composants Principaux

- `ClientForm` : Formulaire de création/modification de client
- `ClientList` : Liste paginée des clients avec recherche
- `ClientDetail` : Vue détaillée d'un client
- `LoyaltyManager` : Gestion des points de fidélité

#### 3.2.3 Store et État

Le store clients (`useClientStore`) gère :
- La liste des clients
- L'historique des clients
- Les opérations CRUD sur les clients
- Le système de fidélité

#### 3.2.4 Modèles de Données Clés

```typescript
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  notes?: string;
  preferences: {
    favoriteServices: string[];
    preferredStylists: string[];
    hairQuestionnaire?: HairQuestionnaire;
    skinQuestionnaire?: SkinQuestionnaire;
    communicationPreferences: CommunicationPreferences;
  };
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  lastVisit?: string;
}

interface ClientHistory {
  clientId: string;
  appointments: string[];
  purchases: Purchase[];
  loyaltyHistory: LoyaltyTransaction[];
}
```

### 3.3 Module de Gestion des Services (`services`)

Ce module permet de gérer les services et produits proposés par le salon.

#### 3.3.1 Fonctionnalités

- Création et modification de services avec durée et prix
- Catégorisation des services
- Gestion des produits utilisés pour chaque service
- Paramètres de réservation en ligne
- Gestion des images et descriptions

#### 3.3.2 Composants Principaux

- `ServiceForm` : Formulaire de création/modification de service
- `ServiceList` : Liste des services avec filtrage par catégorie
- `ServiceOnlineSettings` : Configuration de la disponibilité en ligne
- `ServiceImageUpload` : Gestion des images de service
- `ProductForm` et `ProductList` : Gestion des produits

#### 3.3.3 Store et État

Le store services (`useServiceStore`) gère :
- La liste des services
- La liste des produits
- Les catégories de services
- Les paramètres de réservation en ligne

#### 3.3.4 Captures d'écran

![Service List](https://via.placeholder.com/800x400.png?text=Service+List+Screenshot)
*Figure 3.1: Interface de gestion des services*

### 3.4 Module de Gestion de l'Équipe (`team`)

Ce module permet de gérer les membres de l'équipe du salon, leurs compétences et leurs horaires.

#### 3.4.1 Fonctionnalités

- Création et modification de profils de membres d'équipe
- Gestion des spécialités et niveaux de compétence
- Planification des horaires de travail avec pauses
- Gestion des congés et absences

#### 3.4.2 Composants Principaux

- `TeamMemberForm` : Formulaire de création/modification de membre
- `TeamList` : Liste des membres de l'équipe
- `ScheduleManager` : Gestion des horaires et disponibilités
- `SpecialtyManager` : Gestion des compétences et services associés

#### 3.4.3 Store et État

Le store équipe (`useTeamStore`) gère :
- La liste des membres de l'équipe
- Les horaires et disponibilités
- Les spécialités et niveaux de compétence
- Les congés et absences

### 3.5 Module de Gestion des Rendez-vous (`appointments`)

Ce module est au cœur de l'application et permet de gérer tous les aspects des rendez-vous.

#### 3.5.1 Fonctionnalités

- Création, modification et annulation de rendez-vous
- Vérification de disponibilité des créneaux
- Système de pré-réservation temporaire
- Historique et statistiques des rendez-vous
- Politique d'annulation configurable
- Vue calendrier et vue liste

#### 3.5.2 Composants Principaux

- `AppointmentForm` : Formulaire de création/modification de rendez-vous
- `AppointmentList` : Liste des rendez-vous avec filtrage
- `CalendarView` : Vue calendrier des rendez-vous
- `AppointmentSettings` : Configuration des paramètres de rendez-vous
- `AppointmentHistoryPage` : Historique des rendez-vous

#### 3.5.3 Store et État

Le store rendez-vous (`useAppointmentStore`) gère :
- La liste des rendez-vous
- Les pré-réservations temporaires
- La vérification de disponibilité
- Les modifications et annulations
- Les statistiques et l'historique

#### 3.5.4 Algorithmes Clés

- **Vérification de disponibilité** : Algorithme qui vérifie si un créneau est disponible en tenant compte des rendez-vous existants, des pré-réservations et des temps tampons.
- **Génération de créneaux** : Algorithme qui génère les créneaux disponibles pour un jour et un styliste donnés.
- **Détection de chevauchement** : Algorithme qui détecte si deux rendez-vous se chevauchent.

### 3.6 Module d'Interface Publique (`public`)

Ce module fournit l'interface publique du salon, permettant aux clients de réserver et gérer leurs rendez-vous en ligne.

#### 3.6.1 Fonctionnalités

- Page de salon personnalisable
- Réservation en ligne pour les clients
- Recherche et gestion des rendez-vous par les clients
- Formulaire client détaillé pour les nouveaux clients
- Galerie de services avec images et descriptions

#### 3.6.2 Composants Principaux

- `SalonPage` : Page d'accueil publique du salon
- `PublicBookingFlow` : Processus de réservation en ligne
- `PublicClientForm` : Formulaire client pour les nouveaux clients
- `PublicAppointmentManager` : Gestion des rendez-vous par les clients
- `ServiceGallery` : Galerie des services disponibles

#### 3.6.3 Store et État

Le store public (`usePublicBookingStore`) gère :
- Le processus de réservation en plusieurs étapes
- La validation des données de réservation
- La création de rendez-vous et de clients
- La recherche et la gestion des rendez-vous existants

#### 3.6.4 Flux de Réservation

1. Sélection du service
2. Sélection de la date et l'heure
3. Saisie des informations client
4. Confirmation de la réservation
5. Réception des détails de confirmation

### 3.7 Module de Personnalisation de l'Interface (`interface`)

Ce module permet de personnaliser l'apparence et le comportement de l'application.

#### 3.7.1 Fonctionnalités

- Personnalisation des couleurs et thèmes
- Gestion du logo et de la bannière
- Configuration des paramètres d'affichage
- Génération de liens partageables pour la page publique

#### 3.7.2 Composants Principaux

- `ColorPicker` : Sélecteur de couleurs pour le thème
- `ImageUpload` : Gestion des images (logo, bannière)
- `DisplaySettings` : Configuration des paramètres d'affichage
- `ShareableLink` : Génération et gestion des liens partageables

#### 3.7.3 Store et État

Le store interface (`useInterfaceStore`) gère :
- Les paramètres de thème et couleurs
- Les images (logo, bannière)
- Les paramètres d'affichage
- Les liens partageables

### 3.8 Module d'Abonnement (`subscription`)

Ce module gère les différents plans d'abonnement et leurs limites.

#### 3.8.1 Fonctionnalités

- Gestion des plans d'abonnement
- Application des limites selon le plan
- Mise à jour du plan d'abonnement
- Statistiques d'utilisation

#### 3.8.2 Composants Principaux

- `SubscriptionPage` : Page de gestion de l'abonnement
- `PlanCard` : Carte présentant un plan d'abonnement
- `LimitedForms` : Formulaires avec limites d'abonnement
- `withSubscriptionLimits` : HOC pour appliquer les limites

#### 3.8.3 Store et État

Le store abonnement (`useSubscriptionStore`) gère :
- Le plan d'abonnement actuel
- Les limites d'utilisation
- Les statistiques d'utilisation
- La vérification des limites

## 4. Modèles de Données

### 4.1 Client

```typescript
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  preferences: {
    favoriteServices: string[];
    preferredStylists: string[];
    hairQuestionnaire?: HairQuestionnaire;
    skinQuestionnaire?: SkinQuestionnaire;
    communicationPreferences: CommunicationPreferences;
  };
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  lastVisit?: string;
}

interface HairQuestionnaire {
  hairType: 'Raides' | 'Ondulés' | 'Bouclés' | 'Crépus';
  thickness: 'Fins' | 'Moyens' | 'Épais';
  scalpCondition: 'Normal' | 'Sec' | 'Gras' | 'Sensible' | 'Pellicules';
  porosity: 'Faible' | 'Moyenne' | 'Élevée';
  chemicalTreatments: string[];
  hairProblems: string[];
  currentProducts: string;
  allergies: string;
}

interface SkinQuestionnaire {
  skinType: 'Normale' | 'Sèche' | 'Grasse' | 'Mixte' | 'Sensible';
  sensitivity: 'Pas sensible' | 'Légèrement sensible' | 'Très sensible';
  skinProblems: string[];
  mainConcernArea: string[];
  currentProducts: string;
  allergies: string;
  pastReactions: string;
}

interface CommunicationPreferences {
  smsReminders: boolean;
  emailMarketing: boolean;
  birthdayOffers: boolean;
}

interface ClientHistory {
  clientId: string;
  appointments: string[];
  purchases: Purchase[];
  loyaltyHistory: LoyaltyTransaction[];
}

interface LoyaltyTransaction {
  id: string;
  date: string;
  type: 'earn' | 'redeem';
  points: number;
  reason: string;
}

interface Purchase {
  id: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  paymentMethod: string;
}

interface PurchaseItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  quantity: number;
  price: number;
}
```

### 4.2 Service

```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutes
  price: number;
  category: string;
  image?: string;
  products: ServiceProduct[];
  isActive: boolean;
}

interface ServiceProduct {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
  image?: string;
  isActive: boolean;
}

interface ServiceSettings {
  id: string; // serviceId
  isOnline: boolean;
  displayOrder: number;
  requiresConsultation: boolean;
  allowedStylists: string[]; // stylistIds
}
```

### 4.3 TeamMember

```typescript
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  bio?: string;
  image?: string;
  specialties: Specialty[];
  schedule: Schedule;
  isActive: boolean;
}

interface Specialty {
  serviceId: string;
  level: 'Débutant' | 'Intermédiaire' | 'Expert';
}

interface Schedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface DaySchedule {
  isWorking: boolean;
  shifts: Shift[];
}

interface Shift {
  start: string; // format HH:mm
  end: string; // format HH:mm
}

interface TimeOff {
  id: string;
  stylistId: string;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved: boolean;
}
```

### 4.4 Appointment

```typescript
interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  serviceName: string;
  stylistId: string;
  date: string; // format YYYY-MM-DD
  startTime: string; // format HH:mm
  endTime: string; // format HH:mm
  status: AppointmentStatus;
  notes?: string;
  publicToken?: string; // Pour accès public
  modificationToken?: string; // Pour modification/annulation
  lastModified?: string;
  cancellationReason?: string;
  clientInfo?: ClientSearchInfo; // Infos client pour rendez-vous publics
}

type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'noShow' 
  | 'rescheduled';

interface PreBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  stylistId: string;
  timestamp: string;
}

interface AppointmentModification {
  appointmentId: string;
  modificationToken: string;
  newDate?: string;
  newStartTime?: string;
  newStylistId?: string;
  modifiedAt: string;
}

interface PublicAppointmentAccess {
  appointmentId: string;
  publicToken: string;
  expiresAt: string;
}

interface CancellationPolicy {
  minHoursBeforeAppointment: number;
  maxReschedulesAllowed: number;
  cancellationFee: number;
}

interface AppointmentSettings {
  bufferTimeBetweenAppointments: number;
}

interface ClientSearchInfo {
  firstName: string;
  lastName: string;
  phone: string;
}
```

