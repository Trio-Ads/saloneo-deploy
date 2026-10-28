/**
 * Email Templates for Saloneo
 * All HTML email templates with Handlebars syntax
 */

export class EmailTemplates {
  private static getBaseStyles(): string {
    return `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
      .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; position: relative; }
      .header .logo { width: 180px; height: auto; margin: 0 auto; display: block; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
      .content { padding: 30px; background: white; }
      .content h2 { color: #FF6B35; margin-top: 0; }
      .footer { text-align: center; padding: 20px; background: #f9f9f9; color: #666; font-size: 12px; border-top: 1px solid #eee; }
      .button { display: inline-block; padding: 14px 32px; background: #FF6B35; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; transition: background 0.3s; }
      .button:hover { background: #F7931E; }
      .info-box { background: #FFF5F0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #FF6B35; }
      .info-box p { margin: 8px 0; }
      .alert-box { background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #ffc107; }
      .success-box { background: #d4edda; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #28a745; }
      .warning-box { background: #f8d7da; padding: 15px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #dc3545; }
      .admin-box { background: #FFF5F0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #FF6B35; border: 2px solid #FF6B35; }
      .feedback-form { background: #FFF5F0; padding: 25px; margin: 20px 0; border-radius: 8px; border: 2px solid #FF6B35; }
      .feedback-form h3 { color: #FF6B35; margin-top: 0; margin-bottom: 15px; }
      .feedback-form .form-group { margin-bottom: 20px; }
      .feedback-form label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; font-size: 14px; }
      .feedback-form textarea { width: 100%; min-height: 80px; padding: 12px; border: 2px solid #FF6B35; border-radius: 6px; font-family: inherit; font-size: 14px; resize: vertical; }
      .feedback-form textarea:focus { outline: none; border-color: #F7931E; box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1); }
      .feedback-form .submit-btn { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 14px 32px; border: none; border-radius: 6px; font-weight: 600; font-size: 16px; cursor: pointer; width: 100%; transition: all 0.3s; }
      .feedback-form .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); }
      ul { padding-left: 20px; }
      ul li { margin: 8px 0; }
    `;
  }

