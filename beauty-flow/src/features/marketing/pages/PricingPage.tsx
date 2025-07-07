import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AwwwardsHeader from '../components/AwwwardsHeader';
import '../styles/marketing.css';
import { 
  Check, 
  X, 
  Star, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface PricingFeature {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  // Prix selon la période
  const prices = {
    monthly: {
      free: 0,
      starter: 3167,
      pro: 5000,
      enterprise: 'custom'
    },
    yearly: {
      free: 0,
      starter: 1900, // -40%
      pro: 3500, // -30%
      enterprise: 'custom'
    }
  };

  // Fonctionnalités détaillées
  const features: PricingFeature[] = [
    { name: t('marketing.pricing.comparison.features.appointments'), free: '20', starter: '60', pro: '200', enterprise: t('marketing.pricing.comparison.values.unlimited') },
    { name: t('marketing.pricing.comparison.features.clients'), free: '10', starter: '200', pro: '1000', enterprise: t('marketing.pricing.comparison.values.unlimited') },
    { name: t('marketing.pricing.comparison.features.services'), free: '5', starter: '20', pro: '50', enterprise: t('marketing.pricing.comparison.values.unlimited') },
    { name: t('marketing.pricing.comparison.features.team'), free: '1', starter: '5', pro: '10', enterprise: t('marketing.pricing.comparison.values.unlimited') },
    { name: t('marketing.pricing.comparison.features.products'), free: '5', starter: '50', pro: '200', enterprise: t('marketing.pricing.comparison.values.unlimited') },
    { name: t('marketing.pricing.comparison.features.booking'), free: true, starter: true, pro: true, enterprise: true },
    { name: t('marketing.pricing.comparison.features.sms'), free: false, starter: true, pro: true, enterprise: true },
    { name: t('marketing.pricing.comparison.features.interface'), free: false, starter: true, pro: true, enterprise: true },
    { name: t('marketing.pricing.comparison.features.inventory'), free: false, starter: true, pro: true, enterprise: true },
    { name: t('marketing.pricing.comparison.features.analytics'), free: false, starter: false, pro: true, enterprise: true },
    { name: t('marketing.pricing.comparison.features.payments'), free: false, starter: false, pro: true, enterprise: true },
    { name: t('marketing.pricing.comparison.features.multi'), free: false, starter: false, pro: false, enterprise: true },
    { name: t('marketing.pricing.comparison.features.api'), free: false, starter: false, pro: false, enterprise: true },
    { name: t('marketing.pricing.comparison.features.support'), free: false, starter: false, pro: true, enterprise: true },
    { name: t('marketing.pricing.comparison.features.training'), free: false, starter: false, pro: false, enterprise: true },
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="text-cyan-500 mx-auto" size={20} />
      ) : (
        <X className="text-gray-300 mx-auto" size={20} />
      );
    }
    return <span className="text-center block font-semibold">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Awwwards Header */}
      <AwwwardsHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50" style={{ marginTop: '100px' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-gradient">
            {t('marketing.pricing.title_detailed')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('marketing.pricing.subtitle_detailed')}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'monthly' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              {t('marketing.pricing.toggle.monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'yearly' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              {t('marketing.pricing.toggle.yearly')}
              <span className="ml-2 text-cyan-600 text-sm font-bold">
                {t('marketing.pricing.toggle.save')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{t('marketing.pricing.plans.free.name_simple')}</h3>
                <p className="text-gray-600 mb-4">{t('marketing.pricing.plans.free.description')}</p>
                <div className="text-4xl font-bold text-primary mb-2">
                  {t('marketing.pricing.plans.free.price')} <span className="text-lg font-normal">DZD</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.free.features.0')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.free.features.1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.free.features.3')}</span>
                </li>
              </ul>
              <Link 
                to="/register" 
                className="btn-secondary w-full text-center"
              >
                {t('marketing.pricing.plans.free.button')}
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative border-2 border-primary transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
                  {t('marketing.pricing.plans.starter.popular')}
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{t('marketing.pricing.plans.starter.name_simple')}</h3>
                <p className="text-gray-600 mb-4">{t('marketing.pricing.plans.starter.description')}</p>
                <div className="text-4xl font-bold text-primary mb-2">
                  {prices[billingPeriod].starter} 
                  <span className="text-lg font-normal">DZD{t('marketing.pricing.plans.starter.period')}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-cyan-600 font-semibold">
                    {t('marketing.pricing.plans.starter.save_amount')}
                  </p>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.starter.features.0')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.starter.features.1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.starter.features.4')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.starter.features.7')}</span>
                </li>
              </ul>
              <Link 
                to="/register" 
                className="btn-primary w-full text-center"
              >
                {t('marketing.pricing.plans.starter.button')}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{t('marketing.pricing.plans.pro.name_simple')}</h3>
                <p className="text-gray-600 mb-4">{t('marketing.pricing.plans.pro.description')}</p>
                <div className="text-4xl font-bold text-primary mb-2">
                  {prices[billingPeriod].pro} 
                  <span className="text-lg font-normal">DZD{t('marketing.pricing.plans.pro.period')}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-cyan-600 font-semibold">
                    {t('marketing.pricing.plans.pro.save_amount')}
                  </p>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.pro.features.0')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.pro.features.1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.pro.features.6')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.pro.features.7')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-500 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.pro.features.5')}</span>
                </li>
              </ul>
              <Link 
                to="/register" 
                className="btn-secondary w-full text-center"
              >
                {t('marketing.pricing.plans.pro.button')}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{t('marketing.pricing.plans.enterprise.name_simple')}</h3>
                <p className="text-gray-300 mb-4">{t('marketing.pricing.plans.enterprise.description')}</p>
                <div className="text-4xl font-bold mb-2">
                  {t('marketing.pricing.plans.enterprise.price')}
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-400 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.enterprise.features.0')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-400 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.enterprise.features.1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-400 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.enterprise.features.2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-400 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.enterprise.features.3')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-cyan-400 flex-shrink-0" size={20} />
                  <span>{t('marketing.pricing.plans.enterprise.features.4')}</span>
                </li>
              </ul>
              <button 
                onClick={() => navigate('/contact')}
                className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('marketing.pricing.plans.enterprise.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            {t('marketing.pricing.comparison.title')}
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            {t('marketing.pricing.comparison.subtitle')}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6">{t('marketing.pricing.comparison.features.appointments').split(' ')[0]}</th>
                  <th className="text-center py-4 px-6">
                    <div className="font-bold text-lg">{t('marketing.pricing.plans.free.name_simple')}</div>
                    <div className="text-sm text-gray-600">0 DZD</div>
                  </th>
                  <th className="text-center py-4 px-6 bg-blue-50">
                    <div className="font-bold text-lg text-primary">{t('marketing.pricing.plans.starter.name_simple')}</div>
                    <div className="text-sm text-primary">
                      {prices[billingPeriod].starter} DZD{t('marketing.pricing.plans.starter.period')}
                    </div>
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="font-bold text-lg">{t('marketing.pricing.plans.pro.name_simple')}</div>
                    <div className="text-sm text-gray-600">
                      {prices[billingPeriod].pro} DZD{t('marketing.pricing.plans.pro.period')}
                    </div>
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="font-bold text-lg">{t('marketing.pricing.plans.enterprise.name_simple')}</div>
                    <div className="text-sm text-gray-600">{t('marketing.pricing.plans.enterprise.price')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{feature.name}</td>
                    <td className="py-4 px-6 text-center">
                      {renderFeatureValue(feature.free)}
                    </td>
                    <td className="py-4 px-6 text-center bg-blue-50">
                      {renderFeatureValue(feature.starter)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {renderFeatureValue(feature.pro)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {renderFeatureValue(feature.enterprise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {t('marketing.roi.title_static')}
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('marketing.roi.subtitle_static')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">+47%</div>
              <p className="text-lg opacity-90">{t('marketing.roi.stats.revenue_increase')}</p>
              <p className="text-sm opacity-75 mt-2">{t('marketing.roi.stats.revenue_increase_note')}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">-68%</div>
              <p className="text-lg opacity-90">{t('marketing.roi.stats.no_show_reduction')}</p>
              <p className="text-sm opacity-75 mt-2">{t('marketing.roi.stats.no_show_note')}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">15h</div>
              <p className="text-lg opacity-90">{t('marketing.roi.stats.time_saved')}</p>
              <p className="text-sm opacity-75 mt-2">{t('marketing.roi.stats.time_saved_note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            {t('marketing.faq.title')}
          </h2>

          <div className="space-y-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <HelpCircle className="text-primary" size={20} />
                  {t(`marketing.faq.items.${index}.question`)}
                </h3>
                <p className="text-gray-600">
                  {t(`marketing.faq.items.${index}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('marketing.cta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('marketing.cta.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="btn-primary">
              {t('marketing.cta.buttons.start')}
              <ArrowRight className="inline ml-2" size={20} />
            </Link>
            <Link to="/contact" className="btn-secondary">
              {t('marketing.cta.buttons.contact')}
            </Link>
          </div>
          <p className="text-gray-500 mt-6">
            {t('marketing.cta.note')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
