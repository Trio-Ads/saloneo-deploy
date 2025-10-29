/**
 * Script FONCTIONNEL - Envoi des 28 templates d'emails UN PAR UN
 * Basé sur test-all-emails-simple.js qui fonctionne
 */

require('dotenv').config({ path: '.env.email' });
const nodemailer = require('nodemailer');

const TEST_EMAIL = 'hani.mazouni@gmail.com';
const DELAY_BETWEEN_EMAILS = 3000; // 3 secondes entre chaque email

console.log('\n🚀 ENVOI DES 28 TEMPLATES EMAIL - UN PAR UN\n');
console.log('Configuration:');
console.log('- Host:', process.env.SMTP_HOST);
console.log('- Port:', process.env.SMTP_PORT);
console.log('- User:', process.env.SMTP_USER);
console.log('- Destinataire:', TEST_EMAIL);
console.log('\n' + '='.repeat(80) + '\n');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Styles de base pour tous les emails
const baseStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
  .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
  .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
  .content { padding: 30px; background: white; }
  .content h2 { color: #667eea; margin-top: 0; }
  .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 12px; border-top: 1px solid #eee; }
  .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  .info-box { background: #f8f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
  .alert-box { background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #ffc107; }
  .success-box { background: #d4edda; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #28a745; }
  .warning-box { background: #f8d7da; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #dc3545; }
`;

// Fonction pour créer un email
function createEmail(title, content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Saloneo - Test Email</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p><strong>Saloneo</strong> - Plateforme de gestion pour salons</p>
      <p>&copy; 2025 Saloneo. Tous droits réservés.</p>
      <p><small>Email de test envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>
    </div>
  </div>
</body>
</html>`;
}

// Liste des 28 emails à envoyer
const emails = [
  // RENDEZ-VOUS (4)
  {
    name: '1. appointment-confirmation',
    subject: '✅ Confirmation de rendez-vous',
    html: createEmail('✅ Confirmation de rendez-vous', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre rendez-vous a été confirmé avec succès !</p>
      <div class="info-box">
        <p><strong>📅 Date:</strong> 20 Janvier 2025</p>
        <p><strong>🕐 Heure:</strong> 14:30</p>
        <p><strong>💇 Service:</strong> Coupe + Brushing</p>
        <p><strong>👤 Avec:</strong> Marie Dupont</p>
        <p><strong>💰 Prix:</strong> 3500 DZD</p>
      </div>
    `)
  },
  {
    name: '2. appointment-reminder',
    subject: '⏰ Rappel de rendez-vous',
    html: createEmail('⏰ Rappel de rendez-vous', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Nous vous rappelons votre rendez-vous demain :</p>
      <div class="alert-box">
        <p><strong>📅 Date:</strong> 20 Janvier 2025 à 14:30</p>
        <p><strong>💇 Service:</strong> Coupe + Brushing</p>
      </div>
    `)
  },
  {
    name: '3. appointment-cancellation',
    subject: '❌ Annulation de rendez-vous',
    html: createEmail('❌ Annulation de rendez-vous', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre rendez-vous a été annulé.</p>
      <div class="warning-box">
        <p><strong>📅 Date:</strong> 20 Janvier 2025 à 14:30</p>
      </div>
    `)
  },
  {
    name: '4. appointment-modification',
    subject: '🔄 Modification de rendez-vous',
    html: createEmail('🔄 Modification de rendez-vous', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre rendez-vous a été modifié.</p>
      <div class="info-box">
        <p><strong>Nouveau:</strong> 20 Janvier 2025 à 14:30</p>
      </div>
    `)
  },
  
  // AUTHENTIFICATION (3)
  {
    name: '5. email-verification',
    subject: '✉️ Vérification d\'email',
    html: createEmail('✉️ Vérification d\'email', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Veuillez vérifier votre adresse email.</p>
      <div class="info-box">
        <p style="text-align: center;">
          <a href="#" class="button">Vérifier mon email</a>
        </p>
      </div>
    `)
  },
  {
    name: '6. password-reset',
    subject: '🔐 Réinitialisation de mot de passe',
    html: createEmail('🔐 Réinitialisation de mot de passe', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Cliquez pour réinitialiser votre mot de passe.</p>
      <div class="info-box">
        <p style="text-align: center;">
          <a href="#" class="button">Réinitialiser</a>
        </p>
      </div>
    `)
  },
  {
    name: '7. suspicious-login-alert',
    subject: '🔒 Alerte de connexion suspecte',
    html: createEmail('🔒 Alerte de connexion suspecte', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Une connexion inhabituelle a été détectée.</p>
      <div class="warning-box">
        <p><strong>📍 Localisation:</strong> Alger, Algérie</p>
        <p><strong>🖥️ Appareil:</strong> Chrome sur Windows</p>
      </div>
    `)
  },
  
  // ABONNEMENTS (6)
  {
    name: '8. subscription-welcome',
    subject: '🎉 Bienvenue sur Saloneo',
    html: createEmail('🎉 Bienvenue sur Saloneo', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Merci d'avoir choisi Saloneo !</p>
      <div class="success-box">
        <p><strong>✅ Votre abonnement Premium est actif</strong></p>
      </div>
    `)
  },
  {
    name: '9. subscription-expiry-reminder',
    subject: '⏰ Votre abonnement expire bientôt',
    html: createEmail('⏰ Votre abonnement expire bientôt', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre abonnement expire dans <strong>3 jours</strong>.</p>
      <div class="alert-box">
        <p><strong>📅 Date d'expiration:</strong> 1er Février 2025</p>
      </div>
    `)
  },
  {
    name: '10. subscription-expired',
    subject: '⚠️ Votre abonnement a expiré',
    html: createEmail('⚠️ Votre abonnement a expiré', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre abonnement Premium a expiré.</p>
      <div class="warning-box">
        <p>Renouvelez pour retrouver tous vos avantages.</p>
      </div>
    `)
  },
  {
    name: '11. subscription-limit-reached',
    subject: '⚠️ Limite atteinte',
    html: createEmail('⚠️ Limite atteinte', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Vous avez atteint les limites de votre plan.</p>
      <div class="alert-box">
        <p><strong>📅 Rendez-vous:</strong> 50/50 (100%)</p>
      </div>
    `)
  },
  {
    name: '12. subscription-upgrade',
    subject: '🚀 Mise à niveau réussie',
    html: createEmail('🚀 Mise à niveau réussie', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Vous êtes passé au plan <strong>Premium</strong> !</p>
      <div class="success-box">
        <p>✅ Votre nouveau plan est actif</p>
      </div>
    `)
  },
  {
    name: '13. upgrade-suggestion',
    subject: '💡 Suggestion de mise à niveau',
    html: createEmail('💡 Suggestion de mise à niveau', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Le plan Premium pourrait mieux répondre à vos besoins.</p>
    `)
  },
  
  // PAIEMENTS (1)
  {
    name: '14. payment-receipt',
    subject: '💳 Reçu de paiement',
    html: createEmail('💳 Reçu de paiement', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Nous confirmons la réception de votre paiement.</p>
      <div class="success-box">
        <p><strong>💰 Montant:</strong> 15000 DZD</p>
        <p><strong>🔖 Transaction:</strong> TXN-2025-001</p>
      </div>
    `)
  },
  
  // COMPTE (2)
  {
    name: '15. account-suspended',
    subject: '⚠️ Compte suspendu',
    html: createEmail('⚠️ Compte suspendu', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre compte a été temporairement suspendu.</p>
      <div class="warning-box">
        <p><strong>Raison:</strong> Paiement en attente</p>
      </div>
    `)
  },
  {
    name: '16. account-reactivated',
    subject: '✅ Compte réactivé',
    html: createEmail('✅ Compte réactivé', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre compte Saloneo a été réactivé !</p>
      <div class="success-box">
        <p>Vous pouvez à nouveau accéder à toutes les fonctionnalités.</p>
      </div>
    `)
  },
  
  // AFFILIATION (4)
  {
    name: '17. affiliation-activation',
    subject: '🤝 Programme d\'affiliation activé',
    html: createEmail('🤝 Programme d\'affiliation activé', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre compte affilié est maintenant actif !</p>
      <div class="success-box">
        <p><strong>🔗 Code:</strong> HANI2025</p>
        <p><strong>💰 Commission:</strong> 10%</p>
      </div>
    `)
  },
  {
    name: '18. commission-earned',
    subject: '💰 Nouvelle commission gagnée',
    html: createEmail('💰 Nouvelle commission gagnée', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Vous avez gagné une nouvelle commission !</p>
      <div class="success-box">
        <p><strong>💵 Montant:</strong> 1500 DZD</p>
      </div>
    `)
  },
  {
    name: '19. commission-payout',
    subject: '💸 Paiement de commission',
    html: createEmail('💸 Paiement de commission', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre paiement de commission a été traité.</p>
      <div class="success-box">
        <p><strong>💰 Montant:</strong> 25000 DZD</p>
      </div>
    `)
  },
  {
    name: '20. monthly-performance-report',
    subject: '📊 Rapport mensuel',
    html: createEmail('📊 Rapport mensuel de performance', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Voici votre rapport pour Janvier 2025 :</p>
      <div class="info-box">
        <p><strong>👥 Parrainages:</strong> 15</p>
        <p><strong>💰 Commissions:</strong> 45000 DZD</p>
      </div>
    `)
  },
  
  // MARKETING (8)
  {
    name: '21. newsletter',
    subject: '📰 Newsletter Saloneo',
    html: createEmail('📰 Newsletter Saloneo', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Découvrez les nouveautés de ce mois !</p>
    `)
  },
  {
    name: '22. monthly-newsletter',
    subject: '📰 Newsletter mensuelle',
    html: createEmail('📰 Newsletter mensuelle', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Votre newsletter mensuelle Saloneo.</p>
    `)
  },
  {
    name: '23. special-offer',
    subject: '🎁 Offre spéciale',
    html: createEmail('🎁 Offre Spéciale Hiver', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Profitez de -30% sur tous nos services !</p>
      <div class="success-box">
        <p><strong>🔖 Code promo:</strong> HIVER2025</p>
        <p><strong>⏰ Valable jusqu'au:</strong> 31 Janvier 2025</p>
      </div>
    `)
  },
  {
    name: '24. birthday-wishes',
    subject: '🎂 Joyeux anniversaire',
    html: createEmail('🎂 Joyeux anniversaire Hani !', `
      <p>Toute l'équipe vous souhaite un très joyeux anniversaire !</p>
      <div class="success-box">
        <p>🎁 <strong>20% de réduction</strong></p>
        <p><strong>Code:</strong> ANNIV2025</p>
      </div>
    `)
  },
  {
    name: '25. loyalty-program-welcome',
    subject: '🌟 Programme de fidélité',
    html: createEmail('🌟 Bienvenue dans notre programme de fidélité', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Vous faites maintenant partie de notre programme !</p>
      <div class="success-box">
        <p><strong>🎁 Bonus:</strong> 100 points</p>
      </div>
    `)
  },
  {
    name: '26. loyalty-program-update',
    subject: '⭐ Mise à jour points de fidélité',
    html: createEmail('⭐ Mise à jour de vos points', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <div class="info-box">
        <p><strong>💎 Vos points:</strong> 450</p>
        <p><strong>🏆 Niveau:</strong> Gold</p>
      </div>
    `)
  },
  {
    name: '27. reward-earned',
    subject: '🎁 Récompense débloquée',
    html: createEmail('🎁 Récompense débloquée', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Vous avez échangé vos points contre une récompense !</p>
      <div class="success-box">
        <p><strong>🎁 Coupe gratuite</strong></p>
        <p><strong>🔖 Code:</strong> REWARD123</p>
      </div>
    `)
  },
  {
    name: '28. re-engagement',
    subject: '💜 Vous nous manquez',
    html: createEmail('💜 Vous nous manquez !', `
      <p>Bonjour <strong>Hani</strong>,</p>
      <p>Cela fait 45 jours que nous ne vous avons pas vu...</p>
      <div class="info-box">
        <p><strong>25% de réduction</strong> pour votre retour</p>
        <p><strong>Code:</strong> RETOUR2025</p>
      </div>
    `)
  }
];

// Fonction pour envoyer un email
async function sendEmail(email, index) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Saloneo Test" <${process.env.SMTP_USER}>`,
      to: TEST_EMAIL,
      subject: `[${index}/${emails.length}] ${email.subject}`,
      html: email.html
    });

    console.log(`✅ ${email.name}`);
    console.log(`   Message ID: ${info.messageId}\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${email.name}`);
    console.error(`   Erreur: ${error.message}\n`);
    return false;
  }
}

// Fonction principale
async function sendAllEmails() {
  console.log(`📧 Envoi de ${emails.length} emails...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < emails.length; i++) {
    console.log(`[${i + 1}/${emails.length}] Envoi: ${emails[i].name}...`);
    
    const success = await sendEmail(emails[i], i + 1);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Attendre avant le prochain email
    if (i < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS));
    }
  }
  
  console.log('='.repeat(80));
  console.log('\n📊 RÉSULTATS:');
  console.log(`✅ Réussis: ${successCount}/${emails.length}`);
  console.log(`❌ Échoués: ${failCount}/${emails.length}`);
  console.log(`\n💡 Vérifiez votre boîte mail: ${TEST_EMAIL}`);
  console.log('   (Vérifiez aussi le dossier spam)\n');
  
  if (successCount === emails.length) {
    console.log('🎉 TOUS LES 28 EMAILS ONT ÉTÉ ENVOYÉS AVEC SUCCÈS !\n');
  }
}

// Exécution
sendAllEmails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
