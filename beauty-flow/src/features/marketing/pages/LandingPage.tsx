import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStabilityAI } from '../hooks/useStabilityAI';
import { use3DModels } from '../hooks/use3DModels';
import AwwwardsHeader from '../components/AwwwardsHeader';
import '../styles/marketing.css';
import api from '../../../services/api';

// Import direct de la version lite pour un chargement rapide
import { Hero3DLite } from '../components/Hero3DLite';

// Lazy load de la version complète pour ceux qui veulent plus de détails
const Hero3DFull = lazy(() => import('../components/Hero3D').then(module => ({ default: module.Hero3D })));

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
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      {/* Awwwards Header */}
      <AwwwardsHeader />
      
      {/* Hero Section 3D */}
      <section className="hero-section-3d" style={{ paddingTop: '120px', position: 'relative', minHeight: '100vh' }}>
        {/* Canvas 3D en arrière-plan */}
        {show3D && (
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de l'expérience 3D...</p>
              </div>
            </div>
          }>
            <Hero3DLite logoModelUrl={models?.logo ? getModelUrl(models.logo.url) : undefined} quality="medium" />
          </Suspense>
        )}

        {/* Contenu Hero au premier plan */}
        <div className="hero-content-3d" style={{ position: 'relative', zIndex: 10 }}>
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="hero-text-3d">
                <h1 className="hero-headline-3d text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
                  Votre salon mérite une infrastructure à la hauteur de vos ambitions
                </h1>
                <p className="hero-subheadline-3d text-xl md:text-2xl mb-8 text-white/90 drop-shadow-lg">
                  La plateforme de gestion qui équipe les salons les plus performants d'Algérie. 
                  Transformez votre expertise beauté en machine de croissance.
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
                      <p className="text-sm text-white">847+ salons nous font confiance</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLeadCapture} className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre email professionnel"
                      className="flex-1 px-6 py-4 rounded-lg bg-white/90 backdrop-blur-md border border-white/30 focus:outline-none focus:border-primary placeholder-gray-600"
                      required
                    />
                    <button type="submit" className="btn-primary-3d px-8 py-4 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300" disabled={loading}>
                      {loading ? 'Chargement...' : 'Commencer Gratuitement'}
                    </button>
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    30 jours d'essai gratuit • Sans carte bancaire • Installation en 5 minutes
                  </p>
                </form>

                <div className="hero-cta-group flex gap-4">
                  <button 
                    onClick={() => setShowVideo(true)}
                    className="btn-secondary-3d flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300"
                  >
                    <Play size={20} />
                    Voir la démo (2 min)
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
                  <div className="stat-card-3d absolute top-0 right-0 bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <TrendingUp className="text-cyan-400 mb-2" size={32} />
                    <p className="text-3xl font-bold text-white">+47%</p>
                    <p className="text-white/80">Augmentation CA</p>
                  </div>
                  
                  <div className="stat-card-3d absolute bottom-0 left-0 bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Clock className="text-blue-400 mb-2" size={32} />
                    <p className="text-3xl font-bold text-white">15h</p>
                    <p className="text-white/80">Économisées/semaine</p>
                  </div>
                  
                  <div className="stat-card-3d absolute top-1/2 right-1/4 bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <Users className="text-purple-400 mb-2" size={32} />
                    <p className="text-3xl font-bold text-white">847+</p>
                    <p className="text-white/80">Salons actifs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">847+</p>
              <p className="text-sm">Salons actifs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">127K+</p>
              <p className="text-sm">Rendez-vous gérés</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">98%</p>
              <p className="text-sm">Satisfaction client</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm">Support dédié</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Transformez les défis en opportunités
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Saloneo résout les problèmes quotidiens des salons modernes avec une infrastructure digitale complète
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
              <h3 className="text-2xl font-bold mb-6 text-primary">Avec Saloneo</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="text-cyan-500 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Calendrier intelligent synchronisé</p>
                    <p className="text-gray-600">Zéro conflit, notifications automatiques, gestion optimale</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-cyan-500 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Page salon professionnelle</p>
                    <p className="text-gray-600">Réservation 24/7, SEO local optimisé, avis clients</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-cyan-500 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Analytics et insights business</p>
                    <p className="text-gray-600">KPIs en temps réel, optimisation des revenus, croissance pilotée</p>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Calculez votre retour sur investissement
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Découvrez combien Saloneo peut augmenter vos revenus dès le premier mois
              </p>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
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
                    <div className="flex justify-between mb-4 text-cyan-600">
                      <span>Revenus avec Saloneo (+35%)</span>
                      <span className="font-bold">270 000 DZD</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary">
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
      <section id="pricing" className="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Des tarifs adaptés à vos ambitions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Commencez gratuitement, évoluez à votre rythme. Sans engagement, sans surprise.
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
                <p className="text-cyan-600 font-semibold">Économisez 40%</p>
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
                <p className="text-cyan-600 font-semibold">Économisez 30%</p>
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
            <Link to="/pricing" className="text-primary hover:underline">
              Voir tous les forfaits et options →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Ils ont transformé leur salon avec Saloneo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment nos clients ont révolutionné leur business
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {images?.security && (
                <img 
                  src={getImageUrl(images.security.url)} 
                  alt="Sécurité SATIM"
                  className="rounded-2xl shadow-2xl"
                />
              )}
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Sécurité et conformité garanties
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Vos données et celles de vos clients sont protégées selon les plus hauts standards
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Shield className="text-primary mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold mb-1">Paiements sécurisés SATIM</h4>
                    <p className="text-gray-600">
                      Intégration officielle avec le système de paiement algérien. 
                      Transactions 100% sécurisées et conformes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Shield className="text-primary mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold mb-1">Données chiffrées</h4>
                    <p className="text-gray-600">
                      Chiffrement SSL/TLS de bout en bout. 
                      Vos données sont hébergées sur des serveurs sécurisés.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Shield className="text-primary mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold mb-1">Conformité RGPD</h4>
                    <p className="text-gray-600">
                      Respect total de la vie privée. 
                      Contrôle total sur vos données.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            Prêt à transformer votre salon ?
          </h2>
          <p className="cta-description">
            Rejoignez les 847+ salons qui ont déjà révolutionné leur business avec Saloneo
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-white">
              Commencer l'essai gratuit
            </Link>
            <button 
              onClick={() => setShowVideo(true)}
              className="btn-white flex items-center gap-2"
            >
              <Play size={20} />
              Voir la démo
            </button>
          </div>
          <p className="text-white/80 mt-6">
            ✓ 30 jours gratuits &nbsp;&nbsp; ✓ Sans carte bancaire &nbsp;&nbsp; ✓ Installation en 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Saloneo</h3>
              <p className="text-gray-400">
                L'infrastructure digitale des salons modernes
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features">Fonctionnalités</Link></li>
                <li><Link to="/pricing">Tarifs</Link></li>
                <li><Link to="/security">Sécurité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/blog">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help">Centre d'aide</Link></li>
                <li><Link to="/docs">Documentation</Link></li>
                <li><a href="mailto:support@saloneo.com">support@saloneo.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Saloneo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              ✕ Fermer
            </button>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-white">Vidéo de démonstration</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
