import { useEffect } from 'react';
import { useInterfaceStore } from '../features/interface/store';

export const useTemplateLoader = () => {
  const { restoreTemplate } = useInterfaceStore();

  useEffect(() => {
    // Restaurer le template sauvegardé au chargement de l'application
    const timer = setTimeout(() => {
      restoreTemplate();
    }, 100); // Petit délai pour s'assurer que le DOM est prêt

    return () => clearTimeout(timer);
  }, [restoreTemplate]);
};
