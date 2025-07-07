# Guide d'Intégration SATIM pour Beauty Flow

## 📋 Vue d'ensemble

Ce guide explique comment utiliser et tester l'intégration du système de paiement SATIM dans Beauty Flow pour les abonnements.

## 🔧 Configuration

### Variables d'environnement Backend

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
# Environnement de test SATIM
SATIM_TEST_USERNAME=SAT2507010254
SATIM_TEST_PASSWORD=satim120
SATIM_TEST_TERMINAL_ID=E010901571
SATIM_TEST_URL=https://test.satim.dz

# Environnement de production SATIM (à configurer avec vos vraies credentials)
SATIM_PROD_USERNAME=votre-username-production
SATIM_PROD_PASSWORD=votre-password-production
SATIM_PROD_TERMINAL_ID=votre-terminal-id-production
SATIM_PROD_URL=https://satim.dz
```

### URL Frontend

Assurez-vous que la variable `FRONTEND_URL` est correctement configurée :

```env
# Développement
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://votre-domaine.com
```

## 🚀 Flux de Paiement

### 1. Sélection du Plan
- L'utilisateur accède à la page `/subscription`
- Les plans FREE, STARTER, PRO et ENTERPRISE sont affichés
- Plan FREE : Activation immédiate sans paiement
- Plans STARTER/PRO : Ouverture du modal de paiement SATIM
- Plan ENTERPRISE : Redirection vers contact commercial

### 2. Processus de Paiement
1. **Initiation** : L'utilisateur clique sur "Procéder au paiement"
2. **Enregistrement** : Le backend enregistre la commande auprès de SATIM
3. **Redirection** : L'utilisateur est redirigé vers le formulaire SATIM
4. **Paiement** : L'utilisateur saisit ses informations de carte CIB
5. **Retour** : SATIM redirige vers votre application
6. **Confirmation** : Le backend vérifie le statut du paiement
7. **Activation** : L'abonnement est activé si le paiement est réussi

### 3. URLs de Retour
- **Succès** : `/subscription?success=true&plan=STARTER`
- **Échec** : `/subscription?error=payment_failed`

## 🧪 Test avec les Cartes SATIM

### Cartes de Test Disponibles

| Type | Numéro | Date Exp | CVV | Mot de passe | Résultat |
|------|---------|----------|-----|--------------|----------|
| Valide | 628058061006101101 | 01/2027 | 992 | 123456 | Paiement réussi |
| Solde insuffisant | 628058061006111001 | 01/2027 | 260 | 123456 | Échec - Solde insuffisant |
| Carte bloquée | 628058111000671201 | 01/2027 | 897 | 123456 | Échec - Carte bloquée |
| Carte expirée | 628058061005661512 | 12/2022 | 428 | 123456 | Échec - Carte expirée |

### Montants de Test

En environnement de test, les montants sont réduits :
- **STARTER** : 100 DZD (au lieu de 1900 DZD)
- **PRO** : 150 DZD (au lieu de 2400 DZD)

## 📊 Monitoring et Logs

### Logs Backend
Les logs sont disponibles dans `beauty-flow-backend/logs/` :
- `combined.log` : Tous les logs
- `error.log` : Erreurs uniquement

### Transactions
Les transactions sont stockées dans MongoDB avec les statuts :
- `pending` : En attente
- `processing` : En cours
- `completed` : Réussi
- `failed` : Échoué
- `refunded` : Remboursé

## 🔍 Endpoints API

### Initier un Paiement
```
POST /api/payment/satim/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "planType": "STARTER"
}
```

### Vérifier le Statut
```
GET /api/payment/transaction/{transactionId}/status
Authorization: Bearer {token}
```

### Historique des Transactions
```
GET /api/payment/transactions?status=completed&limit=10
Authorization: Bearer {token}
```

## 🐛 Dépannage

### Erreurs Courantes

1. **"Service de paiement temporairement indisponible"**
   - Vérifiez les variables d'environnement SATIM
   - Assurez-vous que les credentials sont corrects

2. **"Transaction non trouvée"**
   - Vérifiez que le transactionId est valide
   - Assurez-vous que l'utilisateur est authentifié

3. **"Le paiement a échoué"**
   - Consultez les logs pour plus de détails
   - Vérifiez le code d'erreur SATIM

### Codes d'Erreur SATIM

| Code | Description |
|------|-------------|
| 0 | Succès |
| 1 | Order ID vide |
| 2 | Déjà confirmé |
| 3 | Accès refusé |
| 6 | Commande inconnue |
| 7 | Erreur système |

## 🚀 Déploiement en Production

### Checklist
- [ ] Configurer les variables SATIM de production
- [ ] Obtenir la certification SATIM
- [ ] Tester avec de vraies cartes en environnement de test
- [ ] Configurer les URLs de retour en production
- [ ] Activer les logs de production
- [ ] Mettre en place le monitoring des transactions

### Sécurité
- Ne jamais logger les mots de passe ou informations sensibles
- Utiliser HTTPS en production
- Valider tous les retours SATIM côté serveur
- Implémenter des limites de taux sur les endpoints de paiement

## 📞 Support

Pour toute question sur l'intégration :
- Documentation SATIM : https://certweb.satim.dz
- Support technique : support@satim.dz
- Support Beauty Flow : support@saloneo.com

## 🔄 Workflow de Test Complet

1. **Connexion** : Connectez-vous à votre compte Beauty Flow
2. **Navigation** : Allez dans "Abonnement" depuis le menu
3. **Sélection** : Choisissez le plan STARTER ou PRO
4. **Modal** : Le modal de paiement s'ouvre
5. **Confirmation** : Cliquez sur "Procéder au paiement"
6. **SATIM** : Vous êtes redirigé vers la page SATIM
7. **Test** : Utilisez une carte de test (voir tableau ci-dessus)
8. **Retour** : Vous êtes redirigé vers Beauty Flow
9. **Résultat** : Page de succès ou d'échec selon le cas

## 📝 Notes Importantes

- Les paiements en mode test ne sont pas réels
- Les abonnements activés en test doivent être réinitialisés en production
- Conservez les logs de toutes les transactions pour audit
- Testez tous les scénarios (succès, échec, annulation) avant la production
