import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Shield, 
  Star, 
  Check,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Zap,
  Award,
  Heart
} from 'lucide-react';
import '../styles/landing-pro.css';

interface MarketingImage {
  url: string;
  width: number;
  height: number;
}

interface MarketingImages {
  hero?: MarketingImage;
  dashboard?: MarketingImage;
  team?: MarketingImage;
  client?: MarketingImage;
  barbershop?: MarketingImage;
  spa?: MarketingImage;
}

interface Logo {
  horizontal?: MarketingImage;
  square?: MarketingImage;
}

interface Avatar {
  url: string;
  index: number;
}

const LandingPagePro: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 10]);

  // URLs directes des images générées
  const images = {
    hero: "http://localhost:5000/uploads/marketing/hero-1751408880546.webp",
    dashboard: "http://localhost:5000/uploads/marketing/dashboard-1751409075989.webp",
    team: "http://localhost:5000/uploads/marketing/team-1751409090919.webp",
    client: "http://localhost:5000/uploads/marketing/client-1751409104669.webp",
    barbershop: "http://localhost:5000/uploads/marketing/barbershop-1751409118278.webp",
    spa: "http://localhost:5000/uploads/marketing/spa-1751409131711.webp"
  };

  const logo = {
    horizontal: "http://localhost:5000/uploads/logos/saloneo-logo-horizontal-1751408905849-transparent.png",
    square: "http://localhost:5000/uploads/logos/saloneo-logo-square-1751408920542-transparent.png"
  };

  const avatars = [
    { url: "http://localhost:5000/uploads/avatars/avatar-1-1751408935763.webp", index: 1 },
    { url: "http://localhost:5000/uploads/avatars/avatar-2-1751408949173.webp", index: 2 },
    { url: "http://localhost:5000/uploads/avatars/avatar-3-1751408963175.webp", index: 3 }
  ];

  const features = [
    {
      icon: Calendar,
      title: "Agenda Intelligent",
      description: "Gestion automatisée des rendez-vous avec rappels SMS et synchronisation multi-appareils"
    },
    {
      icon: Users,
      title: "CRM Clients Avancé",
      description: "Base clients enrichie avec historique complet, préférences et segmentation automatique"
    },
    {
      icon: TrendingUp,
      title: "Analytics Temps Réel",
      description: "Tableaux de bord détaillés pour suivre vos performances et optimiser votre activité"
    },
    {
      icon: Shield,
      title: "Paiements Sécurisés",
      description: "Intégration SATIM pour des transactions 100% sécurisées et conformes"
    },
    {
      icon: Zap,
      title: "Marketing Automatisé",
      description: "Campagnes SMS et email automatiques pour fidéliser et attirer de nouveaux clients"
    },
    {
      icon: Award,
      title: "Multi-établissements",
      description: "Gérez plusieurs salons depuis une seule interface centralisée"
    }
  ];

  const testimonials = [
    {
      name: "Amina Benali",
      role: "Salon Élégance, Alger",
      content: "Saloneo a révolutionné notre salon. +45% de CA en 3 mois, zéro no-show grâce aux rappels SMS, et une équipe enfin organisée. Le meilleur investissement de ma carrière !",
      rating: 5,
      avatar: avatars[0]?.url
    },
    {
      name: "Karim Mezouar",
      role: "Barber Shop Premium, Oran",
      content: "La réservation en ligne a changé la donne. Mes clients adorent, je reçois des bookings même la nuit ! Mon agenda est plein 2 semaines à l'avance maintenant.",
      rating: 5,
      avatar: avatars[1]?.url
    },
    {
      name: "Sarah Khelifi",
      role: "Beauty Center Luxe, Constantine",
      content: "Les analytics m'ont ouvert les yeux. J'ai découvert mes services les plus rentables et optimisé mes prix. Résultat : +30% de marge sans perdre un seul client !",
      rating: 5,
      avatar: avatars[2]?.url
    }
  ];

  const plans = [
    {
      name: "Gratuit",
      price: "0",
      period: "/mois",
      description: "Pour découvrir Saloneo",
      features: [
        "20 rendez-vous/mois",
        "10 clients maximum",
        "1 membre d'équipe",
        "Rappels SMS basiques",
        "Support par email"
      ],
      cta: "Commencer gratuitement",
      popular: false
    },
    {
      name: "Starter",
      price: "1 900",
      originalPrice: "3 167",
      period: "/mois",
      description: "Pour les salons en croissance",
      features: [
        "60 rendez-vous/mois",
        "Clients illimités",
        "3 membres d'équipe",
        "SMS illimités",
        "Page de réservation pro",
        "Analytics de base",
        "Support prioritaire"
      ],
      cta: "Essai gratuit 30 jours",
      popular: true
    },
    {
      name: "Pro",
      price: "3 500",
      originalPrice: "5 000",
      period: "/mois",
      description: "Pour les leaders du marché",
      features: [
        "Rendez-vous illimités",
        "Équipe illimitée",
        "Multi-établissements",
        "Marketing automation",
        "API & Intégrations",
        "Formation personnalisée",
        "Account manager dédié"
      ],
      cta: "Demander une démo",
      popular: false
    }
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        />
        <p>Chargement de l'expérience Saloneo...</p>
      </div>
    );
  }

  return (
    <div className="landing-pro">
      {/* Header */}
      <motion.header 
        className="header-pro"
        style={{
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`
        }}
      >
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo-link">
              <img src={logo.horizontal} alt="Saloneo" className="logo" />
            </Link>

            <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
              <a href="#features">Fonctionnalités</a>
              <a href="#testimonials">Témoignages</a>
              <a href="#pricing">Tarifs</a>
              <a href="#contact">Contact</a>
              <Link to="/login" className="nav-cta">Se connecter</Link>
            </nav>

            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="hero-pro">
        <div className="container">
          <div className="hero-grid">
            <motion.div 
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="badge-pro">
                <Star className="badge-icon" />
                La solution n°1 en Algérie
              </div>

              <h1 className="hero-title">
                Transformez votre salon en 
                <span className="gradient-text"> entreprise digitale prospère</span>
              </h1>

              <p className="hero-description">
                Saloneo équipe les meilleurs salons, barbershops et spas d'Algérie 
                avec une plateforme tout-en-un qui automatise la gestion, 
                booste les revenus et fidélise la clientèle.
              </p>

              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-value">847+</div>
                  <div className="stat-label">Salons actifs</div>
                </div>
                <div className="stat">
                  <div className="stat-value">+47%</div>
                  <div className="stat-label">Augmentation CA</div>
                </div>
                <div className="stat">
                  <div className="stat-value">15h</div>
                  <div className="stat-label">Économisées/semaine</div>
                </div>
              </div>

              <div className="hero-cta">
                <Link to="/register" className="btn-primary-pro">
                  Démarrer gratuitement
                  <ArrowRight className="btn-icon" />
                </Link>
                <Link to="/demo" className="btn-secondary-pro">
                  <Phone className="btn-icon" />
                  Demander une démo
                </Link>
              </div>

              <div className="hero-trust">
                <Check className="trust-icon" />
                <span>30 jours gratuits • Sans carte bancaire • Installation en 5 min</span>
              </div>
            </motion.div>

            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <img 
                src={images.hero} 
                alt="Salon moderne avec Saloneo" 
                className="hero-image"
              />
              
              <motion.div 
                className="dashboard-preview"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <img 
                  src={images.dashboard} 
                  alt="Dashboard Saloneo" 
                  className="dashboard-image"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="problem-solution">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Libérez-vous des contraintes qui freinent votre croissance</h2>
            <p>Saloneo transforme chaque défi en opportunité de développement</p>
          </motion.div>

          <div className="transformation-grid">
            <motion.div 
              className="before-card"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3>Sans Saloneo</h3>
              <ul className="problems-list">
                <li><X className="icon-x" /> Agenda papier chaotique et erreurs fréquentes</li>
                <li><X className="icon-x" /> Clients perdus faute de rappels</li>
                <li><X className="icon-x" /> Pas de présence en ligne professionnelle</li>
                <li><X className="icon-x" /> Gestion financière approximative</li>
                <li><X className="icon-x" /> Équipe désorganisée et stressée</li>
              </ul>
            </motion.div>

            <motion.div 
              className="after-card"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3>Avec Saloneo</h3>
              <ul className="solutions-list">
                <li><Check className="icon-check" /> Agenda digital synchronisé en temps réel</li>
                <li><Check className="icon-check" /> Rappels SMS automatiques (0% no-show)</li>
                <li><Check className="icon-check" /> Page salon pro avec réservation 24/7</li>
                <li><Check className="icon-check" /> Analytics et rapports financiers détaillés</li>
                <li><Check className="icon-check" /> Équipe coordonnée et productive</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-pro">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Tout ce dont vous avez besoin pour dominer votre marché</h2>
            <p>Une plateforme complète conçue par des experts du secteur beauté</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card-pro"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="feature-icon-pro">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="target-audience">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Une solution adaptée à chaque métier de la beauté</h2>
            <p>Que vous soyez coiffeur, barbier, esthéticienne ou spa manager</p>
          </motion.div>

          <div className="audience-grid">
            <motion.div 
              className="audience-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="audience-image">
                <img src={images.client} alt="Salon de coiffure" />
              </div>
              <h3>Salons de Coiffure</h3>
              <p>Gérez vos colorations, suivez les formules clients, optimisez le temps de vos coiffeurs.</p>
              <Link to="/register" className="audience-cta">Découvrir</Link>
            </motion.div>

            <motion.div 
              className="audience-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="audience-image">
                <img src={images.barbershop} alt="Barbershop" />
              </div>
              <h3>Barbershops</h3>
              <p>File d'attente virtuelle, fidélisation masculine, gestion des walk-ins optimisée.</p>
              <Link to="/register" className="audience-cta">Découvrir</Link>
            </motion.div>

            <motion.div 
              className="audience-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="audience-image">
                <img src={images.spa} alt="Spa et wellness" />
              </div>
              <h3>Spas & Wellness</h3>
              <p>Packages et forfaits, gestion multi-praticiens, expérience client premium.</p>
              <Link to="/register" className="audience-cta">Découvrir</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-pro">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ils ont transformé leur business avec Saloneo</h2>
            <p>Découvrez les success stories de nos clients</p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="testimonial-card-pro"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="star-filled" />
                  ))}
                </div>
                
                <p className="testimonial-content">"{testimonial.content}"</p>
                
                <div className="testimonial-author">
                  {testimonial.avatar && (
                    <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                  )}
                  <div>
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-pro">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Des tarifs transparents qui s'adaptent à votre croissance</h2>
            <p>Commencez gratuitement, évoluez sans limites</p>
            <div className="pricing-badge">
              <Heart className="badge-icon" />
              Mensuel • Annuel -40%
            </div>
          </motion.div>

          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`pricing-card-pro ${plan.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {plan.popular && <div className="popular-badge">Plus populaire</div>}
                
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-price">
                    <span className="price-value">{plan.price}</span>
                    <span className="price-currency">DZD</span>
                    <span className="price-period">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="price-original">{plan.originalPrice} DZD</div>
                  )}
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <Check className="feature-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/register" 
                  className={`plan-cta ${plan.popular ? 'cta-primary' : 'cta-secondary'}`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="pricing-footer">
            <p>✓ Garantie satisfait ou remboursé 30 jours • ✓ Sans engagement • ✓ Annulation à tout moment</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-pro">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Prêt à rejoindre l'élite des salons digitalisés ?</h2>
            <p>847 salons nous font déjà confiance. Et vous ?</p>
            
            <div className="cta-benefits">
              <div className="benefit">
                <Check className="benefit-icon" />
                30 jours d'essai gratuit
              </div>
              <div className="benefit">
                <Check className="benefit-icon" />
                Sans carte bancaire
              </div>
              <div className="benefit">
                <Check className="benefit-icon" />
                Installation en 5 minutes
              </div>
            </div>

            <div className="cta-buttons">
              <Link to="/register" className="btn-cta-primary">
                Démarrer maintenant
                <ArrowRight className="btn-icon" />
              </Link>
              <a href="tel:+213555123456" className="btn-cta-secondary">
                <Phone className="btn-icon" />
                Voir la démo (2 min)
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-pro">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={logo.horizontal} alt="Saloneo" className="footer-logo" />
              <p>L'infrastructure digitale qui propulse les salons de beauté vers le succès.</p>
              
              <div className="footer-social">
                <a href="#" aria-label="Facebook">f</a>
                <a href="#" aria-label="Instagram">i</a>
                <a href="#" aria-label="LinkedIn">in</a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Produit</h4>
              <ul>
                <li><Link to="/features">Fonctionnalités</Link></li>
                <li><Link to="/pricing">Tarifs</Link></li>
                <li><Link to="/integrations">Intégrations</Link></li>
                <li><Link to="/updates">Nouveautés</Link></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Entreprise</h4>
              <ul>
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/careers">Carrières</Link></li>
                <li><Link to="/press">Presse</Link></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Centre d'aide</Link></li>
                <li><Link to="/docs">Documentation</Link></li>
                <li><Link to="/api">API</Link></li>
                <li><Link to="/status">Statut</Link></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4>Contact</h4>
              <ul>
                <li>
                  <Mail className="contact-icon" />
                  <a href="mailto:contact@saloneo.com">contact@saloneo.com</a>
                </li>
                <li>
                  <Phone className="contact-icon" />
                  <a href="tel:+213555123456">+213 555 123 456</a>
                </li>
                <li>
                  <MapPin className="contact-icon" />
                  <span>Alger, Algérie</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 Saloneo. Tous droits réservés.</p>
            <div className="footer-legal">
              <Link to="/privacy">Confidentialité</Link>
              <Link to="/terms">Conditions</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPagePro;
