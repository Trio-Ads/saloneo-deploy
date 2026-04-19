import React, { useState, useEffect } from 'react';
import { DesignTemplate } from '../../templates/types';

export function BookingConfirmation({ template, bookingInfo, onClose }: {
  template: DesignTemplate;
  bookingInfo: { date: string; time: string; serviceName: string; stylistName?: string; price?: number; modificationLink: string };
  onClose: () => void;
}) {
  const { colors, typography } = template.theme;
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  // Trigger entry animation on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingInfo.modificationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  return (
    <div
      style={{
        background: colors.background,
        fontFamily: typography.bodyFont,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
      className="pb-6"
    >
      {/* Success icon */}
      <div className="flex justify-center pt-7 pb-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg"
          style={{
            background: colors.primary,
            boxShadow: `0 6px 24px ${colors.primary}55`,
          }}
        >
          ✓
        </div>
      </div>

      {/* Title */}
      <div className="text-center px-5 mb-5">
        <h2
          className="text-lg font-extrabold tracking-tight"
          style={{ color: colors.text, fontFamily: typography.headingFont }}
        >
          Réservation confirmée !
        </h2>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Un email de confirmation vous a été envoyé
        </p>
      </div>

      {/* RDV card */}
      <div
        className="mx-4 rounded-xl overflow-hidden"
        style={{ border: `1px solid ${colors.surface}` }}
      >
        {/* Primary-colored header band */}
        <div
          className="px-4 py-3"
          style={{ background: colors.primary }}
        >
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-0.5">
            Votre rendez-vous
          </p>
          <p className="text-white text-2xl font-extrabold leading-none" style={{ fontFamily: typography.headingFont }}>
            {bookingInfo.time}
          </p>
          <p className="text-white/75 text-sm mt-1 capitalize">{bookingInfo.date}</p>
        </div>

        {/* Details rows */}
        <div
          className="px-4 py-3 flex flex-col gap-2.5"
          style={{ background: colors.background }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: colors.textSecondary }}>Service</span>
            <span className="text-xs font-bold" style={{ color: colors.text }}>{bookingInfo.serviceName}</span>
          </div>
          {bookingInfo.stylistName && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: colors.textSecondary }}>Avec</span>
              <span className="text-xs font-bold" style={{ color: colors.text }}>{bookingInfo.stylistName}</span>
            </div>
          )}
          {bookingInfo.price != null && bookingInfo.price > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: colors.textSecondary }}>Total</span>
              <span className="text-xs font-bold" style={{ color: colors.primary }}>{bookingInfo.price} €</span>
            </div>
          )}
        </div>
      </div>

      {/* Modification link */}
      <div
        className="mx-4 mt-3 p-3 rounded-xl"
        style={{ background: colors.surface }}
      >
        <p className="text-xs font-bold mb-2" style={{ color: colors.text }}>
          🔗 Lien de modification
        </p>
        <div
          className="flex items-center gap-2 p-2 rounded-lg"
          style={{ background: colors.background }}
        >
          <span
            className="text-xs font-mono truncate flex-1"
            style={{ color: colors.primary }}
          >
            {bookingInfo.modificationLink.length > 38
              ? `${bookingInfo.modificationLink.slice(0, 35)}…`
              : bookingInfo.modificationLink}
          </span>
          <button
            onClick={copyLink}
            className="flex-shrink-0 text-base leading-none transition-transform duration-150 active:scale-90"
            style={{ color: colors.primary }}
            title="Copier le lien"
          >
            {copied ? '✓' : '⎘'}
          </button>
        </div>
        <p className="text-[10px] mt-1.5 flex gap-1" style={{ color: '#f59e0b' }}>
          <span>⚠</span> Conservez ce lien pour modifier ou annuler votre rendez-vous
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="mx-4 mt-4 w-[calc(100%-2rem)] py-3 font-bold text-sm rounded-xl transition-opacity hover:opacity-90 active:opacity-75"
        style={{
          background: colors.text,
          color: colors.background,
        }}
      >
        Parfait ! Fermer
      </button>
    </div>
  );
}

export default BookingConfirmation;
