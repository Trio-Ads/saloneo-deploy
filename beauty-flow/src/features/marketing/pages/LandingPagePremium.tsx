import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, Users, TrendingUp, CreditCard, Globe, Sparkles,
  Check, ChevronDown, ChevronUp, Menu, X, Moon, Sun
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import saloneoLogo from '../assets/saloneo-logo.svg';
import '../styles/landing-premium.css';

const LandingPagePremium: React.FC = () => {
  const { t, i18n } = useTranslation('marketing');
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const features = [
    {
      icon: Calendar,
      titleKey: 'premium.features.appointments.title',
      descKey: 'premium.features.appointments.desc'
    },
    {
      icon: Users,
      titleKey: 'premium.features.clients.title',
      descKey: 'premium.features.clients.desc'
    },
    {
      icon: TrendingUp,
      titleKey: 'premium.features.team.title',
      descKey: 'premium.features.team.desc'
    },
    {
      icon: CreditCard,
      titleKey: 'premium.features.payments.title',
      descKey: 'premium.features.payments.desc'
    },
    {
      icon: Globe,
      titleKey: 'premium.features.website.title',
      descKey: 'premium.features.website.desc'
    },
    {
      icon: Sparkles,
      titleKey: 'premium.features.analytics.title',
      descKey: 'premium.features.analytics.desc'
    }
  ];

  const faqs = [
    { q: 'premium.faq.free.q', a: 'premium.faq.free.a' },
    { q: 'premium.faq.limits.q', a: 'premium.faq.limits.a' },
    { q: 'premium.faq.upgrade.q', a: 'premium.faq.upgrade.a' },
    { q: 'premium.faq.security.q', a: 'premium.faq.security.a' },
    { q: 'premium.faq.support.q', a: 'premium.faq.support.a' },
    { q: 'premium.faq.cancel.q', a: 'premium.faq.cancel.a' }
  ];

  const changeLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : i18n.language === 'en' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="landing-premium">
      {/* Header */}
      <header className="premium-header">
        <div className="header-container">
          <Link to="/" className="logo-link">
            <img src={saloneoLogo} alt="Saloneo" className="logo" />
          </Link>

          <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
              {t('premium.nav.features')}
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
              {t('premium.nav.faq')}
            </a>
            <Link to="/subscription" onClick={() => setMobileMenuOpen(false)}>
              {t('premium.nav.pricing')}
            </Link>
          </nav>

          <div className="header-actions">
            <button onClick={changeLanguage} className="icon-btn" title="Change language">
              <Globe size={20} />
              <span className="lang-code">{i18n.language.toUpperCase()}</span>
            </button>
            
            <button onClick={toggleTheme} className="icon-btn" title="Toggle theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <Link to="/login" className="btn-ghost">
              {t('premium.nav.login')}
            </Link>

            <Link to="/register" className="btn-primary">
              {t('premium.nav.signup')}
            </Link>

            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              {t('premium.hero.title')}
            </h1>
            <p className="hero-subtitle">
              {t('premium.hero.subtitle')}
            </p>
            <div className="hero-features">
              <span className="hero-feature">
                <Check size={20} /> {t('premium.hero.free')}
              </span>
              <span className="hero-feature">
                <Check size={20} /> {t('premium.hero.nocard')}
              </span>
            </div>
            <div className="hero-cta">
              <Link to="/register" className="btn-hero-primary">
                {t('premium.hero.cta.primary')}
              </Link>
              <Link to="/subscription" className="btn-hero-secondary">
                {t('premium.hero.cta.secondary')}
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">847+</span>
                <span className="stat-label">{t('premium.hero.stats.salons')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">+35%</span>
                <span className="stat-label">{t('premium.hero.stats.revenue')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">{t('premium.features.title')}</h2>
          <p className="section-subtitle">{t('premium.features.subtitle')}</p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={32} />
                </div>
                <h3 className="feature-title">{t(feature.titleKey)}</h3>
                <p className="feature-desc">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="section-container">
          <h2 className="section-title">{t('premium.faq.title')}</h2>
          <p className="section-subtitle">{t('premium.faq.subtitle')}</p>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  <span>{t(faq.q)}</span>
                  {openFaqIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {openFaqIndex === index && (
                  <div className="faq-answer">
                    {t(faq.a)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">{t('premium.cta.title')}</h2>
          <p className="cta-subtitle">{t('premium.cta.subtitle')}</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta-primary">
              {t('premium.cta.button')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="premium-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src={saloneoLogo} alt="Saloneo" className="footer-logo" />
            <p className="footer-tagline">{t('premium.footer.tagline')}</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>{t('premium.footer.product')}</h4>
              <Link to="/subscription">{t('premium.footer.pricing')}</Link>
              <a href="#features">{t('premium.footer.features')}</a>
            </div>
            
            <div className="footer-column">
              <h4>{t('premium.footer.company')}</h4>
              <a href="#faq">{t('premium.footer.faq')}</a>
              <Link to="/login">{t('premium.footer.login')}</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Saloneo. {t('premium.footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPagePremium;
