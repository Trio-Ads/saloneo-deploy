import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import QRCode from 'qrcode';

interface MonthlyStats {
  month: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

const AffiliationDashboard: React.FC = () => {
  const { t } = useTranslation('profile');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const { affiliation, generateAffiliateLink, affiliateLinks, commissions, loadCommissions } = useAffiliationStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    // Charger les commissions pour calculer les statistiques
    loadCommissions();
  }, [loadCommissions]);

  // Calculer les statistiques mensuelles à partir des vraies commissions
  const monthlyStats = useMemo(() => {
    if (!commissions || commissions.length === 0) {
      // Retourner des données vides si pas de commissions
      const currentMonth = new Date().getMonth();
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      return Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth - 5 + i + 12) % 12;
        return {
          month: months[monthIndex],
          clicks: 0,
          conversions: 0,
          revenue: 0
        };
      });
    }

    // Grouper les commissions par mois
    const statsByMonth = new Map<string, MonthlyStats>();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    commissions.forEach(commission => {
      const date = new Date(commission.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = months[date.getMonth()];
      
      if (!statsByMonth.has(monthKey)) {
        statsByMonth.set(monthKey, {
          month: monthName,
          clicks: 0,
          conversions: 0,
          revenue: 0
        });
      }
      
      const stats = statsByMonth.get(monthKey)!;
      stats.conversions += 1;
      stats.revenue += commission.amount;
    });

    // Ajouter les clics depuis les stats d'affiliation si disponibles
    if (affiliation?.stats) {
      const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
      if (statsByMonth.has(currentMonthKey)) {
        const stats = statsByMonth.get(currentMonthKey)!;
        stats.clicks = affiliation.stats.clicksCount || 0;
      }
    }

    // Convertir en tableau et trier par date
    return Array.from(statsByMonth.values())
      .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month))
      .slice(-6); // Garder les 6 derniers mois
  }, [commissions, affiliation]);

  // Calculer les revenus du mois en cours
  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return commissions
      .filter(c => {
        const date = new Date(c.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, c) => sum + c.amount, 0);
  }, [commissions]);

  // Calculer les variations par rapport au mois précédent
  const calculateGrowth = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100' : '0';
    const growth = ((current - previous) / previous) * 100;
    return growth >= 0 ? `+${growth.toFixed(0)}` : growth.toFixed(0);
  };

  const lastMonthStats = monthlyStats[monthlyStats.length - 2] || { clicks: 0, conversions: 0, revenue: 0 };
  const currentStats = monthlyStats[monthlyStats.length - 1] || { clicks: 0, conversions: 0, revenue: 0 };

  const affiliateLink = `${window.location.origin}/register?ref=${affiliation?.affiliateCode}`;

  // Générer le QR Code quand le lien change
  useEffect(() => {
    if (affiliateLink && affiliation?.affiliateCode) {
      QRCode.toDataURL(affiliateLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1F2937',
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setLinkCopied(true);
    showToast(t('affiliation_components.dashboard.messages.link_copied'), 'success');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `qrcode-affiliation-${affiliation?.affiliateCode}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    showToast(t('affiliation_components.dashboard.messages.qr_downloaded'), 'success');
  };

  const handleShare = (platform: string) => {
    const text = 'Découvrez Saloneo, la solution de gestion pour salons de beauté';
    const url = affiliateLink;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('Découvrez Saloneo')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Lien d'affiliation */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <LinkIcon className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-500" />
          {t('affiliation_components.dashboard.affiliate_link')}
        </h3>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <code className="text-sm text-gray-700 dark:text-gray-300 font-mono flex-1 mr-4 break-all">
              {affiliateLink}
            </code>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  linkCopied 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {linkCopied ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <ClipboardDocumentIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <QrCodeIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Boutons de partage */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleShare('whatsapp')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <ShareIcon className="h-4 w-4" />
            <span>{t('affiliation_components.dashboard.share_buttons.whatsapp')}</span>
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <ShareIcon className="h-4 w-4" />
            <span>{t('affiliation_components.dashboard.share_buttons.facebook')}</span>
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <ShareIcon className="h-4 w-4" />
            <span>{t('affiliation_components.dashboard.share_buttons.twitter')}</span>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <ShareIcon className="h-4 w-4" />
            <span>{t('affiliation_components.dashboard.share_buttons.linkedin')}</span>
          </button>
          <button
            onClick={() => handleShare('email')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <ShareIcon className="h-4 w-4" />
            <span>{t('affiliation_components.dashboard.share_buttons.email')}</span>
          </button>
        </div>
      </div>

      {/* Tableau des statistiques mensuelles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('affiliation_components.dashboard.monthly_stats')}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('affiliation_components.dashboard.table_headers.month')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.dashboard.table_headers.clicks')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.dashboard.table_headers.conversions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.dashboard.table_headers.conversion_rate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('affiliation_components.dashboard.table_headers.revenue')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {monthlyStats.map((stat) => (
                <tr key={stat.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stat.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {stat.clicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.clicks > 0 ? ((stat.conversions / stat.clicks) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stat.revenue} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('affiliation_components.dashboard.current_month.clicks')}</h4>
            {Number(calculateGrowth(currentStats.clicks, lastMonthStats.clicks)) >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentStats.clicks || affiliation?.stats.clicksCount || 0}
          </p>
          <p className={`text-sm mt-1 ${
            Number(calculateGrowth(currentStats.clicks, lastMonthStats.clicks)) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {calculateGrowth(currentStats.clicks || affiliation?.stats.clicksCount || 0, lastMonthStats.clicks)}% {t('affiliation_components.dashboard.vs_last_month')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('affiliation_components.dashboard.current_month.conversions')}</h4>
            {Number(calculateGrowth(currentStats.conversions, lastMonthStats.conversions)) >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentStats.conversions || affiliation?.stats.conversionsCount || 0}
          </p>
          <p className={`text-sm mt-1 ${
            Number(calculateGrowth(currentStats.conversions, lastMonthStats.conversions)) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {calculateGrowth(currentStats.conversions || affiliation?.stats.conversionsCount || 0, lastMonthStats.conversions)}% {t('affiliation_components.dashboard.vs_last_month')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('affiliation_components.dashboard.current_month.revenue')}</h4>
            {Number(calculateGrowth(currentMonthRevenue, lastMonthStats.revenue)) >= 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentMonthRevenue.toFixed(2)} €
          </p>
          <p className={`text-sm mt-1 ${
            Number(calculateGrowth(currentMonthRevenue, lastMonthStats.revenue)) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {calculateGrowth(currentMonthRevenue, lastMonthStats.revenue)}% {t('affiliation_components.dashboard.vs_last_month')}
          </p>
        </div>
      </div>

      {/* Conseils pour améliorer les performances */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('affiliation_components.dashboard.tips.title')}
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-orange-600 dark:text-orange-500 mr-2">•</span>
            {t('affiliation_components.dashboard.tips.social_share')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            {t('affiliation_components.dashboard.tips.quality_content')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            {t('affiliation_components.dashboard.tips.target_audience')}
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            {t('affiliation_components.dashboard.tips.use_tools')}
          </li>
        </ul>
      </div>

      {/* Modal QR Code */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('affiliation_components.marketing.qr_code.modal_title')}</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {qrCodeDataUrl && (
              <div className="flex flex-col items-center">
                <img src={qrCodeDataUrl} alt="QR Code" className="mb-4" />
                <p className="text-sm text-gray-600 text-center mb-4">
                  {t('affiliation_components.marketing.qr_code.modal_description')}
                </p>
                <button
                  onClick={handleDownloadQRCode}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  {t('affiliation_components.marketing.qr_code.download')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliationDashboard;
