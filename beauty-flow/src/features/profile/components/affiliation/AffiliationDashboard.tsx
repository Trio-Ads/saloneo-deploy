import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  ShareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import QRCode from 'qrcode';
import { IconButton, Panel, StatGroup } from '../../../../components/ui';
import { formatPrice } from '../../../../utils/currency';

interface MonthlyStats {
  month: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

const AffiliationDashboard: React.FC = () => {
  const { t, i18n } = useTranslation('profile');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const { affiliation, generateAffiliateLink, affiliateLinks, commissions, loadCommissions } = useAffiliationStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    // Charger les commissions pour calculer les statistiques
    loadCommissions();
  }, [loadCommissions]);

  const monthLabel = (index: number) => new Date(2000, index, 1).toLocaleDateString(i18n.language, { month: 'short' });

  // Calculer les statistiques mensuelles à partir des vraies commissions
  const monthlyStats = useMemo(() => {
    if (!commissions || commissions.length === 0) {
      // Retourner des données vides si pas de commissions
      const currentMonth = new Date().getMonth();
      return Array.from({ length: 6 }, (_, i) => ({
        month: monthLabel((currentMonth - 5 + i + 12) % 12),
        clicks: 0,
        conversions: 0,
        revenue: 0
      }));
    }

    // Grouper les commissions par mois (clé année*12+mois pour trier correctement d'une année à l'autre)
    const statsByMonth = new Map<number, MonthlyStats>();

    commissions.forEach(commission => {
      const date = new Date(commission.createdAt);
      const monthKey = date.getFullYear() * 12 + date.getMonth();

      if (!statsByMonth.has(monthKey)) {
        statsByMonth.set(monthKey, {
          month: monthLabel(date.getMonth()),
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
      const currentMonthKey = new Date().getFullYear() * 12 + new Date().getMonth();
      if (statsByMonth.has(currentMonthKey)) {
        const stats = statsByMonth.get(currentMonthKey)!;
        stats.clicks = affiliation.stats.clicksCount || 0;
      }
    }

    // Convertir en tableau et trier par date
    return Array.from(statsByMonth.entries())
      .sort(([a], [b]) => a - b)
      .map(([, stats]) => stats)
      .slice(-6); // Garder les 6 derniers mois
  }, [commissions, affiliation, i18n.language]);

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

  const growthHint = (current: number, previous: number) =>
    `${calculateGrowth(current, previous)} % ${t('affiliation_components.dashboard.vs_last_month')}`;
  const shareTargets = ['whatsapp', 'facebook', 'twitter', 'linkedin', 'email'];
  const th = 'px-5 py-3 text-[0.8125rem] font-medium text-gray-500 dark:text-gray-400';
  const td = 'px-5 py-3 whitespace-nowrap text-sm tabular-nums';
  const currentClicks = currentStats.clicks || affiliation?.stats.clicksCount || 0;
  const currentConversions = currentStats.conversions || affiliation?.stats.conversionsCount || 0;

  return (
    <div className="space-y-6">
      <Panel title={t('affiliation_components.dashboard.affiliate_link')}>
        <div className="flex items-center gap-2">
          <input readOnly value={affiliateLink} dir="ltr" onFocus={(e) => e.target.select()} aria-label={t('affiliation_components.dashboard.affiliate_link')} className="field min-w-0 flex-1 text-gray-700 dark:text-gray-300" />
          <IconButton label={t('actions.copy')} onClick={handleCopyLink} className="size-10 shrink-0 border border-gray-200 dark:border-gray-700">
            {linkCopied ? <CheckIcon className="size-5 text-emerald-600" /> : <ClipboardDocumentIcon className="size-5" />}
          </IconButton>
          <IconButton label={t('affiliation_components.marketing.qr_code.modal_title')} onClick={() => setShowQRCode(true)} className="size-10 shrink-0 border border-gray-200 dark:border-gray-700">
            <QrCodeIcon className="size-5" />
          </IconButton>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shareTargets.map((platform) => (
            <button key={platform} onClick={() => handleShare(platform)} className="btn-secondary">
              <ShareIcon className="size-4 text-gray-400" />
              {t(`affiliation_components.dashboard.share_buttons.${platform}`)}
            </button>
          ))}
        </div>
      </Panel>

      <StatGroup
        className="mb-0"
        items={[
          { label: t('affiliation_components.dashboard.current_month.clicks'), value: currentClicks, hint: growthHint(currentClicks, lastMonthStats.clicks) },
          { label: t('affiliation_components.dashboard.current_month.conversions'), value: currentConversions, hint: growthHint(currentConversions, lastMonthStats.conversions) },
          { label: t('affiliation_components.dashboard.current_month.revenue'), value: formatPrice(currentMonthRevenue, 'EUR'), hint: growthHint(currentMonthRevenue, lastMonthStats.revenue), accent: true }
        ]}
      />

      <Panel flush title={t('affiliation_components.dashboard.monthly_stats')}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className={`${th} text-start`}>{t('affiliation_components.dashboard.table_headers.month')}</th>
                <th className={`${th} text-end`}>{t('affiliation_components.dashboard.table_headers.clicks')}</th>
                <th className={`${th} text-end`}>{t('affiliation_components.dashboard.table_headers.conversions')}</th>
                <th className={`${th} text-end`}>{t('affiliation_components.dashboard.table_headers.conversion_rate')}</th>
                <th className={`${th} text-end`}>{t('affiliation_components.dashboard.table_headers.revenue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {monthlyStats.map((stat, i) => (
                <tr key={`${stat.month}-${i}`}>
                  <td className={`${td} font-medium capitalize text-gray-900 dark:text-gray-50`}>{stat.month}</td>
                  <td className={`${td} text-end text-gray-600 dark:text-gray-400`}>{stat.clicks}</td>
                  <td className={`${td} text-end text-gray-600 dark:text-gray-400`}>{stat.conversions}</td>
                  <td className={`${td} text-end text-gray-600 dark:text-gray-400`}>{stat.clicks > 0 ? ((stat.conversions / stat.clicks) * 100).toFixed(1) : 0} %</td>
                  <td className={`${td} text-end font-medium text-gray-900 dark:text-gray-50`}>{formatPrice(stat.revenue, 'EUR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={t('affiliation_components.dashboard.tips.title')}>
        <ul className="list-disc space-y-1.5 ps-5 text-sm text-gray-600 marker:text-gray-300 dark:text-gray-400 dark:marker:text-gray-600">
          <li>{t('affiliation_components.dashboard.tips.social_share')}</li>
          <li>{t('affiliation_components.dashboard.tips.quality_content')}</li>
          <li>{t('affiliation_components.dashboard.tips.target_audience')}</li>
          <li>{t('affiliation_components.dashboard.tips.use_tools')}</li>
        </ul>
      </Panel>

      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4" onClick={() => setShowQRCode(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="qr-title" className="panel animate-modal-in w-full max-w-sm p-5 dark:border-gray-800 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 id="qr-title" className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('affiliation_components.marketing.qr_code.modal_title')}</h3>
              <IconButton label={t('actions.cancel')} onClick={() => setShowQRCode(false)}>
                <XMarkIcon className="size-5" />
              </IconButton>
            </div>

            {qrCodeDataUrl && (
              <div className="flex flex-col items-center">
                <img src={qrCodeDataUrl} alt="" className="mb-4 size-56 rounded-xl border border-gray-200 dark:border-gray-800" />
                <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">{t('affiliation_components.marketing.qr_code.modal_description')}</p>
                <button onClick={handleDownloadQRCode} className="btn-primary w-full">
                  <ArrowDownTrayIcon className="size-4" />
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
