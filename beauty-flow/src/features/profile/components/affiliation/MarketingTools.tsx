import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownTrayIcon, CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import QRCode from 'qrcode';
import { IconButton, Panel } from '../../../../components/ui';

const MarketingTools: React.FC = () => {
  const { t } = useTranslation('profile');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const { affiliation, marketingMaterials, loadMarketingMaterials } = useAffiliationStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    loadMarketingMaterials();
  }, [loadMarketingMaterials]);

  const affiliateLink = `${window.location.origin}/register?ref=${affiliation?.affiliateCode}`;

  // Générer le QR Code
  useEffect(() => {
    if (affiliateLink && affiliation?.affiliateCode) {
      QRCode.toDataURL(affiliateLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#18181B',
          light: '#FFFFFF'
        }
      })
        .then(url => {
          setQrCodeDataUrl(url);
        })
        .catch(err => {
          console.error('Erreur lors de la génération du QR Code:', err);
        });
    }
  }, [affiliateLink, affiliation?.affiliateCode]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(t('affiliation_components.marketing.messages.copied'), 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `qrcode-affiliation-${affiliation?.affiliateCode}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    showToast(t('affiliation_components.dashboard.messages.qr_downloaded'), 'success');
  };

  // Templates d'emails prédéfinis
  const emailTemplates = [
    {
      id: 'email-1',
      title: t('affiliation_components.marketing.email_templates.professional.title'),
      subject: t('affiliation_components.marketing.email_templates.professional.subject'),
      content: `Bonjour,

Je souhaite vous présenter Saloneo, une solution de gestion complète spécialement conçue pour les salons de beauté, spas et barbershops.

Saloneo vous permet de :
✓ Gérer vos rendez-vous en ligne 24/7
✓ Fidéliser votre clientèle avec un système de points
✓ Suivre vos performances avec des tableaux de bord détaillés
✓ Automatiser les rappels SMS pour réduire les no-shows
✓ Gérer votre équipe et vos services facilement

Profitez d'un essai gratuit de 14 jours sans engagement.

Inscrivez-vous dès maintenant : ${affiliateLink}

Cordialement,
[Votre nom]`
    },
    {
      id: 'email-2',
      title: t('affiliation_components.marketing.email_templates.personal.title'),
      subject: t('affiliation_components.marketing.email_templates.personal.subject'),
      content: `Salut,

J'espère que tu vas bien ! Je voulais partager avec toi l'outil que j'utilise pour gérer mon salon.

Depuis que j'utilise Saloneo, j'ai pu :
- Réduire mes no-shows de 40%
- Augmenter mes réservations en ligne de 60%
- Gagner 2h par jour sur les tâches administratives

Le plus cool ? Les clients peuvent réserver directement depuis leur téléphone, même quand le salon est fermé.

Si ça t'intéresse, tu peux tester gratuitement pendant 14 jours : ${affiliateLink}

N'hésite pas si tu as des questions !

À bientôt,
[Votre nom]`
    }
  ];

  // Messages pour réseaux sociaux
  const socialMessages = [
    {
      id: 'social-1',
      platform: 'LinkedIn',
      message: `🚀 Découvrez Saloneo, la solution de gestion tout-en-un pour les professionnels de la beauté.

✅ Réservation en ligne 24/7
✅ Gestion d'équipe simplifiée
✅ Tableaux de bord analytiques
✅ Rappels SMS automatiques

Essai gratuit de 14 jours : ${affiliateLink}

#BeautyTech #SalonManagement #DigitalTransformation`
    },
    {
      id: 'social-2',
      platform: 'WhatsApp',
      message: `Hey ! 👋

Tu cherches un outil pour gérer ton salon ? Je te recommande Saloneo !

C'est super simple et ça permet à tes clients de réserver en ligne 24h/24 📱

Essai gratuit ici : ${affiliateLink}`
    },
    {
      id: 'social-3',
      platform: 'Instagram',
      message: `✨ Transformez votre salon avec Saloneo ! 

La solution digitale qui simplifie votre quotidien :
📅 Réservations en ligne
💆‍♀️ Gestion des services
👥 Suivi clientèle
📊 Analytics détaillés

Lien dans ma bio 👆 ${affiliateLink}

#SalonDeBeaute #GestionSalon #BeautyBusiness #Saloneo`
    }
  ];

  const m = 'affiliation_components.marketing';
  const copyButton = (text: string, id: string) => (
    <IconButton label={t('actions.copy')} onClick={() => handleCopyText(text, id)} className="shrink-0">
      {copiedId === id ? <CheckIcon className="size-5 text-emerald-600" /> : <ClipboardDocumentIcon className="size-5" />}
    </IconButton>
  );

  return (
    <div className="space-y-6">
      <Panel title={t(`${m}.qr_code.title`)}>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="" className="size-40 shrink-0 rounded-xl border border-gray-200 dark:border-gray-800" />
          ) : (
            <div className="grid size-40 shrink-0 place-items-center rounded-xl bg-gray-100 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {t(`${m}.qr_code.generating`)}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t(`${m}.qr_code.description`)}</p>
            <button onClick={handleDownloadQRCode} disabled={!qrCodeDataUrl} className="btn-primary mt-4">
              <ArrowDownTrayIcon className="size-4" />
              {t(`${m}.qr_code.download`)}
            </button>
          </div>
        </div>
      </Panel>

      <Panel flush title={t(`${m}.email_templates.title`)} description={t(`${m}.email_templates.description`)} bodyClassName="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
        {emailTemplates.map((template) => (
          <div key={template.id} className="px-5 py-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50">{template.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{template.subject}</p>
              </div>
              {copyButton(template.content, template.id)}
            </div>
            <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
              {template.content}
            </div>
          </div>
        ))}
      </Panel>

      <Panel flush title={t(`${m}.social_messages.title`)} bodyClassName="grid divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0 rtl:lg:divide-x-reverse">
        {socialMessages.map((message) => (
          <div key={message.id} className="px-5 py-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{message.platform}</span>
              {copyButton(message.message, message.id)}
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{message.message}</p>
          </div>
        ))}
      </Panel>

      <Panel title={t(`${m}.best_practices.title`)}>
        <dl className="grid gap-4 sm:grid-cols-2">
          {['personalize', 'be_authentic', 'target_audience', 'track_performance'].map((key) => (
            <div key={key}>
              <dt className="text-sm font-medium text-gray-900 dark:text-gray-50">{t(`${m}.best_practices.${key}`)}</dt>
              <dd className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t(`${m}.best_practices.${key}_desc`)}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
};

export default MarketingTools;