  private static wrapTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${this.getBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://saloneo.app/images/logos/Salon%C3%A9o%20Logo%20-%20White.png" alt="Saloneo" class="logo">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>{{salonName}}</strong></p>
      <p>{{salonAddress}}</p>
      <p>{{salonPhone}} | {{salonEmail}}</p>
      <p>&copy; {{currentYear}} Saloneo. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`;
  }

  // APPOINTMENT TEMPLATES
  static getAppointmentConfirmationTemplate(): string {
    return this.wrapTemplate(`
      <h2>✅ Confirmation de rendez-vous</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Votre rendez-vous a été confirmé avec succès !</p>
      <div class="info-box">
        <p><strong>📅 Date:</strong> {{formatDate appointmentDate}}</p>
        <p><strong>🕐 Heure:</strong> {{appointmentTime}}</p>
        <p><strong>💇 Service:</strong> {{serviceName}}</p>
        <p><strong>⏱️ Durée:</strong> {{serviceDuration}} minutes</p>
        <p><strong>👤 Avec:</strong> {{staffName}}</p>
        <p><strong>💰 Prix:</strong> {{formatCurrency servicePrice currency}}</p>
      </div>
      {{#if depositAmount}}
      <div class="success-box">
        <p><strong>Acompte payé en ligne :</strong> {{depositAmount}}</p>
        <p><strong>Reste à régler au salon :</strong> {{depositRemaining}}</p>
        {{#if depositOrderNumber}}<p>N° de commande SATIM : {{depositOrderNumber}}</p>{{/if}}
      </div>
      {{/if}}
      {{#if policyText}}
      <p style="font-size: 13px; color: #555;"><strong>Politique d'annulation :</strong> {{policyText}}</p>
      {{/if}}
      <p>Nous avons hâte de vous accueillir !</p>
      <p style="text-align: center;">
        <a href="{{bookingUrl}}" class="button">Voir mon rendez-vous</a>
      </p>
    `);
  }

  /** Generic deposit notice (refund, retained, payout, admin alerts): title, intro, rows, note, optional button. */
  static getDepositNoticeTemplate(): string {
    return this.wrapTemplate(`
      <h2>{{title}}</h2>
      <p>{{intro}}</p>
      {{#if rows.length}}
      <div class="info-box">
        {{#each rows}}<p><strong>{{label}} :</strong> {{value}}</p>{{/each}}
      </div>
      {{/if}}
      {{#if note}}<p style="font-size: 13px; color: #555;">{{note}}</p>{{/if}}
      {{#if buttonUrl}}
      <p style="text-align: center;">
        <a href="{{buttonUrl}}" class="button">{{buttonLabel}}</a>
      </p>
      {{/if}}
    `);
  }

  static getAppointmentReminderTemplate(): string {
    return this.wrapTemplate(`
      <h2>⏰ Rappel de rendez-vous</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Nous vous rappelons votre rendez-vous à venir :</p>
      <div class="alert-box">
        <p><strong>📅 Date:</strong> {{formatDate appointmentDate}}</p>
        <p><strong>🕐 Heure:</strong> {{appointmentTime}}</p>
        <p><strong>💇 Service:</strong> {{serviceName}}</p>
        <p><strong>👤 Avec:</strong> {{staffName}}</p>
      </div>
      <p>À très bientôt !</p>
    `);
  }

  static getAppointmentCancellationTemplate(): string {
    return this.wrapTemplate(`
      <h2>❌ Annulation de rendez-vous</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Votre rendez-vous a été annulé :</p>
      <div class="warning-box">
        <p><strong>📅 Date:</strong> {{formatDate appointmentDate}}</p>
        <p><strong>🕐 Heure:</strong> {{appointmentTime}}</p>
        <p><strong>💇 Service:</strong> {{serviceName}}</p>
      </div>
      <p>Nous espérons vous revoir bientôt !</p>
      <p style="text-align: center;">
        <a href="{{bookingUrl}}" class="button">Prendre un nouveau rendez-vous</a>
      </p>
    `);
  }

  static getAppointmentModificationTemplate(): string {
    return this.wrapTemplate(`
      <h2>🔄 Modification de rendez-vous</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Votre rendez-vous a été modifié.</p>
      <div class="info-box">
        <h3>Ancien rendez-vous:</h3>
        <p>📅 {{formatDate oldAppointmentDate}} à {{oldAppointmentTime}}</p>
        <h3 style="margin-top: 15px;">Nouveau rendez-vous:</h3>
        <p>📅 {{formatDate appointmentDate}} à {{appointmentTime}}</p>
        <p><strong>💇 Service:</strong> {{serviceName}}</p>
        <p><strong>👤 Avec:</strong> {{staffName}}</p>
      </div>
    `);
  }

  static getWaitlistOfferTemplate(): string {
    return this.wrapTemplate(`
      <h2>Un créneau s'est libéré</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Bonne nouvelle : un créneau s'est libéré chez <strong>{{salonName}}</strong>.</p>
      <div class="info-box">
        <p><strong>Date :</strong> {{date}}</p>
        <p><strong>Heure :</strong> {{time}}</p>
        <p><strong>Prestation :</strong> {{serviceName}}</p>
      </div>
      <p>Réservez-le avant <strong>{{expires}}</strong>. Passé ce délai, il sera proposé à la personne suivante sur la liste d'attente.</p>
      <p style="text-align: center;">
        <a href="{{link}}" class="button">Réserver ce créneau</a>
      </p>
    `);
  }

  // TEAM TEMPLATES
  static getStaffInvitationTemplate(): string {
    return this.wrapTemplate(`
      <h2>Rejoignez l'équipe sur Saloneo</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p><strong>{{salonName}}</strong> vous invite à créer votre accès Saloneo : votre planning, vos clientes et vos demandes de congé, depuis votre téléphone.</p>
      <p style="text-align: center;">
        <a href="{{link}}" class="button">Créer mon accès</a>
      </p>
      <p>Ce lien est valable {{expires}}. Si vous n'attendiez pas cette invitation, ignorez cet e-mail.</p>
    `);
  }

  static getLeaveDecisionTemplate(): string {
    return this.wrapTemplate(`
      <h2>Demande de congé {{decisionLabel}}</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Votre demande chez <strong>{{salonName}}</strong> a été <strong>{{decisionLabel}}</strong>.</p>
      <div class="info-box">
        <p><strong>Type :</strong> {{typeLabel}}</p>
        <p><strong>Période :</strong> {{period}}</p>
        {{#if comment}}<p><strong>Commentaire :</strong> {{comment}}</p>{{/if}}
      </div>
      <p style="text-align: center;">
        <a href="{{link}}" class="button">Voir mes congés</a>
      </p>
    `);
  }

  // SUBSCRIPTION TEMPLATES
  static getSubscriptionWelcomeTemplate(): string {
    return this.wrapTemplate(`
      <h2>🎉 Bienvenue sur Saloneo !</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Merci d'avoir choisi Saloneo pour gérer votre salon !</p>
      <div class="success-box">
        <p><strong>✅ Votre abonnement {{planName}} est actif</strong></p>
        <p>Durée: {{planDuration}}</p>
      </div>
      <p>Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.</p>
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Accéder à mon tableau de bord</a>
      </p>
    `);
  }

  static getSubscriptionExpiryReminderTemplate(): string {
    return this.wrapTemplate(`
      <h2>⏰ Votre abonnement expire bientôt</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Votre abonnement <strong>{{planName}}</strong> expire dans <strong>{{daysRemaining}} jours</strong>.</p>
      <div class="alert-box">
        <p><strong>📅 Date d'expiration:</strong> {{formatDate expiryDate}}</p>
      </div>
      <p>Renouvelez dès maintenant pour continuer à profiter de tous les avantages de Saloneo.</p>
      <p style="text-align: center;">
        <a href="{{renewUrl}}" class="button">Renouveler mon abonnement</a>
      </p>
    `);
  }

  static getSubscriptionExpiredTemplate(): string {
    return this.wrapTemplate(`
      <h2>⚠️ Votre abonnement a expiré</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Votre abonnement <strong>{{planName}}</strong> a expiré.</p>
      <div class="warning-box">
        <p>Votre accès aux fonctionnalités premium est maintenant limité.</p>
      </div>
      <p>Renouvelez votre abonnement pour retrouver tous vos avantages.</p>
      <p style="text-align: center;">
        <a href="{{renewUrl}}" class="button">Renouveler maintenant</a>
      </p>
    `);
  }

  static getSubscriptionLimitReachedTemplate(): string {
    return this.wrapTemplate(`
      <h2>⚠️ Limite atteinte</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Vous avez atteint les limites de votre plan <strong>{{planName}}</strong> :</p>
      <div class="alert-box">
        {{#if currentUsage.appointments}}
          <p><strong>📅 Rendez-vous:</strong> {{currentUsage.appointments.used}}/{{currentUsage.appointments.limit}} ({{percentage currentUsage.appointments.used currentUsage.appointments.limit}}%)</p>
        {{/if}}
        {{#if currentUsage.clients}}
          <p><strong>👥 Clients:</strong> {{currentUsage.clients.used}}/{{currentUsage.clients.limit}} ({{percentage currentUsage.clients.used currentUsage.clients.limit}}%)</p>
        {{/if}}
        {{#if currentUsage.services}}
          <p><strong>💇 Services:</strong> {{currentUsage.services.used}}/{{currentUsage.services.limit}} ({{percentage currentUsage.services.used currentUsage.services.limit}}%)</p>
        {{/if}}
      </div>
      <p>Passez à un plan supérieur pour augmenter vos limites.</p>
      <p style="text-align: center;">
        <a href="{{upgradeUrl}}" class="button">Augmenter mes limites</a>
      </p>
    `);
  }

  static getSubscriptionUpgradeTemplate(): string {
    return this.wrapTemplate(`
      <h2>🚀 Mise à niveau réussie !</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Félicitations ! Vous êtes passé de <strong>{{oldPlanName}}</strong> à <strong>{{planName}}</strong>.</p>
      <div class="success-box">
        <p>✅ Votre nouveau plan est maintenant actif</p>
        <p>Durée: {{planDuration}}</p>
      </div>
      <p>Profitez de vos nouvelles fonctionnalités !</p>
    `);
  }

  static getUpgradeSuggestionTemplate(): string {
    return this.wrapTemplate(`
      <h2>💡 Suggestion de mise à niveau</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Nous avons remarqué que vous utilisez intensivement votre plan <strong>{{currentPlan}}</strong>.</p>
      <div class="info-box">
        <p>Le plan <strong>{{suggestedPlan}}</strong> pourrait mieux répondre à vos besoins :</p>
        <ul>
          <li>Plus de rendez-vous</li>
          <li>Plus de clients</li>
          <li>Plus de services</li>
          <li>Fonctionnalités avancées</li>
        </ul>
      </div>
      <p style="text-align: center;">
        <a href="{{upgradeUrl}}" class="button">Découvrir le plan {{suggestedPlan}}</a>
      </p>
    `);
  }

  // PAYMENT TEMPLATE
  static getPaymentReceiptTemplate(): string {
    return this.wrapTemplate(`
      <h2>💳 Reçu de paiement</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Nous confirmons la réception de votre paiement.</p>
      <div class="success-box">
        <p><strong>💰 Montant:</strong> {{formatCurrency amount currency}}</p>
        <p><strong>🔖 Transaction:</strong> {{transactionId}}</p>
        <p><strong>📦 Plan:</strong> {{planName}}</p>
        <p><strong>⏱️ Durée:</strong> {{planDuration}}</p>
        <p><strong>📄 Facture:</strong> {{invoiceNumber}}</p>
      </div>
      <p>Merci pour votre confiance !</p>
    `);
  }

  // AUTHENTICATION TEMPLATES
  static getPasswordResetTemplate(): string {
    return this.wrapTemplate(`
      <h2>🔐 Réinitialisation de mot de passe</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <div class="info-box">
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
      </div>
      <p style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a>
      </p>
      <p><small>Ce lien expire dans {{expiryTime}}.</small></p>
      <p><small>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</small></p>
    `);
  }

  static getEmailVerificationTemplate(): string {
    return this.wrapTemplate(`
      <h2>✉️ Vérification d'email</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Merci de vous être inscrit sur Saloneo !</p>
      <div class="info-box">
        <p>Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
      </div>
      <p style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Vérifier mon email</a>
      </p>
    `);
  }

  static getSuspiciousLoginAlertTemplate(): string {
    return this.wrapTemplate(`
      <h2>🔒 Alerte de connexion suspecte</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Une connexion inhabituelle a été détectée sur votre compte.</p>
      <div class="warning-box">
        <p><strong>📍 Localisation:</strong> {{loginLocation}}</p>
        <p><strong>🖥️ Appareil:</strong> {{loginDevice}}</p>
        <p><strong>🌐 IP:</strong> {{loginIp}}</p>
        <p><strong>🕐 Date:</strong> {{formatDate loginTime}}</p>
      </div>
      <p>Si ce n'était pas vous, changez immédiatement votre mot de passe.</p>
      <p style="text-align: center;">
        <a href="{{securityUrl}}" class="button">Sécuriser mon compte</a>
      </p>
    `);
  }

  // ACCOUNT TEMPLATES
  static getAccountSuspendedTemplate(): string {
    return this.wrapTemplate(`
      <h2>⚠️ Compte suspendu</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Votre compte Saloneo a été temporairement suspendu.</p>
      <div class="warning-box">
        <p><strong>Raison:</strong> {{suspensionReason}}</p>
      </div>
      <p>Contactez notre support pour plus d'informations.</p>
      <p style="text-align: center;">
        <a href="{{supportUrl}}" class="button">Contacter le support</a>
      </p>
    `);
  }

  static getAccountReactivatedTemplate(): string {
    return this.wrapTemplate(`
      <h2>✅ Compte réactivé</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Bonne nouvelle ! Votre compte Saloneo a été réactivé.</p>
      <div class="success-box">
        <p>Vous pouvez à nouveau accéder à toutes les fonctionnalités de votre plan <strong>{{planName}}</strong>.</p>
      </div>
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Accéder à mon compte</a>
      </p>
    `);
  }

  // AFFILIATION TEMPLATES
  static getAffiliationActivationTemplate(): string {
    return this.wrapTemplate(`
      <h2>🤝 Programme d'affiliation activé</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Félicitations ! Votre compte affilié est maintenant actif.</p>
      <div class="success-box">
        <p><strong>🔗 Votre code d'affiliation:</strong> {{affiliationCode}}</p>
        <p><strong>💰 Taux de commission:</strong> {{commissionRate}}</p>
      </div>
      <p>Commencez à partager votre lien et gagnez des commissions !</p>
      <p style="text-align: center;">
        <a href="{{affiliationDashboard}}" class="button">Mon tableau de bord affilié</a>
      </p>
    `);
  }

  static getCommissionEarnedTemplate(): string {
    return this.wrapTemplate(`
      <h2>💰 Nouvelle commission gagnée !</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Vous avez gagné une nouvelle commission !</p>
      <div class="success-box">
        <p><strong>💵 Montant:</strong> {{formatCurrency commissionAmount currency}}</p>
        <p><strong>👤 Parrainage:</strong> {{referralName}}</p>
      </div>
      <p>Continuez à partager pour gagner plus !</p>
    `);
  }

  static getCommissionPayoutTemplate(): string {
    return this.wrapTemplate(`
      <h2>💸 Paiement de commission</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Votre paiement de commission a été traité.</p>
      <div class="success-box">
        <p><strong>💰 Montant:</strong> {{formatCurrency payoutAmount currency}}</p>
        <p><strong>💳 Méthode:</strong> {{payoutMethod}}</p>
      </div>
      <p>Merci pour votre partenariat !</p>
    `);
  }

  static getMonthlyPerformanceReportTemplate(): string {
    return this.wrapTemplate(`
      <h2>📊 Rapport mensuel de performance</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Voici votre rapport d'affiliation pour <strong>{{month}}</strong> :</p>
      <div class="info-box">
        <p><strong>👥 Parrainages:</strong> {{totalReferrals}}</p>
        <p><strong>💰 Commissions totales:</strong> {{formatCurrency totalCommissions currency}}</p>
        <p><strong>📈 Taux de conversion:</strong> {{conversionRate}}%</p>
        <p><strong>🏆 Plan le plus populaire:</strong> {{topPlan}}</p>
      </div>
      <p style="text-align: center;">
        <a href="{{reportUrl}}" class="button">Voir le rapport complet</a>
      </p>
    `);
  }

  // MARKETING TEMPLATES
  static getNewsletterTemplate(): string {
    return this.wrapTemplate(`
      <h2>📰 {{newsletterTitle}}</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      {{#each newsletterSections}}
        <div class="info-box">
          <h3>{{this.heading}}</h3>
          <p>{{this.content}}</p>
          {{#if this.cta}}
            <p style="text-align: center;">
              <a href="{{this.cta.url}}" class="button">{{this.cta.text}}</a>
            </p>
          {{/if}}
        </div>
      {{/each}}
      <p><small><a href="{{unsubscribeUrl}}">Se désinscrire</a></small></p>
    `);
  }

  static getMonthlyNewsletterTemplate(): string {
    return this.getNewsletterTemplate();
  }

  static getSpecialOfferTemplate(): string {
    return this.wrapTemplate(`
      <h2>🎁 {{offerTitle}}</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>{{offerDescription}}</p>
      <div class="success-box">
        <p><strong>💰 Réduction:</strong> {{discount}}%</p>
        <p><strong>🔖 Code promo:</strong> <strong>{{promoCode}}</strong></p>
        <p><strong>⏰ Valable jusqu'au:</strong> {{formatDate validUntil}}</p>
      </div>
      <p style="text-align: center;">
        <a href="{{bookingUrl}}" class="button">Réserver maintenant</a>
      </p>
    `);
  }

  static getBirthdayWishesTemplate(): string {
    return this.wrapTemplate(`
      <h2>🎂 Joyeux anniversaire {{clientName}} !</h2>
      <p>Toute l'équipe de <strong>{{salonName}}</strong> vous souhaite un très joyeux anniversaire !</p>
      <div class="success-box">
        <p>🎁 Pour célébrer vos <strong>{{age}} ans</strong>, nous vous offrons :</p>
        <p><strong>{{birthdayDiscount}}% de réduction</strong></p>
        <p><strong>Code:</strong> {{birthdayPromoCode}}</p>
        <p><small>Valable pendant {{validDays}} jours</small></p>
      </div>
      <p style="text-align: center;">
        <a href="{{bookingUrl}}" class="button">Profiter de mon cadeau</a>
      </p>
    `);
  }

  static getLoyaltyProgramWelcomeTemplate(): string {
    return this.wrapTemplate(`
      <h2>🌟 Bienvenue dans notre programme de fidélité !</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Vous faites maintenant partie de notre programme de fidélité !</p>
      <div class="success-box">
        <p><strong>🎁 Bonus de bienvenue:</strong> {{welcomePoints}} points</p>
      </div>
      <div class="info-box">
        <h3>Avantages du programme:</h3>
        <ul>
          {{#each programBenefits}}
            <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
    `);
  }

  static getLoyaltyProgramUpdateTemplate(): string {
    return this.wrapTemplate(`
      <h2>⭐ Mise à jour de vos points de fidélité</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <div class="info-box">
        <p><strong>💎 Vos points:</strong> {{loyaltyPoints}}</p>
        <p><strong>🏆 Niveau:</strong> {{loyaltyLevel}}</p>
        <p><strong>📈 Prochain niveau:</strong> {{nextLevelPoints}} points</p>
      </div>
      {{#if availableRewards}}
        <h3>Récompenses disponibles:</h3>
        {{#each availableRewards}}
          <div class="success-box">
            <p><strong>{{this.name}}</strong> - {{this.pointsCost}} points</p>
            <p>{{this.description}}</p>
          </div>
        {{/each}}
        <p style="text-align: center;">
          <a href="{{redeemUrl}}" class="button">Échanger mes points</a>
        </p>
      {{/if}}
    `);
  }

  static getRewardEarnedTemplate(): string {
    return this.wrapTemplate(`
      <h2>🎁 Récompense débloquée !</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Félicitations ! Vous avez échangé vos points contre :</p>
      <div class="success-box">
        <p><strong>🎁 {{rewardName}}</strong></p>
        <p><strong>💎 Points utilisés:</strong> {{pointsUsed}}</p>
        <p><strong>💰 Points restants:</strong> {{remainingPoints}}</p>
        <p><strong>🔖 Code:</strong> {{redeemCode}}</p>
      </div>
      <p>Présentez ce code lors de votre prochaine visite !</p>
    `);
  }

  static getReEngagementTemplate(): string {
    return this.wrapTemplate(`
      <h2>💜 Vous nous manquez !</h2>
      <p>Bonjour <strong>{{clientName}}</strong>,</p>
      <p>Cela fait <strong>{{lastVisitDays}} jours</strong> que nous ne vous avons pas vu...</p>
      <div class="info-box">
        <p>Pour vous accueillir à nouveau, nous vous offrons :</p>
        <p><strong>{{comebackDiscount}}% de réduction</strong></p>
        <p><strong>Code:</strong> {{comebackPromoCode}}</p>
      </div>
      <p style="text-align: center;">
        <a href="{{bookingUrl}}" class="button">Reprendre rendez-vous</a>
      </p>
    `);
  }

  // ADMIN TEMPLATE
  static getAdminSubscriptionModificationTemplate(): string {
    return this.wrapTemplate(`
      <h2>🎁 Mise à jour de votre abonnement</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Nous avons une excellente nouvelle pour vous !</p>
      <div class="admin-box">
        <p style="text-align: center; font-size: 18px; margin-bottom: 15px;">
          <strong>🎉 L'équipe Saloneo vous offre un abonnement !</strong>
        </p>
        <p><strong>📦 Plan:</strong> {{planName}}</p>
        <p><strong>⏱️ Durée:</strong> {{planDuration}}</p>
        <p><strong>📅 Valable jusqu'au:</strong> {{formatDate expiryDate}}</p>
        {{#if isActive}}
          <p><strong>✅ Statut:</strong> <span style="color: #28a745;">Actif</span></p>
        {{else}}
          <p><strong>⚠️ Statut:</strong> <span style="color: #dc3545;">Inactif</span></p>
        {{/if}}
      </div>
      <p>Profitez de toutes les fonctionnalités de votre nouveau plan dès maintenant !</p>
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Accéder à mon compte</a>
      </p>
      <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
        <em>Cette modification a été effectuée par l'équipe Saloneo</em>
      </p>
    `);
  }

  // USER FEEDBACK TEMPLATE
  static getUserFeedbackRequestTemplate(): string {
    return this.wrapTemplate(`
      <h2>Votre avis nous intéresse</h2>
      <p>Bonjour <strong>{{userName}}</strong>,</p>
      <p>Nous espérons que vous appréciez votre expérience avec Saloneo. Votre opinion est très importante pour nous aider à améliorer notre plateforme.</p>
      
      <div class="info-box">
        <p>Pourriez-vous prendre quelques minutes pour partager votre retour d'expérience ? Cela nous permettra de continuer à développer les fonctionnalités qui vous sont utiles.</p>
      </div>

      <form action="{{feedbackSubmitUrl}}" method="POST" class="feedback-form">
        <input type="hidden" name="userId" value="{{userId}}" />
        <input type="hidden" name="userEmail" value="{{userEmail}}" />
        <input type="hidden" name="establishmentName" value="{{establishmentName}}" />
        
        <div class="form-group">
          <label for="satisfaction">Comment évaluez-vous votre satisfaction générale avec Saloneo ?</label>
          <textarea name="satisfaction" id="satisfaction" placeholder="Partagez votre niveau de satisfaction et ce qui vous plaît le plus dans notre plateforme..." required></textarea>
        </div>

        <div class="form-group">
          <label for="missing_features">Quelles fonctionnalités aimeriez-vous voir ajoutées ?</label>
          <textarea name="missing_features" id="missing_features" placeholder="Décrivez les fonctionnalités qui vous manquent ou qui pourraient améliorer votre expérience..."></textarea>
        </div>

        <div class="form-group">
          <label for="issues">Avez-vous rencontré des problèmes ou des difficultés ?</label>
          <textarea name="issues" id="issues" placeholder="Décrivez les problèmes techniques, bugs ou difficultés d'utilisation que vous avez pu rencontrer..."></textarea>
        </div>

        <button type="submit" class="submit-btn">Envoyer mon feedback</button>
      </form>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Merci de prendre le temps de nous aider à améliorer Saloneo. Votre feedback est précieux pour nous.
      </p>
    `);
  }
}
