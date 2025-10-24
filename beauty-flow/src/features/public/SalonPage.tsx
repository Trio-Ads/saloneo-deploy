import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTemplateById } from '../templates';
import { useInterfaceStore } from '../interface/store';
import { useServiceStore } from '../services/store';
import { useTeamStore } from '../team/store';
import ServiceGallery from './components/ServiceGallery';
import PublicBookingFlow from './components/PublicBookingFlow';
import AppointmentSearchForm from './components/AppointmentSearchForm';
import { SaloneoLogo } from '../../components/SaloneoLogo';
import api from '../../services/api';

interface SalonData {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  currency?: string;
  hours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    currency?: string;
    images?: Array<{ url: string; alt: string; isPrimary?: boolean }>;
    image?: string;
  }>;
  team: Array<{
    id: string;
    name: string;
    role: string;
    image?: string;
  }>;
  selectedTemplate?: string;
}

export const SalonPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('public');
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  const settings = useInterfaceStore((state) => state.settings);
  const serviceSettings = useInterfaceStore((state) => state.serviceSettings);

  // Fonction pour charger les données du salon
  const loadSalonData = React.useCallback(async () => {
    try {
      // Récupérer les données du salon depuis le backend via les nouvelles routes par slug
      const [profileResponse, servicesResponse, teamResponse] = await Promise.all([
        api.get('/public/salon/' + slug),
        api.get('/public/services/' + slug),
        api.get('/public/team/' + slug)
      ]);

        const profile = profileResponse.data;
        const services = servicesResponse.data;
        const team = teamResponse.data;

        if (!profile) {
          setSalon(null);
          return;
        }

        // Construire les données du salon à partir des réponses API
        const salonData: SalonData = {
          id: profile.id || profile._id,
          name: profile.establishmentName || profile.firstName + ' ' + profile.lastName,
          description: profile.presentation || settings.presentation || 'Bienvenue dans notre salon de beauté',
          address: profile.address || '',
          phone: profile.phone || '',
          email: profile.email || '',
          currency: profile.settings?.currency || 'EUR',
          hours: profile.businessHours || {
            monday: { open: '09:00', close: '19:00' },
            tuesday: { open: '09:00', close: '19:00' },
            wednesday: { open: '09:00', close: '19:00' },
            thursday: { open: '09:00', close: '19:00' },
            friday: { open: '09:00', close: '19:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { closed: true, open: '', close: '' }
          },
          services: services?.map((service: any) => ({
            id: service._id || service.id, // Utiliser _id en priorité (MongoDB ID)
            name: service.name,
            description: service.description || '',
            price: service.price || 0,
            duration: service.duration || 60,
            currency: profile.settings?.currency || 'EUR', // Toujours utiliser la monnaie du profil
            images: service.images || [],
            image: service.images?.[0]?.url || service.image
          })) || [],
          team: team?.map((member: any) => ({
            id: member._id || member.id, // Utiliser _id en priorité (MongoDB ID)
            name: member.name,
            role: member.role || 'Membre de l\'équipe',
            image: member.image || member.avatar
          })) || [],
          selectedTemplate: profile.theme?.selectedTemplateId || 'saloneo-classic'
        };

        setSalon(salonData);
        setProfileData(profile);

        // Debug logs (can be removed in production)
        // console.log('🔍 Profile data from API:', profile);
        // console.log('🔍 ServiceDisplay from profile:', profile.serviceDisplay);
        // console.log('🔍 PriceDisplay setting:', profile.serviceDisplay?.priceDisplay);

        // Peupler les stores avec les données publiques pour que le modal fonctionne
        const serviceStore = useServiceStore.getState();
        const teamStore = useTeamStore.getState();

        // Convertir les données publiques au format des stores
        // IMPORTANT: Utiliser les vrais MongoDB IDs (_id) pour que le backend puisse les retrouver
        const formattedServices = services?.map((service: any) => ({
          id: service._id || service.id, // Utiliser _id en priorité
          name: service.name,
          description: service.description || '',
          category: service.category || 'Général',
          duration: service.duration || 60,
          price: service.price || 0,
          isActive: service.isActive !== false,
          products: service.products || [],
          image: service.images?.[0] || service.image,
          bufferTimeBefore: service.bufferTimeBefore || 0,
          bufferTimeAfter: service.bufferTimeAfter || 0,
          maxAdvanceBooking: service.maxAdvanceBooking || 30,
          minAdvanceBooking: service.minAdvanceBooking || 0,
          isOnlineBookingEnabled: service.isOnlineBookingEnabled !== false
        })) || [];

        const formattedTeam = team?.map((member: any) => ({
          id: member._id || member.id, // Utiliser _id en priorité
          firstName: member.firstName || member.name?.split(' ')[0] || member.name || '',
          lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
          email: member.email || '',
          phone: member.phone || '',
          role: member.role || 'Coiffeur(se)',
          specialties: member.specialties || [],
          workingHours: member.workingHours || {
            monday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            wednesday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            thursday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            saturday: { isWorking: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            sunday: { isWorking: false }
          },
          isActive: member.isActive !== false,
          avatar: member.avatar || member.image,
          color: member.color || '#3B82F6'
        })) || [];

        // Mettre à jour les stores directement
        serviceStore.services = formattedServices;
        teamStore.members = formattedTeam;

        console.log('🔄 Stores peuplés avec les données publiques:', {
          services: formattedServices.length,
          team: formattedTeam.length
        });

    } catch (error) {
      console.error('Erreur lors du chargement du salon:', error);
      // En cas d'erreur, utiliser les données par défaut
      setSalon(null);
    } finally {
      setLoading(false);
    }
  }, [slug, settings]);

  // Charger les données au montage et quand le slug change
  useEffect(() => {
    if (slug) {
      loadSalonData();
    }
  }, [slug, loadSalonData]);

  // Recharger les données toutes les 30 secondes pour synchroniser les changements (monnaie, etc.)
  useEffect(() => {
    if (!slug) return;
    
    const intervalId = setInterval(() => {
      loadSalonData();
    }, 30000); // 30 secondes

    return () => clearInterval(intervalId);
  }, [slug, loadSalonData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Salon non trouvé</h1>
          <p className="text-gray-600">Le salon que vous recherchez n'existe pas.</p>
        </div>
      </div>
    );
  }

  const template = getTemplateById(salon.selectedTemplate || 'saloneo-classic');
  
  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Template non trouvé</h1>
          <p className="text-gray-600">Le template sélectionné n'est pas disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${template.id} min-h-screen`} style={{ 
      backgroundColor: template.theme.colors.background,
      color: template.theme.colors.text,
      fontFamily: template.theme.typography.bodyFont
    }}>
      {/* Injection du CSS personnalisé du template */}
      <style dangerouslySetInnerHTML={{ __html: template.customCSS || '' }} />
      
      {/* Navigation moderne */}
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="nav-logo flex items-center space-x-3">
              {profileData?.logo ? (
                <img 
                  src={profileData.logo} 
                  alt="Logo du salon"
                  className="h-12 w-auto object-contain"
                  style={{ maxHeight: '48px' }}
                />
              ) : (
                <span>{salon.name}</span>
              )}
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#services" className="nav-link">Services</a>
              {profileData?.showTeamOnPublicPage !== false && (
                <a href="#team" className="nav-link">Équipe</a>
              )}
              <a href="#contact" className="nav-link">Contact</a>
            </div>
            <button className="btn-primary">
              Réserver
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section moderne */}
      <section className="hero-section" style={{
        backgroundImage: profileData?.banner ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${profileData.banner})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="hero-content text-center">
            <h1 className="hero-title fade-in-up" style={{
              color: profileData?.banner ? '#ffffff' : undefined,
              textShadow: profileData?.banner ? '2px 2px 4px rgba(0,0,0,0.5)' : undefined
            }}>
              {salon.name}
            </h1>
            <p className="hero-subtitle fade-in-up stagger-1" style={{
              color: profileData?.banner ? '#f3f4f6' : undefined,
              textShadow: profileData?.banner ? '1px 1px 2px rgba(0,0,0,0.5)' : undefined
            }}>
              {salon.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up stagger-2">
              <button 
                className="btn-primary"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Découvrir nos services
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowSearchModal(true)}
              >
                Gérer mes réservations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section moderne */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ 
              fontFamily: template.theme.typography.headingFont,
              color: template.theme.colors.text 
            }}>
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre gamme complète de services beauté et bien-être, 
              conçus pour révéler votre beauté naturelle
            </p>
          </div>

          {/* Services Grid moderne */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {salon.services.map((service, index) => {
              // Utiliser les images directement depuis l'API
              const serviceImages = service.images || [];
              const primaryImage = serviceImages[0];
              
              // Fonction pour obtenir le symbole de la monnaie
              const getCurrencySymbol = (currency: string) => {
                const symbols: { [key: string]: string } = {
                  'EUR': '€',
                  'USD': '$',
                  'GBP': '£',
                  'DZD': 'DA',
                  'MAD': 'MAD',
                  'TND': 'TND',
                  'AED': 'AED'
                };
                return symbols[currency] || currency;
              };

              // Toujours utiliser la monnaie du salon (pas celle du service individuel)
              const currencySymbol = getCurrencySymbol(salon.currency || 'EUR');

              return (
                <div 
                  key={service.id} 
                  className={`service-card fade-in-up stagger-${(index % 4) + 1}`}
                >
                  {/* Image du service */}
                  {primaryImage && (
                    <div className="service-image-container mb-4 overflow-hidden rounded-xl relative">
                      <img 
                        src={primaryImage.url} 
                        alt={primaryImage.alt || service.name}
                        className="service-image w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                        loading="lazy"
                      />
                      {serviceImages.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                          +{serviceImages.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="service-title">
                    {service.name}
                  </div>
                  <p className="service-description">
                    {service.description || 'Service professionnel de qualité'}
                  </p>
                  <div className="flex justify-between items-center mb-6">
                    {profileData?.serviceDisplay?.priceDisplay !== 'hidden' && (
                      <div className="service-price">
                        {(() => {
                          const priceDisplay = profileData?.serviceDisplay?.priceDisplay || 'fixed';
                          const price = service.price;
                          const currency = currencySymbol;
                          
                          switch (priceDisplay) {
                            case 'fixed':
                              return `${price}${currency}`;
                            case 'from':
                              return `Environ ${price}${currency}`;
                            case 'range':
                              // Pour la fourchette, on peut utiliser +20% du prix de base
                              const maxPrice = Math.round(price * 1.2);
                              return `Environ ${price}${currency} - ${maxPrice}${currency}`;
                            default:
                              return `${price}${currency}`;
                          }
                        })()}
                      </div>
                    )}
                    <div className="service-duration">
                      {service.duration} min
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(service.id)}
                    className="btn-primary w-full"
                  >
                    Réserver maintenant
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section moderne - Affichage conditionnel */}
      {profileData?.showTeamOnPublicPage !== false && (
        <section id="team" className="py-20 px-4" style={{ backgroundColor: template.theme.colors.accent }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ 
                fontFamily: template.theme.typography.headingFont,
                color: template.theme.colors.text 
              }}>
                Notre Équipe
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Des professionnels passionnés à votre service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {salon.team.map((member, index) => (
                <div 
                  key={member.id} 
                  className={`team-member fade-in-up stagger-${(index % 3) + 1}`}
                >
                  <div className="team-avatar">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="team-avatar" />
                    ) : (
                      <div className="team-avatar bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="team-name">
                    {member.name}
                  </div>
                  <div className="team-role">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section moderne */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ 
              fontFamily: template.theme.typography.headingFont,
              color: template.theme.colors.text 
            }}>
              Nous Contacter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Horaires */}
            <div className="contact-info fade-in-up stagger-1">
              <div className="contact-title">
                Horaires d'ouverture
              </div>
              <div className="space-y-3">
                {Object.entries(salon.hours).map(([day, hours]) => (
                  <div key={day} className="hours-item">
                    <span className="hours-day">
                      {t(`days.${day}`, day)}
                    </span>
                    <span className="hours-time">
                      {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="contact-info fade-in-up stagger-2">
              <div className="contact-title">
                Informations
              </div>
              <div className="space-y-4">
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <div className="font-medium">Adresse</div>
                    <div className="text-gray-600">{salon.address}</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <div className="font-medium">Téléphone</div>
                    <div className="text-gray-600">{profileData?.publicPhone || salon.phone || 'Non renseigné'}</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">✉️</div>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-gray-600">{salon.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Réservation rapide */}
            <div className="contact-info fade-in-up stagger-3">
              <div className="contact-title">
                Réservation rapide
              </div>
              <p className="text-gray-600 mb-6">
                Prenez rendez-vous en quelques clics
              </p>
              <button 
                className="btn-primary w-full mb-4"
                onClick={() => setSelectedService('quick-booking')}
              >
                Réserver maintenant
              </button>
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Ou appelez-nous au {profileData?.publicPhone || salon.phone || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer moderne */}
      <footer className="footer">
        <div className="max-w-6xl mx-auto px-4">
          <div className="footer-content">
            <div className="footer-logo">
              <SaloneoLogo size="md" variant="auto" className="mb-4" />
            </div>
            <p className="footer-text">
              Votre salon de beauté de confiance depuis toujours
            </p>
            
            {/* Contact rapide */}
            {(profileData?.publicPhone || salon.phone) && (
              <div className="flex items-center justify-center space-x-2 my-4 text-sm" style={{ color: template.theme.colors.textSecondary }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${profileData?.publicPhone || salon.phone}`} className="hover:underline">
                  {profileData?.publicPhone || salon.phone}
                </a>
              </div>
            )}
            
            <div className="social-links">
              {profileData?.socialMedia?.facebook && (
                <a 
                  href={profileData.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {profileData?.socialMedia?.instagram && (
                <a 
                  href={profileData.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {profileData?.socialMedia?.twitter && (
                <a 
                  href={profileData.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}
            </div>
            <div className="copyright">
              © 2025 {salon.name}. Tous droits réservés.
            </div>
            
            {/* Hosted by Saloneo - Affichage uniquement pour le plan gratuit */}
            {profileData?.subscription?.plan === 'starter' && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a 
                  href="https://saloneo.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <span>Propulsé par</span>
                  <span className="font-semibold" style={{ color: template.theme.colors.primary }}>
                    Saloneo
                  </span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Modal de réservation */}
      {selectedService && (
        <PublicBookingFlow
          isOpen={true}
          serviceId={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* Modal de recherche de réservations */}
      <AppointmentSearchForm
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
};

export default SalonPage;
