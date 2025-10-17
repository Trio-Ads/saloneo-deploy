import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Globe } from 'lucide-react';
import saloneoLogo from '../assets/saloneo-logo.svg';

const AwwwardsHeader: React.FC = () => {
  const { t, i18n } = useTranslation('marketing');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLElement>(null);
  
  // Framer Motion hooks
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [0, -20]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  
  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x * 3); // Réduit de 20 à 3 pixels
        mouseY.set(y * 3); // Réduit de 20 à 3 pixels
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        className="custom-cursor"
        style={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      />

      <motion.header
        ref={headerRef}
        className={`awwwards-header ${isScrolled ? 'scrolled' : ''}`}
        style={{
          y: headerY,
          opacity: headerOpacity,
        }}
      >
        {/* Animated Background */}
        <div className="header-background">
          <div className="gradient-orb gradient-orb-1" />
          <div className="gradient-orb gradient-orb-2" />
          <div className="gradient-orb gradient-orb-3" />
          <canvas id="particle-canvas" className="particle-canvas" />
        </div>

        {/* Glassmorphism Navigation */}
        <nav className="header-nav">
          <div className="nav-container">
            {/* Logo with Animation */}
            <motion.div
              className="logo-wrapper"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
            >
              <Link to="/" className="logo-link">
                <motion.img 
                  src={saloneoLogo} 
                  alt="Saloneo" 
                  className="logo"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div 
                  className="logo-glow"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </Link>
            </motion.div>

            {/* Navigation Links */}
            <motion.div 
              className="nav-links"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                { key: 'features', href: '#features' },
                { key: 'pricing', href: '#pricing' },
                { key: 'testimonials', href: '#testimonials' },
                { key: 'blog', href: '#blog' }
              ].map((item, index) => (
                <motion.a
                  key={item.key}
                  href={item.href}
                  className="nav-link"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <span className="nav-link-text">{t(`header.nav.${item.key}`)}</span>
                  <motion.div 
                    className="nav-link-underline"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="nav-cta"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Language Selector */}
              <div className="language-selector-wrapper">
                <button
                  onClick={() => {
                    const newLang = i18n.language === 'fr' ? 'en' : i18n.language === 'en' ? 'ar' : 'fr';
                    i18n.changeLanguage(newLang);
                  }}
                  className="nav-btn nav-btn-ghost language-btn"
                  title="Change language"
                >
                  <Globe size={18} />
                  <span className="language-code">{i18n.language.toUpperCase()}</span>
                </button>
              </div>

              <Link to="/login" className="nav-btn nav-btn-ghost">
                <span>{t('header.cta.login')}</span>
                <div className="btn-glow" />
              </Link>
              
              <motion.div
                className="magnetic-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/register" className="nav-btn nav-btn-primary">
                  <span className="btn-text">{t('header.cta.trial')}</span>
                  <div className="btn-gradient" />
                  <div className="btn-shine" />
                  <motion.div 
                    className="btn-particles"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </Link>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="mobile-menu-btn"
              whileTap={{ scale: 0.9 }}
            >
              <span className="menu-line" />
              <span className="menu-line" />
              <span className="menu-line" />
            </motion.button>
          </div>
        </nav>

        {/* Floating Elements */}
        <div className="floating-elements">
          <motion.div
            className="floating-stat"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="stat-number">847+</span>
            <span className="stat-label">{t('header.stats.active_salons')}</span>
          </motion.div>

          <motion.div
            className="floating-badge"
            animate={{
              y: [0, -15, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <span className="badge-icon">🚀</span>
            <span className="badge-text">{t('header.stats.ca_increase')}</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Initialize Particle Animation */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const canvas = document.getElementById('particle-canvas');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = 100;
            
            const particles = [];
            const particleCount = 50;
            
            class Particle {
              constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.2;
              }
              
              update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
              }
              
              draw() {
                ctx.fillStyle = 'rgba(79, 70, 229, ' + this.opacity + ')';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            
            for (let i = 0; i < particleCount; i++) {
              particles.push(new Particle());
            }
            
            function animate() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              particles.forEach(particle => {
                particle.update();
                particle.draw();
              });
              requestAnimationFrame(animate);
            }
            
            animate();
          })();
        `
      }} />
    </>
  );
};

export default AwwwardsHeader;
