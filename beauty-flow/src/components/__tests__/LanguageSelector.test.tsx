import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSelector from '../LanguageSelector';

// Mock pour i18next
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: mockChangeLanguage,
      language: 'fr',
    },
  }),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default language', () => {
    render(<LanguageSelector />);
    
    // Vérifier que le bouton avec le drapeau français est affiché
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('opens language dropdown when clicked', () => {
    render(<LanguageSelector />);
    
    // Cliquer sur le sélecteur de langue
    fireEvent.click(screen.getByText('Français'));
    
    // Vérifier que toutes les langues sont affichées
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Türkçe')).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
  });

  it('changes language when a language is selected', async () => {
    const onLanguageChange = vi.fn();
    render(<LanguageSelector onLanguageChange={onLanguageChange} />);
    
    // Ouvrir le dropdown
    fireEvent.click(screen.getByText('Français'));
    
    // Sélectionner l'anglais
    fireEvent.click(screen.getByText('English'));
    
    // Vérifier que la fonction changeLanguage a été appelée avec 'en'
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    
    // Attendre que la promesse soit résolue
    await waitFor(() => {
      expect(onLanguageChange).toHaveBeenCalledWith('en');
    });
  });

  it('uses currentLanguage prop when provided', () => {
    render(<LanguageSelector currentLanguage="en" />);
    
    // Vérifier que le bouton avec le drapeau anglais est affiché
    expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });
});
