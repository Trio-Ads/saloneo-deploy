import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserGroupIcon,
  CheckIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';

const AffiliationActivation: React.FC = () => {
  const { t } = useTranslation('profile');
  const [isActivating, setIsActivating] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { activateAffiliation } = useAffiliationStore();
  const { showToast } = useToastStore();

  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: 'Commissions attractives',
      description: 'Gagnez 20% de commission sur chaque abonnement',
    },
    {
      icon: ChartBarIcon,
      title: 'Tableau de bord détaillé',
      description: 'Suivez vos performances en temps réel',
    },
    {
      icon: GiftIcon,
      title: 'Outils marketing',
      description: 'Accédez à des ressources pour promouvoir Saloneo',
    },
    {
      icon: SparklesIcon,
      title: 'Support dédié',
      description: 'Bénéficiez d\'un accompagnement personnalisé',
    },
  ];

  const handleActivate = async () => {
    if (!acceptedTerms) {
      showToast('Veuillez accepter les conditions d\'affiliation', 'error');
      return;
    }

    setIsActivating(true);
    try {
      await activateAffiliation();
      showToast('Programme d\'affiliation activé avec succès !', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'activation', 'error');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4">
          <UserGroupIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Devenez Affilié Saloneo
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Recommandez Saloneo et gagnez des commissions sur chaque nouveau client
        </p>
      </div>

      {/* Avantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Icon className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comment ça marche */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-8 mb-8 border border-orange-200 dark:border-orange-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Comment ça marche ?</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Activez votre compte affilié</h4>
              <p className="text-gray-600 dark:text-gray-400">Obtenez votre code affilié unique en quelques clics</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Partagez votre lien</h4>
              <p className="text-gray-600 dark:text-gray-400">Recommandez Saloneo à votre réseau professionnel</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Gagnez des commissions</h4>
              <p className="text-gray-600 dark:text-gray-400">Recevez 20% sur chaque abonnement généré</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions et activation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Conditions du programme
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-3">
            En activant le programme d'affiliation Saloneo, vous acceptez les conditions suivantes :
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Les commissions sont de 20% sur le montant HT de chaque abonnement</li>
            <li>Les commissions sont versées mensuellement avec un seuil minimum de 50€</li>
            <li>Le cookie de tracking a une durée de vie de 30 jours</li>
            <li>Les auto-parrainages ne sont pas autorisés</li>
            <li>Saloneo se réserve le droit de modifier ou suspendre le programme</li>
            <li>Toute fraude entraînera la suspension immédiate du compte affilié</li>
          </ul>
        </div>

        <div className="flex items-start mb-6">
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded mt-0.5"
          />
          <label htmlFor="accept-terms" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
            J'accepte les conditions du programme d'affiliation Saloneo
          </label>
        </div>

        <button
          onClick={handleActivate}
          disabled={!acceptedTerms || isActivating}
          className={`
            w-full py-3 px-4 rounded-xl font-medium text-white
            transition-all duration-200 flex items-center justify-center space-x-2
            ${acceptedTerms && !isActivating
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            }
          `}
        >
          {isActivating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Activation en cours...</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-5 w-5" />
              <span>Activer le programme d'affiliation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AffiliationActivation;
