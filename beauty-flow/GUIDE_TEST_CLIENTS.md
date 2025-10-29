# Guide de Test - Gestion des Clients avec API Backend

## 🎯 Objectif
Ce guide vous permet de tester la nouvelle intégration de la gestion des clients avec l'API backend.

## 📋 Prérequis

### 1. Démarrer le Backend
```bash
cd beauty-flow-backend
npm install
npm run dev
```
Le serveur doit être accessible sur `http://localhost:5000`

### 2. Démarrer le Frontend
```bash
cd beauty-flow
npm install
npm start
```
L'application doit être accessible sur `http://localhost:3000`

### 3. Vérifier la Base de Données
Assurez-vous que MongoDB est en cours d'exécution et accessible.

## 🧪 Tests Automatisés

### Test de l'API Backend
```bash
cd beauty-flow
node test-client-api.js
```

Ce script teste :
- ✅ Connexion au serveur
- ✅ Protection d'authentification
- ✅ Inscription d'un utilisateur
- ✅ CRUD complet des clients
- ✅ Sécurité des endpoints

## 🖱️ Tests Manuels Frontend

### 1. Authentification
1. Ouvrez `http://localhost:3000`
2. Créez un nouveau compte ou connectez-vous
3. Vérifiez que vous êtes redirigé vers le dashboard

### 2. Navigation vers les Clients
1. Cliquez sur "Clients" dans le menu de navigation
2. Vérifiez que la page se charge avec un indicateur de chargement
3. La liste des clients doit s'afficher (vide au début)

### 3. Création d'un Client
1. Cliquez sur "Ajouter" dans la page Clients
2. Remplissez le formulaire :
   - **Prénom** : Marie
   - **Nom** : Dupont
   - **Email** : marie.dupont@example.com
   - **Téléphone** : 0123456789
   - **Date de naissance** : 01/01/1990
   - **Adresse** : 123 Rue de la Paix, Paris
3. Remplissez les questionnaires (optionnel)
4. Cliquez sur "Enregistrer"
5. **Vérification** : Le client doit apparaître dans la liste

### 4. Modification d'un Client
1. Cliquez sur l'icône "Modifier" d'un client
2. Modifiez les informations (ex: ajoutez des notes)
3. Cliquez sur "Enregistrer"
4. **Vérification** : Les modifications doivent être visibles

### 5. Suppression d'un Client
1. Cliquez sur l'icône "Supprimer" d'un client
2. Confirmez la suppression
3. **Vérification** : Le client doit disparaître de la liste

### 6. Gestion des Erreurs
1. Déconnectez le backend (`Ctrl+C`)
2. Essayez de créer un client
3. **Vérification** : Un message d'erreur doit s'afficher
4. Redémarrez le backend
5. Rafraîchissez la page
6. **Vérification** : Les données doivent se recharger

## 🔍 Points de Vérification

### ✅ Fonctionnalités Testées
- [ ] Chargement initial des clients depuis l'API
- [ ] Création de clients avec persistance en base
- [ ] Modification de clients avec mise à jour en base
- [ ] Suppression de clients avec suppression en base
- [ ] Gestion des états de chargement
- [ ] Affichage des messages d'erreur
- [ ] Questionnaires cheveux et peau
- [ ] Préférences de communication
- [ ] Isolation des données par salon (multi-tenant)

### 🔧 Fonctionnalités Avancées
- [ ] Recherche de clients
- [ ] Filtrage par statut
- [ ] Points de fidélité
- [ ] Historique des visites
- [ ] Temps réel via WebSocket

## 🐛 Résolution de Problèmes

### Erreur "Network Error"
- Vérifiez que le backend est démarré
- Vérifiez l'URL de l'API dans `.env`
- Vérifiez les CORS dans le backend

### Erreur "401 Unauthorized"
- Déconnectez-vous et reconnectez-vous
- Vérifiez que le token JWT est valide
- Videz le localStorage si nécessaire

### Clients non affichés
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que MongoDB est connecté
- Vérifiez les logs du backend

### Données incohérentes
- Videz le localStorage : `localStorage.clear()`
- Redémarrez l'application
- Vérifiez le mapping des données dans le store

## 📊 Comparaison Avant/Après

### ❌ Avant (localStorage)
- Données perdues au rafraîchissement
- Pas de synchronisation entre onglets
- Pas de sécurité
- Pas de multi-utilisateurs

### ✅ Après (API Backend)
- Persistance réelle en base de données
- Synchronisation temps réel
- Authentification sécurisée
- Support multi-tenant
- Sauvegarde et récupération

## 🎉 Validation Finale

Si tous les tests passent, vous avez maintenant :
- ✅ Une gestion complète des clients via API
- ✅ Une persistance sécurisée des données
- ✅ Une architecture prête pour la production
- ✅ Une base solide pour les autres fonctionnalités

## 📞 Support

En cas de problème, vérifiez :
1. Les logs du backend dans la console
2. Les erreurs du frontend dans la console du navigateur
3. La connectivité à MongoDB
4. Les variables d'environnement

---

**Note** : Cette migration marque une étape importante vers une application complètement fonctionnelle avec backend !
