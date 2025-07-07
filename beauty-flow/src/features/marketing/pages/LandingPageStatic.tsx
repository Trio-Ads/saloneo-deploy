import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SaloneoLogo } from '../components/SaloneoLogo';
import '../styles/marketing.css';
import api from '../../../services/api';

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
  Play,
  ChevronRight,
  Award,
  Heart,
  Sparkles,
  Target,
  Palette,
  Scissors
} from 'lucide-react';

const LandingPageStatic: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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
      
      navigate('/register', { state: { email } });
    } catch (error) {
      console.error('Erreur capture lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page-static">
      {/* Header moderne */}
      <header className="header-static">
        <div className="header-container">
          <div className="header-content">
            <SaloneoLogo className="header-logo" />
            
            <nav className="header-nav">
              <a href="#features" className="nav-link">Fonctionnalités</a>
              <a href="#pricing" className="nav-link">Tarifs</a>
              <a href="#testimonials" className="nav-link">Témoignages</a>
              <a href="#contact" className="nav-link">Contact</a>
            </nav>

            <div className="header-actions">
              <Link to="/login" className="btn-ghost">Connexion</Link>
              <Link to="/register" className="btn-primary-small">
                Essai gratuit
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Statique */}
      <section className="hero-static">
        <div className="hero-background">
          <div className="gradient-mesh"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <Sparkles size={16} />
                <span>La solution n°1 en Algérie</span>
              </div>

              <h1 className="hero-title">
                Transformez votre salon en 
                <span className="text-gradient"> entreprise digitale prospère</span>
              </h1>

              <p className="hero-description">
                Saloneo équipe les meilleurs salons, barbershops et spas d'Algérie 
                avec une plateforme tout-en-un qui automatise la gestion, 
                booste les revenus et fidélise la clientèle.
              </p>

              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">847+</div>
                  <div className="stat-label">Salons actifs</div>
                </div>
                <div className="stat">
                  <div className="stat-number">+47%</div>
                  <div className="stat-label">Augmentation CA</div>
                </div>
                <div className="stat">
                  <div className="stat-number">15h</div>
                  <div className="stat-label">Économisées/semaine</div>
                </div>
              </div>

              <form onSubmit={handleLeadCapture} className="hero-form">
                <div className="form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre email professionnel"
                    className="form-input"
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Chargement...' : 'Démarrer gratuitement'}
                    <ArrowRight size={20} />
                  </button>
                </div>
                <p className="form-note">
                  ✓ 30 jours gratuits &nbsp; ✓ Sans carte bancaire &nbsp; ✓ Installation en 5 min
                </p>
              </form>

              <div className="hero-clients">
                <div className="clients-avatars">
                  <div className="avatar avatar-1"></div>
                  <div className="avatar avatar-2"></div>
                  <div className="avatar avatar-3"></div>
                  <div className="avatar avatar-4"></div>
                </div>
                <div className="clients-text">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <span>Noté 4.9/5 par nos clients</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="dashboard-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-sidebar">
                    <div className="sidebar-item active"></div>
                    <div className="sidebar-item"></div>
                    <div className="sidebar-item"></div>
                    <div className="sidebar-item"></div>
                  </div>
                  <div className="mockup-main">
                    <div className="calendar-grid">
                      {[...Array(35)].map((_, i) => (
                        <div key={i} className={`calendar-day ${i % 7 === 0 ? 'weekend' : ''} ${i === 15 ? 'today' : ''}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-cards">
                <div className="float-card card-1">
                  <TrendingUp size={24} />
                  <span>+127 clients ce mois</span>
                </div>
                <div className="float-card card-2">
                  <Calendar size={24} />
                  <span>32 RDV aujourd'hui</span>
                </div>
                <div className="float-card card-3">
                  <Award size={24} />
                  <span>Taux satisfaction 98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problème/Solution */}
      <section className="problem-solution">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Libérez-vous des contraintes qui freinent votre croissance
            </h2>
            <p className="section-subtitle">
              Saloneo transforme chaque défi en opportunité de développement
            </p>
          </div>

          <div className="comparison-grid">
            <div className="comparison-card before">
              <div className="card-header">
                <div className="card-icon">
                  <Clock size={24} />
                </div>
                <h3>Sans Saloneo</h3>
              </div>
              <ul className="comparison-list">
                <li>
                  <span className="icon-x">✗</span>
                  Agenda papier chaotique et erreurs fréquentes
                </li>
                <li>
                  <span className="icon-x">✗</span>
                  Clients perdus faute de rappels
                </li>
                <li>
                  <span className="icon-x">✗</span>
                  Pas de présence en ligne professionnelle
                </li>
                <li>
                  <span className="icon-x">✗</span>
                  Gestion financière approximative
                </li>
                <li>
                  <span className="icon-x">✗</span>
                  Équipe désorganisée et stressée
                </li>
              </ul>
            </div>

            <div className="comparison-card after">
              <div className="card-header">
                <div className="card-icon">
                  <Zap size={24} />
                </div>
                <h3>Avec Saloneo</h3>
              </div>
              <ul className="comparison-list">
                <li>
                  <Check size={20} className="icon-check" />
                  Agenda digital synchronisé en temps réel
                </li>
                <li>
                  <Check size={20} className="icon-check" />
                  Rappels SMS automatiques (0% no-show)
                </li>
                <li>
                  <Check size={20} className="icon-check" />
                  Page salon pro avec réservation 24/7
                </li>
                <li>
                  <Check size={20} className="icon-check" />
                  Analytics et rapports financiers détaillés
                </li>
                <li>
                  <Check size={20} className="icon-check" />
                  Équipe coordonnée et productive
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section id="features" className="features-static">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Tout ce dont vous avez besoin pour dominer votre marché
            </h2>
            <p className="section-subtitle">
              Une plateforme complète conçue par des experts du secteur beauté
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon gradient-1">
                <Calendar size={32} />
              </div>
              <h3>Agenda Intelligent</h3>
              <p>
                Gestion automatisée des rendez-vous avec détection des conflits, 
                optimisation du planning et synchronisation multi-appareils.
              </p>
              <div className="feature-benefits">
                <span>✓ Zéro double booking</span>
                <span>✓ Rappels SMS auto</span>
                <span>✓ Sync Google Calendar</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon gradient-2">
                <Users size={32} />
              </div>
              <h3>CRM Clients Avancé</h3>
              <p>
                Base clients enrichie avec historique complet, préférences, 
                notes privées et segmentation automatique.
              </p>
              <div className="feature-benefits">
                <span>✓ Fiches détaillées</span>
                <span>✓ Historique complet</span>
                <span>✓ Marketing ciblé</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon gradient-3">
                <Globe size={32} />
              </div>
              <h3>Présence Digitale Pro</h3>
              <p>
                Page salon personnalisée avec réservation en ligne, 
                galerie photos, avis clients et SEO local optimisé.
              </p>
              <div className="feature-benefits">
                <span>✓ Réservation 24/7</span>
                <span>✓ 10 templates premium</span>
                <span>✓ SEO optimisé</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon gradient-4">
                <CreditCard size={32} />
              </div>
              <h3>Paiements Sécurisés</h3>
              <p>
                Intégration SATIM native pour accepter toutes les cartes 
                algériennes. Facturation automatisée et suivi en temps réel.
              </p>
              <div className="feature-benefits">
                <span>✓ Cartes CIB/EDAHABIA</span>
                <span>✓ Factures auto</span>
                <span>✓ Export comptable</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon gradient-5">
                <BarChart size={32} />
              </div>
              <h3>Analytics & Insights</h3>
              <p>
                Tableaux de bord en temps réel avec KPIs essentiels, 
                prévisions de croissance et recommandations IA.
              </p>
              <div className="feature-benefits">
                <span>✓ Revenus en direct</span>
                <span>✓ Taux de remplissage</span>
                <span>✓ Prévisions IA</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon gradient-6">
                <Smartphone size={32} />
              </div>
              <h3>Mobile First</h3>
              <p>
                Application responsive parfaite sur tous les écrans. 
                Gérez votre salon depuis n'importe où, à tout moment.
              </p>
              <div className="feature-benefits">
                <span>✓ iOS & Android</span>
                <span>✓ Mode hors ligne</span>
                <span>✓ Notifications push</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Cibles */}
      <section className="targets-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Une solution adaptée à chaque métier de la beauté
            </h2>
            <p className="section-subtitle">
              Que vous soyez coiffeur, barbier, esthéticienne ou spa manager
            </p>
          </div>

          <div className="targets-grid">
            <div className="target-card">
              <div className="target-icon">
                <Scissors size={40} />
              </div>
              <h3>Salons de Coiffure</h3>
              <p>
                Gérez vos colorations, suivez les formules clients, 
                optimisez le temps de vos coiffeurs.
              </p>
              <Link to="/register" className="target-link">
                Découvrir <ChevronRight size={16} />
              </Link>
            </div>

            <div className="target-card">
              <div className="target-icon">
                <Users size={40} />
              </div>
              <h3>Barbershops</h3>
              <p>
                File d'attente virtuelle, fidélisation masculine, 
                gestion des walk-ins optimisée.
              </p>
              <Link to="/register" className="target-link">
                Découvrir <ChevronRight size={16} />
              </Link>
            </div>

            <div className="target-card">
              <div className="target-icon">
                <Heart size={40} />
              </div>
              <h3>Instituts de Beauté</h3>
              <p>
                Protocoles de soins, gestion des cabines, 
                vente de produits intégrée.
              </p>
              <Link to="/register" className="target-link">
                Découvrir <ChevronRight size={16} />
              </Link>
            </div>

            <div className="target-card">
              <div className="target-icon">
                <Sparkles size={40} />
              </div>
              <h3>Spas & Wellness</h3>
              <p>
                Packages et forfaits, gestion multi-praticiens, 
                expérience client premium.
              </p>
              <Link to="/register" className="target-link">
                Découvrir <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section id="pricing" className="pricing-static">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Des tarifs transparents qui s'adaptent à votre croissance
            </h2>
            <p className="section-subtitle">
              Commencez gratuitement, évoluez sans limites
            </p>
          </div>

          <div className="pricing-toggle">
            <span>Mensuel</span>
            <label className="toggle">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
            <span>Annuel <span className="badge-save">-40%</span></span>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Gratuit</h3>
                <div className="pricing-price">
                  <span className="price">0</span>
                  <span className="currency">DZD</span>
                  <span className="period">/mois</span>
                </div>
                <p className="pricing-desc">Pour découvrir Saloneo</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={20} /> 20 rendez-vous/mois</li>
                <li><Check size={20} /> 10 clients maximum</li>
                <li><Check size={20} /> 5 services</li>
                <li><Check size={20} /> Agenda basique</li>
                <li><Check size={20} /> Support par email</li>
              </ul>
              <Link to="/register" className="btn-secondary w-full">
                Commencer gratuitement
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-badge">Plus populaire</div>
              <div className="pricing-header">
                <h3>Starter</h3>
                <div className="pricing-price">
                  <span className="price">1 900</span>
                  <span className="currency">DZD</span>
                  <span className="period">/mois</span>
                </div>
                <p className="pricing-original">3 167 DZD</p>
                <p className="pricing-desc">Pour les salons en croissance</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={20} /> 60 rendez-vous/mois</li>
                <li><Check size={20} /> 200 clients</li>
                <li><Check size={20} /> 20 services</li>
                <li><Check size={20} /> 5 membres d'équipe</li>
                <li><Check size={20} /> Page salon pro</li>
                <li><Check size={20} /> Rappels SMS</li>
                <li><Check size={20} /> Analytics basiques</li>
                <li><Check size={20} /> Support prioritaire</li>
              </ul>
              <Link to="/register" className="btn-primary w-full">
                Essai gratuit 30 jours
              </Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="pricing-price">
                  <span className="price">3 500</span>
                  <span className="currency">DZD</span>
                  <span className="period">/mois</span>
                </div>
                <p className="pricing-original">5 000 DZD</p>
                <p className="pricing-desc">Pour les leaders du marché</p>
              </div>
              <ul className="pricing-features">
                <li><Check size={20} /> Rendez-vous illimités</li>
                <li><Check size={20} /> Clients illimités</li>
                <li><Check size={20} /> Services illimités</li>
                <li><Check size={20} /> Équipe illimitée</li>
                <li><Check size={20} /> Multi-établissements</li>
                <li><Check size={20} /> Paiements SATIM</li>
                <li><Check size={20} /> Analytics avancés</li>
                <li><Check size={20} /> API & Intégrations</li>
                <li><Check size={20} /> Support VIP 24/7</li>
              </ul>
              <Link to="/register" className="btn-secondary w-full">
                Essai gratuit 30 jours
              </Link>
            </div>
          </div>

          <div className="pricing-note">
            <Shield size={20} />
            <span>Garantie satisfait ou remboursé 30 jours • Sans engagement • Annulation à tout moment</span>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section id="testimonials" className="testimonials-static">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Ils ont transformé leur business avec Saloneo
            </h2>
            <p className="section-subtitle">
              Découvrez les success stories de nos clients
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "Saloneo a révolutionné notre salon. +45% de CA en 3 mois, 
                zéro no-show grâce aux rappels SMS, et une équipe enfin organisée. 
                Le meilleur investissement de ma carrière !"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="/api/placeholder/60/60" alt="Amina" />
                </div>
                <div className="author-info">
                  <h4>Amina Benali</h4>
                  <p>Salon Élégance, Alger</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "La réservation en ligne a changé la donne. Mes clients adorent, 
                je reçois des bookings même la nuit ! Mon agenda est plein 
                2 semaines à l'avance maintenant."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="/api/placeholder/60/60" alt="Karim" />
                </div>
                <div className="author-info">
                  <h4>Karim Mezouar</h4>
                  <p>Barber Shop Premium, Oran</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="testimonial-quote">
                "Les analytics m'ont ouvert les yeux. J'ai découvert mes services 
                les plus rentables et optimisé mes prix. Résultat : +30% de marge 
                sans perdre un seul client !"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="/api/placeholder/60/60" alt="Sarah" />
                </div>
                <div className="author-info">
                  <h4>Sarah Khelifi</h4>
                  <p>Beauty Center Luxe, Constantine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA Finale */}
      <section className="cta-final">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Prêt à rejoindre l'élite des salons digitalisés ?
            </h2>
            <p className="cta-subtitle">
              847 salons nous font déjà confiance. Et vous ?
            </p>
            
            <div className="cta-benefits">
              <div className="benefit">
                <Check size={24} />
                <span>30 jours d'essai gratuit</span>
              </div>
              <div className="benefit">
                <Check size={24} />
                <span>Sans carte bancaire</span>
              </div>
              <div className="benefit">
                <Check size={24} />
                <span>Installation en 5 minutes</span>
              </div>
            </div>

            <div className="cta-actions">
              <Link to="/register" className="btn-primary-large">
                Démarrer maintenant
                <ArrowRight size={24} />
              </Link>
              <button onClick={() => setShowVideo(true)} className="btn-video">
                <Play size={24} />
                Voir la démo (2 min)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-static">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <SaloneoLogo className="footer-logo" />
              <p className="footer-desc">
                L'infrastructure digitale qui propulse les salons de beauté vers le succès.
              </p>
              <div className="footer-social">
                <a href="#" aria-label="Facebook">f</a>
                <a href="#" aria-label="Instagram">i</a>
                <a href="#" aria-label="LinkedIn">in</a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Produit</h4>
              <ul>
                <li><Link to="/features">Fonctionnalités</Link></li>
                <li><Link to="/pricing">Tarifs</Link></li>
                <li><Link to="/integrations">Intégrations</Link></li>
                <li><Link to="/updates">Nouveautés</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Entreprise</h4>
              <ul>
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/careers">Carrières</Link></li>
                <li><Link to="/press">Presse</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Centre d'aide</Link></li>
                <li><Link to="/docs">Documentation</Link></li>
                <li><Link to="/api">API</Link></li>
                <li><Link to="/status">Statut</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:contact@saloneo.com">contact@saloneo.com</a></li>
                <li><a href="tel:+213555123456">+213 555 123 456</a></li>
                <li>Alger, Algérie</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Saloneo. Tous droits réservés.</p>
            <div className="footer-legal">
              <Link to="/privacy">Confidentialité</Link>
              <Link to="/terms">Conditions</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Vidéo */}
      {showVideo && (
        <div className="video-modal" onClick={() => setShowVideo(false)}>
          <div className="video-container" onClick={(e) => e.stopPropagation()}>
            <button className="video-close" onClick={() => setShowVideo(false)}>
              ✕
            </button>
            <div className="video-placeholder">
              <Play size={60} />
              <p>Vidéo de démonstration</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageStatic;
