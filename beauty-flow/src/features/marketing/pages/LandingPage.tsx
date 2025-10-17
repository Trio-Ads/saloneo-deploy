import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStabilityAI } from '../hooks/useStabilityAI';
import { use3DModels } from '../hooks/use3DModels';
import '../styles/marketing.css';
import api from '../../../services/api';

// Hook pour vérifier l'authentification
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);
  
  return { isAuthenticated };
};

// NOTE: Cette page n'est plus utilisée - LandingPagePremium est maintenant la page principale
// Les composants 3D ont été supprimés

// Import des icônes
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  CreditCard,
  BarChart,
  Smartphone,
  Globe,
  Zap,
  Check,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation('marketing');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { images, getImageUrl } = useStabilityAI();
  const { models, getModelUrl } = use3DModels();
  const [showVideo, setShowVideo] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [show3D, setShow3D] = useState(true);

  // Track page visit
  useEffect(() => {
    api.post('/marketing/stats/visit').catch(console.error);
  }, []);

  // Capture lead
  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/marketing/lead/capture', {
        email,
        name: 'Lead Landing Page',
        source: 'landing-hero'
      });
      
      // Rediriger vers l'inscription
      navigate('/register', { state: { email } });
    } catch (error) {
      console.error('Erreur capture lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section-3d" style={{ paddingTop: '120px', position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)' }}>
        {/* Contenu Hero au premier plan */}
        <div className="hero-content-3d" style={{ position: 'relative', zIndex: 10 }}>
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="hero-text-3d">
                <h1 className="hero-headline-3d text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
                  {t('hero.title', 'Révolutionnez la gestion de votre salon de beauté')}
                </h1>
                <p className="hero-subheadline-3d text-xl md:text-2xl mb-8 text-white/90 drop-shadow-lg">
                  {t('hero.subtitle', 'La solution tout-en-un pour digitaliser et développer votre activité. Rejoignez 847+ salons qui ont transformé leur business.')}
                </p>
                
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-2">
                      {images?.testimonials.slice(0, 3).map((img, i) => (
                        <img 
                          key={i}
                          src={getImageUrl(img.url)} 
                          alt="Client"
                          className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                        />
                      ))}
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                      </div>
                      <p className="text-sm text-white">{t('hero.trust', '847+ salons nous font confiance')}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLeadCapture} className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('hero.emailPlaceholder', 'Votre email professionnel')}
                      className="flex-1 px-6 py-4 rounded-lg bg-white/90 backdrop-blur-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-600 dark:bg-gray-800/90 dark:text-white dark:placeholder-gray-400"
                      required
                    />
                    <button type="submit" className="btn-primary-3d px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold rounded-lg shadow-orange-lg hover:shadow-orange-xl transform hover:scale-105 transition-all duration-300" disabled={loading}>
                      {loading ? t('hero.loading', 'Chargement...') : t('hero.cta', 'Commencer Gratuitement')}
                    </button>
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    {t('hero.guarantee', '30 jours d\'essai gratuit • Sans carte bancaire • Installation en 5 minutes')}
                  </p>
                </form>

                <div className="hero-cta-group flex gap-4">
                  <button 
                    onClick={() => setShowVideo(true)}
                    className="btn-secondary-3d flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white border border-orange-300/30 rounded-lg hover:bg-white/30 hover:border-orange-300/50 transition-all duration-300"
                  >
                    <Play size={20} />
                    {t('hero.demo', 'Voir la démo (2 min)')}
                  </button>
                  <button 
                    onClick={() => setShow3D(!show3D)}
                    className="btn-secondary-3d flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300"
                  >
                    {show3D ? '2D' : '3D'}
                  </button>
                </div>
              </div>

              {/* Stats flottantes */}
              <div className="hidden md:block relative">
                <div className="floating-stats-3d">
                  <div className="stat-card-3d absolute top-0 right-0 bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-orange-lg border border-orange-300/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <TrendingUp className="text-orange-300 mb-2" size={32} />
                    <p className="text-3xl font-bold text-white">+47%</p>
                    <p className="text-white/80">{t('stats.revenue', 'Augmentation CA')}</p>
                  </div>
                  
                  <div className="stat-card-3d absolute bottom-0 left-0 bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-orange-lg border border-orange-300/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Clock className="text-orange-200 mb-2" size={32} />
                    <p className="text-3xl font-bold text-white">15h</p>
                    <p className="text-white/80">{t('stats.timeSaved', 'Économisées/semaine')}</p>
                  </div>
                  
                  <div className="stat-card-3d absolute top-1/2 right-1/4 bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-orange-lg border border-orange-300/20 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <Users className="text-orange-100 mb-2" size={32} />
                    <p className="text-3xl font-bold text-white">847+</p>
                    <p className="text-white/80">{t('stats.salons', 'Salons actifs')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-gray-300">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">847+</p>
              <p className="text-sm">{t('socialProof.salons', 'Salons actifs')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">127K+</p>
              <p className="text-sm">{t('socialProof.appointments', 'Rendez-vous gérés')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">98%</p>
              <p className="text-sm">{t('socialProof.satisfaction', 'Satisfaction client')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">24/7</p>
              <p className="text-sm">{t('socialProof.support', 'Support dédié')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              {t('problemSolution.title', 'Transformez les défis en opportunités')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('problemSolution.subtitle', 'Saloneo résout les problèmes quotidiens des salons modernes avec une infrastructure digitale complète')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-bold mb-6">Avant Saloneo</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <div>
                    <p className="font-semibold">Agenda papier chaotique</p>
                    <p className="text-gray-600">Rendez-vous perdus, doubles réservations, confusion</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <div>
                    <p className="font-semibold">Clients invisibles en ligne</p>
                    <p className="text-gray-600">Pas de présence digitale, clients perdus au profit de la concurrence</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <div>
                    <p className="font-semibold">Gestion financière approximative</p>
                    <p className="text-gray-600">Revenus non optimisés, fuites de trésorerie</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-500">Avec Saloneo</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="text-orange-500 mt-1" size={20} />
                  <div>
                    <p className="font-semibold dark:text-white">Calendrier intelligent synchronisé</p>
                    <p className="text-gray-600 dark:text-gray-300">Zéro conflit, notifications automatiques, gestion optimale</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-orange-500 mt-1" size={20} />
                  <div>
                    <p className="font-semibold dark:text-white">Page salon professionnelle</p>
                    <p className="text-gray-600 dark:text-gray-300">Réservation 24/7, SEO local optimisé, avis clients</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-orange-500 mt-1" size={20} />
                  <div>
                    <p className="font-semibold dark:text-white">Analytics et insights business</p>
                    <p className="text-gray-600 dark:text-gray-300">KPIs en temps réel, optimisation des revenus, croissance pilotée</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {images?.transformation && (
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={getImageUrl(images.transformation.url)} 
                alt="Transformation digitale"
                className="w-full"
              />
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Une infrastructure complète pour votre succès
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque fonctionnalité a été pensée pour maximiser votre efficacité et votre rentabilité
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card fade-in-up">
              <div className="feature-icon">
                <Calendar className="text-white" />
              </div>
              <h3 className="feature-title">Gestion des Rendez-vous</h3>
              <p className="feature-description">
                Calendrier intelligent avec gestion des conflits, rappels automatiques, 
                et synchronisation temps réel sur tous vos appareils.
              </p>
            </div>

            <div className="feature-card fade-in-up delay-100">
              <div className="feature-icon">
                <Users className="text-white" />
              </div>
              <h3 className="feature-title">Base Clients Enrichie</h3>
              <p className="feature-description">
                Historique complet, préférences, questionnaires personnalisés. 
                Transformez chaque visite en expérience sur-mesure.
              </p>
            </div>

            <div className="feature-card fade-in-up delay-200">
              <div className="feature-icon">
                <Globe className="text-white" />
              </div>
              <h3 className="feature-title">Présence Digitale</h3>
              <p className="feature-description">
                Page salon professionnelle avec réservation en ligne 24/7. 
                10 templates premium inclus, SEO local optimisé.
              </p>
            </div>

            <div className="feature-card fade-in-up delay-300">
              <div className="feature-icon">
                <CreditCard className="text-white" />
              </div>
              <h3 className="feature-title">Paiements Sécurisés</h3>
              <p className="feature-description">
                Intégration SATIM native pour cartes algériennes. 
                Facturation automatisée, suivi des revenus en temps réel.
              </p>
            </div>

            <div className="feature-card fade-in-up">
              <div className="feature-icon">
                <BarChart className="text-white" />
              </div>
              <h3 className="feature-title">Analytics Avancés</h3>
              <p className="feature-description">
                KPIs de performance, analyse clientèle, prévisions de croissance. 
                Prenez des décisions basées sur les données.
              </p>
            </div>

            <div className="feature-card fade-in-up delay-100">
              <div className="feature-icon">
                <Smartphone className="text-white" />
              </div>
              <h3 className="feature-title">Mobile First</h3>
              <p className="feature-description">
                Interface responsive parfaite sur tous les écrans. 
                Gérez votre salon depuis n'importe où, n'importe quand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                {t('roi.title', 'Calculez votre retour sur investissement')}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {t('roi.subtitle', 'Découvrez combien Saloneo peut augmenter vos revenus dès le premier mois')}
              </p>

              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-orange-lg border border-orange-500/10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre de rendez-vous par mois
                    </label>
                    <input 
                      type="range" 
                      min="50" 
                      max="300" 
                      defaultValue="100"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>50</span>
                      <span>300</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prix moyen par service (DZD)
                    </label>
                    <input 
                      type="number" 
                      defaultValue="2000"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex justify-between mb-4">
                      <span>Revenus actuels</span>
                      <span className="font-bold">200 000 DZD</span>
                    </div>
                    <div className="flex justify-between mb-4 text-orange-600 dark:text-orange-500">
                      <span>Revenus avec Saloneo (+35%)</span>
                      <span className="font-bold">270 000 DZD</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-orange-600 dark:text-orange-500">
                      <span>Gain mensuel</span>
                      <span>+70 000 DZD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              {images?.roi && (
                <img 
                  src={getImageUrl(images.roi.url)} 
                  alt="ROI Visualization"
                  className="rounded-2xl shadow-2xl mx-auto"
                />
              )}
              <p className="mt-6 text-lg font-semibold">
                ROI moyen : 3 700% la première année
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              {t('pricing.title', 'Des tarifs adaptés à vos ambitions')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('pricing.subtitle', 'Commencez gratuitement, évoluez à votre rythme. Sans engagement, sans surprise.')}
            </p>
          </div>

          <div className="pricing-grid">
            {/* Plan Gratuit */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-title">GRATUIT</h3>
                <div className="pricing-price">
                  <span className="currency">0</span> DZD
                  <span className="period">/mois</span>
                </div>
                <p className="text-gray-600">Pour découvrir Saloneo</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>20 rendez-vous/mois</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>10 clients max</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>5 services</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>Réservation en ligne</span>
                </li>
              </ul>
              <Link to="/register" className="btn-secondary w-full text-center">
                Commencer Gratuitement
              </Link>
            </div>

            {/* Plan Starter */}
            <div className="pricing-card featured">
              <div className="pricing-header">
                <h3 className="pricing-title">STARTER</h3>
                <div className="pricing-price">
                  <span className="currency">1 900</span> DZD
                  <span className="period">/mois</span>
                </div>
                <p className="pricing-original">3 167 DZD</p>
                <p className="text-orange-600 dark:text-orange-500 font-semibold">Économisez 40%</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>60 rendez-vous/mois</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>200 clients</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>20 services</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>5 membres d'équipe</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>Interface personnalisée</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>Gestion des stocks</span>
                </li>
              </ul>
              <Link to="/register" className="btn-primary w-full text-center">
                Essai Gratuit 30 Jours
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-title">PRO</h3>
                <div className="pricing-price">
                  <span className="currency">3 500</span> DZD
                  <span className="period">/mois</span>
                </div>
                <p className="pricing-original">5 000 DZD</p>
                <p className="text-orange-600 dark:text-orange-500 font-semibold">Économisez 30%</p>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>200 rendez-vous/mois</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>1000 clients</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>50 services</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>10 membres d'équipe</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>Toutes les fonctionnalités</span>
                </li>
                <li className="pricing-feature">
                  <div className="pricing-feature-icon">✓</div>
                  <span>Support prioritaire</span>
                </li>
              </ul>
              <Link to="/register" className="btn-secondary w-full text-center">
                Essai Gratuit 30 Jours
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg font-semibold mb-4">
              💰 Économisez jusqu'à 50% avec nos forfaits annuels
            </p>
            <Link to="/pricing" className="text-orange-600 dark:text-orange-500 hover:underline font-semibold">
              {t('pricing.viewAll', 'Voir tous les forfaits et options')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              {t('testimonials.title', 'Ils ont transformé leur salon avec Saloneo')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('testimonials.subtitle', 'Découvrez comment nos clients ont révolutionné leur business')}
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card fade-in-up">
              <div className="testimonial-rating mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "Saloneo a complètement transformé notre façon de travailler. 
                Nous avons augmenté notre chiffre d'affaires de 45% en seulement 3 mois. 
                L'interface est intuitive et nos clients adorent pouvoir réserver en ligne."
              </p>
              <div className="testimonial-author">
                {images?.testimonials[0] && (
                  <img 
                    src={getImageUrl(images.testimonials[0].url)} 
                    alt="Amina"
                    className="testimonial-avatar"
                  />
                )}
                <div className="testimonial-info">
                  <p className="testimonial-name">Amina Benali</p>
                  <p className="testimonial-role">Salon Élégance, Alger</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card fade-in-up delay-100">
              <div className="testimonial-rating mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "Je gagne 15 heures par semaine grâce à l'automatisation. 
                Plus de double réservations, plus de confusion. 
                Mon équipe est plus efficace et mes clients plus satisfaits."
              </p>
              <div className="testimonial-author">
                {images?.testimonials[1] && (
                  <img 
                    src={getImageUrl(images.testimonials[1].url)} 
                    alt="Sarah"
                    className="testimonial-avatar"
                  />
                )}
                <div className="testimonial-info">
                  <p className="testimonial-name">Sarah Khelifi</p>
                  <p className="testimonial-role">Beauty Center, Oran</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card fade-in-up delay-200">
              <div className="testimonial-rating mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "L'investissement le plus rentable que j'ai fait pour mon salon. 
                ROI en moins d'un mois. Les analytics m'aident à prendre 
                les bonnes décisions au bon moment."
              </p>
              <div className="testimonial-author">
                {images?.testimonials[2] && (
                  <img 
                    src={getImageUrl(images.testimonials[2].url)} 
                    alt="Mohamed"
                    className="testimonial-avatar"
                  />
                )}
                <div className="testimonial-info">
                  <p className="testimonial-name">Mohamed Rahmani</p>
                  <p className="testimonial-role">Barber Shop Pro, Constantine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {images?.security && (
                <img 
                  src={getImageUrl(images.security.url)} 
                  alt="Sécurité SATIM"
                  className="rounded-2xl shadow-orange-xl border border-orange-500/10"
                />
              )}
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                {t('security.title', 'Sécurité et conformité garanties')}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {t('security.subtitle', 'Vos données et celles de vos clients sont protégées selon les plus hauts standards')}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Shield className="text-orange-600 dark:text-orange-500 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-white">{t('security.satim', 'Paiements sécurisés SATIM')}</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('security.satimDesc', 'Intégration officielle avec le système de paiement algérien. Transactions 100% sécurisées et conformes.')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Shield className="text-orange-600 dark:text-orange-500 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-white">{t('security.encryption', 'Données chiffrées')}</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('security.encryptionDesc', 'Chiffrement SSL/TLS de bout en bout. Vos données sont hébergées sur des serveurs sécurisés.')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Shield className="text-orange-600 dark:text-orange-500 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-white">{t('security.gdpr', 'Conformité RGPD')}</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('security.gdprDesc', 'Respect total de la vie privée. Contrôle total sur vos données.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="cta-section py-20 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="cta-content relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="cta-title text-5xl font-bold text-white mb-6">
            {t('cta.title', 'Prêt à transformer votre salon ?')}
          </h2>
          <p className="cta-description text-xl text-white/90 mb-8">
            {t('cta.subtitle', 'Rejoignez les 847+ salons qui ont déjà révolutionné leur business avec Saloneo')}
          </p>
          <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-white px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
              {t('cta.start', 'Commencer l\'essai gratuit')}
            </Link>
            <button 
              onClick={() => setShowVideo(true)}
              className="btn-white flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 font-bold rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              <Play size={20} />
              {t('cta.demo', 'Voir la démo')}
            </button>
          </div>
          <p className="text-white/80 mt-6">
            {t('cta.guarantee', '✓ 30 jours gratuits   ✓ Sans carte bancaire   ✓ Installation en 5 minutes')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 border-t border-orange-500/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Saloneo</h3>
              <p className="text-gray-400">
                {t('footer.tagline', 'L\'infrastructure digitale des salons modernes')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-500">{t('footer.product', 'Produit')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-orange-500 transition-colors">{t('footer.features', 'Fonctionnalités')}</Link></li>
                <li><Link to="/pricing" className="hover:text-orange-500 transition-colors">{t('footer.pricing', 'Tarifs')}</Link></li>
                <li><Link to="/security" className="hover:text-orange-500 transition-colors">{t('footer.security', 'Sécurité')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-500">{t('footer.company', 'Entreprise')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">{t('footer.about', 'À propos')}</Link></li>
                <li><Link to="/contact" className="hover:text-orange-500 transition-colors">{t('footer.contact', 'Contact')}</Link></li>
                <li><Link to="/blog" className="hover:text-orange-500 transition-colors">{t('footer.blog', 'Blog')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-500">{t('footer.support', 'Support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-orange-500 transition-colors">{t('footer.help', 'Centre d\'aide')}</Link></li>
                <li><Link to="/docs" className="hover:text-orange-500 transition-colors">{t('footer.docs', 'Documentation')}</Link></li>
                <li><a href="mailto:support@saloneo.com" className="hover:text-orange-500 transition-colors">support@saloneo.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Saloneo. {t('footer.rights', 'Tous droits réservés.')}</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-orange-500 transition-colors font-semibold"
            >
              ✕ {t('modal.close', 'Fermer')}
            </button>
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center border-2 border-orange-500/20 shadow-orange-xl">
              <p className="text-white text-xl">{t('modal.demoVideo', 'Vidéo de démonstration')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
