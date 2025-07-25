import React, { useState } from 'react';

import { useProfileStore } from '../../profile/store';
import { useInterfaceStore } from '../store';
import { Profile } from '../../profile/types';
import { generateSalonSlug } from '../../../utils/slugify';

const ShareableLink: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const profile = useProfileStore((state: { profile: Profile }) => state.profile);
  const settings = useInterfaceStore((state) => state.settings);
  
  // URL publique du salon basée sur le nom d'établissement
  const salonSlug = generateSalonSlug(profile.establishmentName || 'salon');
  const publicUrl = `${window.location.origin}/salon/${salonSlug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent('Découvrez mon salon de beauté !')}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(publicUrl)}`,
  };

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold gradient-text">Partagez votre page</h2>
      
      {/* URL et bouton de copie */}
      <div className="glass-card p-4 hover:bg-white/5 transition-all duration-300">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={publicUrl}
            readOnly
            className="glass-input flex-1 px-4 py-3 text-gray-800"
          />
          <button
            onClick={handleCopy}
            className="glass-button px-4 py-3 text-white font-medium
                     bg-gradient-to-r from-indigo-600 to-purple-600
                     hover:from-indigo-700 hover:to-purple-700
                     transform transition-all duration-300 hover:scale-[1.02]
                     shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-2">
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copier</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Boutons de partage */}
      <div className="glass-card p-4 space-y-4">
        <span className="text-sm font-medium text-gray-800">Partager sur :</span>
        
        <div className="flex items-center justify-center space-x-6">
          {/* Facebook */}
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button p-3 text-white hover:text-blue-400 hover:scale-110 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
            </svg>
          </a>

          {/* Twitter */}
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button p-3 text-white hover:text-blue-400 hover:scale-110 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a
            href={shareLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button p-3 text-white hover:text-pink-400 hover:scale-110 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Message d'aide */}
      <p className="text-sm text-gray-600 mt-4 glass-card p-4">
        Partagez ce lien avec vos clients pour qu'ils puissent découvrir vos services et prendre rendez-vous en ligne.
      </p>
    </div>
  );
};

export default ShareableLink;
