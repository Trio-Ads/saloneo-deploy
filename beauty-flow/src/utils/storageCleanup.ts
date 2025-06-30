/**
 * Utilitaires pour nettoyer et valider les données du localStorage
 */

export const STORAGE_KEYS = {
  APPOINTMENTS: 'beauty-flow-appointments',
  SERVICES: 'beauty-flow-services',
  CLIENTS: 'beauty-flow-clients',
  TEAM: 'beauty-flow-team',
  INTERFACE: 'beauty-flow-interface',
  PROFILE: 'beauty-flow-profile',
  AUTH: 'beauty-flow-auth',
  SUBSCRIPTION: 'beauty-flow-subscription',
  PUBLIC: 'beauty-flow-public'
} as const;

/**
 * Nettoie toutes les données du localStorage liées à Beauty Flow
 */
export const clearAllStorageData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('✅ All Beauty Flow storage data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing storage data:', error);
  }
};

/**
 * Nettoie une clé spécifique du localStorage
 */
export const clearStorageKey = (key: string): void => {
  try {
    localStorage.removeItem(key);
    console.log(`✅ Storage key "${key}" cleared successfully`);
  } catch (error) {
    console.error(`❌ Error clearing storage key "${key}":`, error);
  }
};

/**
 * Valide si une donnée du localStorage est un tableau valide
 */
export const validateArrayData = (data: any, keyName: string): boolean => {
  if (!Array.isArray(data)) {
    console.warn(`⚠️ Invalid ${keyName} data detected (not an array):`, data);
    return false;
  }
  return true;
};

/**
 * Valide si une donnée du localStorage est un objet valide
 */
export const validateObjectData = (data: any, keyName: string): boolean => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn(`⚠️ Invalid ${keyName} data detected (not an object):`, data);
    return false;
  }
  return true;
};

/**
 * Récupère et valide les données d'un store depuis le localStorage
 */
export const getValidatedStorageData = <T>(
  key: string, 
  defaultValue: T, 
  validator?: (data: any) => boolean
): T => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) {
      return defaultValue;
    }

    const parsedData = JSON.parse(storedData);
    
    // Si un validateur est fourni, l'utiliser
    if (validator && !validator(parsedData)) {
      console.warn(`⚠️ Invalid data for key "${key}", using default value`);
      clearStorageKey(key);
      return defaultValue;
    }

    return parsedData;
  } catch (error) {
    console.error(`❌ Error parsing storage data for key "${key}":`, error);
    clearStorageKey(key);
    return defaultValue;
  }
};

/**
 * Diagnostique l'état du localStorage et identifie les problèmes
 */
export const diagnoseStorageIssues = (): {
  hasIssues: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Vérifier chaque clé de stockage
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Vérifications spécifiques selon le type de données
          switch (name) {
            case 'APPOINTMENTS':
            case 'SERVICES':
            case 'CLIENTS':
            case 'TEAM':
              if (parsed.state && !Array.isArray(parsed.state[name.toLowerCase()])) {
                issues.push(`${name} data is not an array`);
                recommendations.push(`Clear ${name} storage`);
              }
              break;
            
            default:
              // Vérification générale pour les objets
              if (typeof parsed !== 'object') {
                issues.push(`${name} data is not an object`);
                recommendations.push(`Clear ${name} storage`);
              }
          }
        }
      } catch (parseError) {
        issues.push(`Cannot parse ${name} data`);
        recommendations.push(`Clear ${name} storage`);
      }
    });

    // Vérifier l'espace de stockage disponible
    try {
      const testKey = 'storage-test';
      const testData = 'x'.repeat(1024); // 1KB de test
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
    } catch (storageError) {
      issues.push('localStorage quota exceeded or unavailable');
      recommendations.push('Clear some storage data or use private browsing mode');
    }

  } catch (error) {
    issues.push('Cannot access localStorage');
    recommendations.push('Check browser settings and privacy mode');
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    recommendations
  };
};

/**
 * Répare automatiquement les problèmes de stockage détectés
 */
export const repairStorageIssues = (): boolean => {
  try {
    const diagnosis = diagnoseStorageIssues();
    
    if (!diagnosis.hasIssues) {
      console.log('✅ No storage issues detected');
      return true;
    }

    console.log('🔧 Repairing storage issues...');
    
    // Nettoyer les données corrompues
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // Test de parsing
        }
      } catch (error) {
        console.log(`🧹 Clearing corrupted ${name} data`);
        clearStorageKey(key);
      }
    });

    console.log('✅ Storage repair completed');
    return true;
  } catch (error) {
    console.error('❌ Error during storage repair:', error);
    return false;
  }
};

/**
 * Exporte les données du localStorage pour sauvegarde
 */
export const exportStorageData = (): string => {
  const exportData: Record<string, any> = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        exportData[key] = JSON.parse(data);
      }
    } catch (error) {
      console.warn(`⚠️ Could not export ${name} data:`, error);
    }
  });

  return JSON.stringify(exportData, null, 2);
};

/**
 * Importe les données dans le localStorage depuis une sauvegarde
 */
export const importStorageData = (jsonData: string): boolean => {
  try {
    const importData = JSON.parse(jsonData);
    
    Object.entries(importData).forEach(([key, value]) => {
      if (Object.values(STORAGE_KEYS).includes(key as any)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });

    console.log('✅ Storage data imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Error importing storage data:', error);
    return false;
  }
};
