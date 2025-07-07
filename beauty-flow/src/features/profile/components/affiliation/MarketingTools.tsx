import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShareIcon,
  PhotoIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import { MarketingMaterial } from '../../types/affiliation';
import QRCode from 'qrcode';

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
          dark: '#4F46E5', // Indigo-600
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
    showToast('Texte copié dans le presse-papier', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Téléchargement démarré', 'success');
  };

  const handleDownloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `qrcode-affiliation-${affiliation?.affiliateCode}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    showToast('QR Code téléchargé', 'success');
  };

  // Templates d'emails prédéfinis
  const emailTemplates = [
    {
      id: 'email-1',
      title: 'Email de présentation professionnel',
      subject: 'Découvrez Saloneo - La solution complète pour votre salon',
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
      title: 'Email de recommandation personnelle',
      subject: 'Mon secret pour gérer mon salon efficacement',
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
      icon: GlobeAltIcon,
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
      icon: DevicePhoneMobileIcon,
      message: `Hey ! 👋

Tu cherches un outil pour gérer ton salon ? Je te recommande Saloneo !

C'est super simple et ça permet à tes clients de réserver en ligne 24h/24 📱

Essai gratuit ici : ${affiliateLink}`
    },
    {
      id: 'social-3',
      platform: 'Instagram',
      icon: PhotoIcon,
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

  // Bannières marketing simulées
  const banners: MarketingMaterial[] = [
    {
      id: 'banner-1',
      type: 'banner',
      name: 'Bannière horizontale 728x90',
      description: 'Parfaite pour les sites web et blogs',
      imageUrl: '/marketing/banner-728x90.jpg',
      dimensions: { width: 728, height: 90 }
    },
    {
      id: 'banner-2',
      type: 'banner',
      name: 'Bannière carrée 300x300',
      description: 'Idéale pour les réseaux sociaux',
      imageUrl: '/marketing/banner-300x300.jpg',
      dimensions: { width: 300, height: 300 }
    },
    {
      id: 'banner-3',
      type: 'banner',
      name: 'Bannière verticale 160x600',
      description: 'Pour les sidebars de sites web',
      imageUrl: '/marketing/banner-160x600.jpg',
      dimensions: { width: 160, height: 600 }
    }
  ];

  return (
    <div className="space-y-8">
      {/* QR Code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <QrCodeIcon className="h-5 w-5 mr-2 text-indigo-600" />
          QR Code de parrainage
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code d'affiliation" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-500">Génération du QR Code...</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-gray-700 mb-4">
              Partagez ce QR code pour permettre à vos contacts de s'inscrire facilement.
              Parfait pour les cartes de visite, flyers ou affiches.
            </p>
            <button 
              onClick={handleDownloadQRCode}
              disabled={!qrCodeDataUrl}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Télécharger le QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Templates d'emails */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <EnvelopeIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Templates d'emails
        </h3>
        <div className="space-y-4">
          {emailTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{template.title}</h4>
                  <p className="text-sm text-gray-600">Objet : {template.subject}</p>
                </div>
                <button
                  onClick={() => handleCopyText(template.content, template.id)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copiedId === template.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copiedId === template.id ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {template.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages réseaux sociaux */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShareIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Messages pour réseaux sociaux
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialMessages.map((message) => {
            const Icon = message.icon;
            return (
              <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{message.platform}</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(message.message, message.id)}
                    className={`p-1.5 rounded transition-all duration-200 ${
                      copiedId === message.id
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {copiedId === message.id ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bannières publicitaires */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PhotoIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Bannières publicitaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4 flex items-center justify-center h-40">
                <div className="text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {banner.dimensions?.width} x {banner.dimensions?.height}px
                  </p>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-1">{banner.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{banner.description}</p>
                <button
                  onClick={() => handleDownloadImage(banner.imageUrl || '', banner.name)}
                  className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide de bonnes pratiques */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📚 Guide des bonnes pratiques
        </h3>
        <div className="space-y-3 text-gray-700">
          <div>
            <h4 className="font-medium mb-1">1. Personnalisez vos messages</h4>
            <p className="text-sm">Adaptez les templates à votre style et votre audience pour de meilleurs résultats.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">2. Soyez authentique</h4>
            <p className="text-sm">Partagez votre expérience personnelle avec Saloneo pour créer de la confiance.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">3. Ciblez votre audience</h4>
            <p className="text-sm">Concentrez-vous sur les professionnels de la beauté dans votre réseau.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">4. Suivez vos performances</h4>
            <p className="text-sm">Utilisez le tableau de bord pour identifier ce qui fonctionne le mieux.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingTools;
