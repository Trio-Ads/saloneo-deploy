# 📧 Guide du Système d'Emails - Beauty Flow

## 🚀 Vue d'ensemble

Le système d'emails de Beauty Flow est conçu pour gérer automatiquement toutes les communications par email avec les utilisateurs et les clients. Il comprend :

- **Emails transactionnels** : Confirmations, rappels, notifications
- **Emails d'abonnement** : Gestion des plans, limites, expirations
- **Emails marketing** : Newsletters, offres, fidélité
- **Emails automatisés** : Cron jobs pour les envois programmés

## 📋 Configuration

### Variables d'environnement requises

```env
# Configuration SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM="Beauty Flow <noreply@beautyflow.com>"

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/beauty-flow
```

### Configuration Gmail

1. Activez la vérification en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application :
   - Allez dans les paramètres de sécurité Google
   - Sélectionnez "Mots de passe des applications"
   - Créez un nouveau mot de passe pour "Mail"
   - Utilisez ce mot de passe dans `SMTP_PASS`

## 🧪 Test du système

### Installation et compilation

```bash
cd beauty-flow-backend
npm install
npm run build
```

### Lancer le test interactif

```bash
node test-email-system.js
```

Le script vous permet de :
- Tester chaque type d'email individuellement
- Envoyer tous les emails d'un coup
- Utiliser votre propre adresse email pour les tests

## 📨 Types d'emails disponibles

### 1. Abonnements & Comptes

| Email | Déclencheur | Description |
|-------|-------------|-------------|
| Bienvenue | Inscription | Guide de démarrage pour nouveaux utilisateurs |
| Confirmation d'abonnement | Souscription/Upgrade | Détails du plan choisi |
| Reçu de paiement | Paiement réussi | Facture détaillée |
| Rappel d'expiration | 7, 3, 1 jour avant | Notification proactive |
| Abonnement expiré | Date d'expiration | Options de renouvellement |
| Limite atteinte | 80% et 100% | Alerte d'utilisation |
| Upgrade suggéré | Limites fréquentes | Proposition de plan supérieur |
| Compte suspendu | Paiement échoué | Information de suspension |
| Compte réactivé | Renouvellement | Confirmation de réactivation |

### 2. Rendez-vous

| Email | Déclencheur | Description |
|-------|-------------|-------------|
| Confirmation | Nouvelle réservation | Détails du rendez-vous |
| Rappel J-1 | 24h avant (9h) | Rappel la veille |
| Rappel H-2 | 2h avant | Rappel le jour même |
| Modification | Changement | Nouveaux détails |
| Annulation | Annulation | Confirmation d'annulation |

### 3. Authentification

| Email | Déclencheur | Description |
|-------|-------------|-------------|
| Vérification | Inscription | Lien de vérification |
| Réinitialisation | Demande reset | Lien de réinitialisation |
| Connexion suspecte | Nouvelle IP/appareil | Alerte de sécurité |

### 4. Affiliation

| Email | Déclencheur | Description |
|-------|-------------|-------------|
| Activation | Activation programme | Code affilié et guide |
| Commission gagnée | Nouveau parrainage | Montant gagné |
| Paiement effectué | Virement commission | Confirmation paiement |
| Rapport mensuel | 1er du mois | Performance du mois |

### 5. Marketing

| Email | Déclencheur | Description |
|-------|-------------|-------------|
| Newsletter | 1er du mois | Actualités et conseils |
| Offre spéciale | Manuel/Saisonnier | Promotions |
| Anniversaire | Date anniversaire | Offre personnalisée |
| Fidélité - Bienvenue | Inscription programme | Guide du programme |
| Fidélité - Update | Lundi (hebdo) | Points et récompenses |
| Récompense gagnée | Échange points | Code de réduction |
| Réengagement | 3 mois inactivité | Offre de retour |

## 🔧 Intégration dans l'application

### Exemple d'utilisation

```typescript
import { subscriptionEmailService } from './services/subscriptionEmailService';
import { marketingEmailService } from './services/marketingEmailService';

// Envoyer un email de bienvenue
await subscriptionEmailService.sendWelcomeEmail(userId);

// Envoyer une confirmation de rendez-vous
await subscriptionEmailService.sendAppointmentConfirmation(appointmentId);

// Envoyer une offre spéciale
await marketingEmailService.sendSpecialOffer(userId, {
  title: 'Offre Été -20%',
  description: 'Profitez de notre offre estivale',
  discount: 20,
  validUntil: new Date('2025-08-31'),
  code: 'ETE2025'
});
```

### Cron Jobs automatiques

Les tâches suivantes s'exécutent automatiquement :

- **Quotidien (9h)** :
  - Vérification des abonnements expirants
  - Envoi des rappels J-1
  - Emails d'anniversaire

- **Toutes les heures** :
  - Vérification des limites d'utilisation

- **Toutes les 30 minutes** :
  - Rappels H-2 pour les rendez-vous

- **Mensuel (1er du mois, 10h)** :
  - Newsletter mensuelle
  - Rapports de performance affiliation

- **Hebdomadaire (Lundi, 10h)** :
  - Mises à jour du programme de fidélité

## 🎨 Templates d'emails

Les templates sont définis dans `emailService.ts` et incluent :

- **HTML** : Version stylée avec logo et mise en page
- **Texte** : Version alternative pour les clients email basiques
- **Multi-langue** : Support FR/EN/AR (extensible)

### Structure d'un template

```typescript
{
  subject: 'Bienvenue sur Beauty Flow',
  html: `
    <div style="font-family: Arial, sans-serif;">
      <h1>Bienvenue ${userName} !</h1>
      <p>Votre salon ${salonName} est maintenant actif.</p>
      <!-- Contenu HTML -->
    </div>
  `,
  text: `
    Bienvenue ${userName} !
    Votre salon ${salonName} est maintenant actif.
    // Contenu texte
  `
}
```

## 🛠️ Dépannage

### Emails non reçus

1. **Vérifiez les spams** : Les emails peuvent être filtrés
2. **Configuration SMTP** : Vérifiez les variables d'environnement
3. **Logs** : Consultez `logs/error.log` pour les erreurs
4. **Limites Gmail** : 500 emails/jour pour les comptes gratuits

### Erreurs communes

| Erreur | Solution |
|--------|----------|
| `Invalid login` | Vérifiez SMTP_USER et SMTP_PASS |
| `Connection timeout` | Vérifiez SMTP_HOST et SMTP_PORT |
| `User not found` | Vérifiez que l'ID utilisateur existe |
| `Template not found` | Vérifiez le nom du template |

## 📊 Monitoring

### Métriques à suivre

- Taux d'ouverture des emails
- Taux de clic sur les CTA
- Désabonnements newsletter
- Conversions (upgrades, réservations)

### Logs

Tous les envois sont loggés dans :
- `logs/combined.log` : Tous les logs
- `logs/error.log` : Erreurs uniquement

## 🚀 Améliorations futures

1. **Analytics** : Intégration avec SendGrid/Mailgun pour tracking
2. **A/B Testing** : Tests de différentes versions
3. **Personnalisation** : Templates personnalisables par salon
4. **SMS** : Notifications SMS en complément
5. **Push** : Notifications push web/mobile

## 📞 Support

Pour toute question sur le système d'emails :
- Documentation : Ce guide
- Logs : `/logs` pour le debugging
- Test : `test-email-system.js` pour vérifier

---

*Dernière mise à jour : Janvier 2025*
