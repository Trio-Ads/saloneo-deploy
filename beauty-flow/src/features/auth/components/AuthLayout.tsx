import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../../hooks/useThemeColors';
import AuthLanguageSelector from '../../../components/AuthLanguageSelector';
import { SaloneoLogo } from '../../../components/SaloneoLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const { t, i18n } = useTranslation('auth');
  const { currentTheme } = useThemeColors();
  const [, forceUpdate] = useState({});

  // Force le re-render quand la langue change
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Appliquer le thème au body pour l'arrière-plan
  useEffect(() => {
    document.body.className = 'auth-background';
    return () => {
      document.body.className = '';
    };
  }, []);

  return (
    <div className="auth-layout-2025">
      {/* Arrière-plan avec dégradé animé */}
      <div className="auth-background-gradient" />
      
      {/* Particules flottantes */}
      <div className="auth-particles">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`auth-particle auth-particle-${i + 1}`}
            style={{
              animationDelay: `${i * 0.5}s`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="auth-container">
        <div className="auth-content">
          {/* Logo et branding Saloneo */}
          <div className="auth-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <SaloneoLogo iconOnly size="lg" />
              </div>
              <div className="auth-logo-text">
                <h1 className="text-2xl font-display font-bold text-white">
                  Saloneo
                </h1>
                <p className="text-sm text-white/70 font-body">
                  Gestion de salon moderne
                </p>
              </div>
            </div>
          </div>

          {/* Carte principale avec glassmorphism */}
          <div className="auth-card">
            {/* Sélecteur de langue */}
            <div className="auth-language-selector" onMouseDown={(e) => e.stopPropagation()}>
              <AuthLanguageSelector />
            </div>

            <div className="auth-card-inner">
              {/* Titre */}
              <div className="auth-title-section">
                <h2 className="auth-title">
                  {t(title)}
                </h2>
                <div className="auth-title-underline" />
              </div>

              {/* Contenu du formulaire */}
              <div className="auth-form-content">
                {children}
              </div>
            </div>

            {/* Effets visuels */}
            <div className="auth-card-glow" />
            <div className="auth-card-border" />
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="text-white/60 text-sm font-body text-center">
              © 2025 Saloneo. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>

      {/* Styles CSS intégrés pour l'authentification */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .auth-layout-2025 {
            min-height: 100vh;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .auth-background-gradient {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              135deg,
              #F97316 0%,
              #EA580C 25%,
              #FB923C 50%,
              #FDBA74 75%,
              #F97316 100%
            );
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            z-index: -2;
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .auth-particles {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: -1;
          }

          .auth-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, rgba(249, 115, 22, 0.4), rgba(251, 146, 60, 0.3));
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
            box-shadow: 0 0 8px rgba(249, 115, 22, 0.3);
          }

          .auth-particle-1 { animation-duration: 6s; }
          .auth-particle-2 { animation-duration: 8s; }
          .auth-particle-3 { animation-duration: 7s; }
          .auth-particle-4 { animation-duration: 9s; }
          .auth-particle-5 { animation-duration: 5s; }
          .auth-particle-6 { animation-duration: 10s; }

          .auth-container {
            width: 100%;
            max-width: 480px;
            padding: 2rem;
            z-index: 1;
          }

          .auth-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            animation: fadeIn 0.8s ease-out;
          }

          .auth-header {
            text-align: center;
          }

          .auth-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .auth-logo-icon {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.1));
            border-radius: 1.5rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(249, 115, 22, 0.3);
            animation: glow 2s ease-in-out infinite alternate;
          }

          .auth-logo-text {
            text-align: center;
          }

          .auth-card {
            position: relative;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-radius: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            animation: slideUp 0.6s ease-out 0.2s both;
          }

          .auth-card-inner {
            padding: 3rem 2.5rem;
            position: relative;
            z-index: 2;
          }

          .auth-title-section {
            text-align: center;
            margin-bottom: 2.5rem;
          }

          .auth-title {
            font-size: 2rem;
            font-weight: 700;
            color: white;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #e0e7ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .auth-title-underline {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #F97316, #FB923C, #FDBA74);
            margin: 0 auto;
            border-radius: 2px;
            animation: expandWidth 0.8s ease-out 0.4s both;
          }

          .auth-form-content {
            position: relative;
          }

          .auth-card-glow {
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #F97316, #FB923C, #FDBA74, #EA580C);
            border-radius: 2rem;
            opacity: 0.3;
            filter: blur(8px);
            z-index: -1;
            animation: pulse 3s ease-in-out infinite;
          }

          .auth-card-border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 2rem;
            padding: 1px;
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(251, 146, 60, 0.2), rgba(255,255,255,0.1));
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            z-index: 1;
          }

          .auth-language-selector {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 99999;
            animation: fadeIn 0.8s ease-out 0.4s both;
          }

          
          /* Styles améliorés pour le sélecteur de langue */
          .auth-language-selector {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 99999 !important;
            animation: fadeIn 0.8s ease-out 0.4s both;
            pointer-events: auto !important;
          }

          .auth-language-selector * {
            pointer-events: auto !important;
          }

          .auth-language-selector button {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            transition: all 0.3s ease !important;
            pointer-events: auto !important;
            position: relative !important;
            z-index: 99999 !important;
          }

          .auth-language-selector button:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          /* Dropdown avec z-index très élevé */
          .auth-language-selector [style*="position: fixed"] {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
            z-index: 999999 !important;
            pointer-events: auto !important;
          }

          .auth-language-selector [style*="position: fixed"] button {
            color: #374151 !important;
            background: transparent !important;
            border: none !important;
            pointer-events: auto !important;
          }

          .auth-language-selector [style*="position: fixed"] button:hover {
            background: rgba(249, 115, 22, 0.1) !important;
          }

          .auth-footer {
            text-align: center;
            animation: fadeIn 0.8s ease-out 0.6s both;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes expandWidth {
            from { width: 0; }
            to { width: 60px; }
          }

          @keyframes glow {
            from { box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }
            to { box-shadow: 0 0 30px rgba(249, 115, 22, 0.6), 0 0 40px rgba(251, 146, 60, 0.4); }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }

          /* Responsive */
          @media (max-width: 640px) {
            .auth-container {
              padding: 1rem;
            }
            
            .auth-card-inner {
              padding: 2rem 1.5rem;
            }
            
            .auth-title {
              font-size: 1.75rem;
            }

            .auth-language-selector {
              top: 1rem;
              right: 1rem;
            }

            .auth-language-selector button {
              padding: 6px 10px !important;
              font-size: 12px !important;
            }
          }
        `
      }} />
    </div>
  );
};
