import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  AffiliationData, 
  Commission, 
  AffiliationSettings,
  MarketingMaterial,
  AffiliateLink
} from '../types/affiliation';
import { affiliationAPI } from '../../../services/api';

interface AffiliationStore {
  affiliation: AffiliationData | null;
  commissions: Commission[];
  marketingMaterials: MarketingMaterial[];
  affiliateLinks: AffiliateLink[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadAffiliationData: () => Promise<void>;
  activateAffiliation: () => Promise<void>;
  updateAffiliationSettings: (settings: Partial<AffiliationSettings>) => Promise<void>;
  loadCommissions: (filters?: { status?: string; dateFrom?: Date; dateTo?: Date }) => Promise<void>;
  loadMarketingMaterials: () => Promise<void>;
  generateAffiliateLink: (campaign?: string) => Promise<AffiliateLink>;
  trackClick: (affiliateCode: string) => Promise<void>;
  requestPayout: (amount: number) => Promise<void>;
  resetError: () => void;
}

export const useAffiliationStore = create<AffiliationStore>()(
  persist(
    (set, get) => ({
      affiliation: null,
      commissions: [],
      marketingMaterials: [],
      affiliateLinks: [],
      isLoading: false,
      error: null,

      loadAffiliationData: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await affiliationAPI.getAffiliationData();
          set({ 
            affiliation: response.data.affiliation,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Erreur lors du chargement des données d\'affiliation:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors du chargement',
            isLoading: false 
          });
        }
      },

      activateAffiliation: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await affiliationAPI.activateAffiliation();
          set({ 
            affiliation: response.data.affiliation,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Erreur lors de l\'activation de l\'affiliation:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors de l\'activation',
            isLoading: false 
          });
          throw error;
        }
      },

      updateAffiliationSettings: async (settings) => {
        set({ isLoading: true, error: null });
        try {
          const response = await affiliationAPI.updateAffiliationSettings(settings);
          set({ 
            affiliation: response.data.affiliation,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Erreur lors de la mise à jour des paramètres:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors de la mise à jour',
            isLoading: false 
          });
          throw error;
        }
      },

      loadCommissions: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await affiliationAPI.getCommissions(filters);
          set({ 
            commissions: response.data.commissions,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Erreur lors du chargement des commissions:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors du chargement',
            isLoading: false 
          });
        }
      },

      loadMarketingMaterials: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await affiliationAPI.getMarketingMaterials();
          set({ 
            marketingMaterials: response.data.materials,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Erreur lors du chargement du matériel marketing:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors du chargement',
            isLoading: false 
          });
        }
      },

      generateAffiliateLink: async (campaign) => {
        set({ isLoading: true, error: null });
        try {
          const response = await affiliationAPI.generateAffiliateLink(campaign);
          const newLink = response.data.link;
          
          set((state) => ({ 
            affiliateLinks: [...state.affiliateLinks, newLink],
            isLoading: false 
          }));
          
          return newLink;
        } catch (error: any) {
          console.error('Erreur lors de la génération du lien:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors de la génération',
            isLoading: false 
          });
          throw error;
        }
      },

      trackClick: async (affiliateCode) => {
        try {
          await affiliationAPI.trackClick(affiliateCode);
        } catch (error) {
          console.error('Erreur lors du tracking du clic:', error);
        }
      },

      requestPayout: async (amount) => {
        set({ isLoading: true, error: null });
        try {
          await affiliationAPI.requestPayout(amount);
          // Recharger les données après la demande
          await get().loadAffiliationData();
          await get().loadCommissions();
        } catch (error: any) {
          console.error('Erreur lors de la demande de paiement:', error);
          set({ 
            error: error.response?.data?.error || 'Erreur lors de la demande',
            isLoading: false 
          });
          throw error;
        }
      },

      resetError: () => set({ error: null }),
    }),
    {
      name: 'beauty-flow-affiliation',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        affiliation: state.affiliation,
        affiliateLinks: state.affiliateLinks,
      }),
    }
  )
);
