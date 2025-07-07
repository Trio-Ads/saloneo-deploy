import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CogIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAffiliationStore } from '../../store/affiliationStore';
import { useToastStore } from '../../../../components/Toast';
import { PayoutMethod, PayoutDetails } from '../../types/affiliation';

const PayoutSettings: React.FC = () => {
  const { t } = useTranslation('profile');
  const { affiliation, updateAffiliationSettings, requestPayout } = useAffiliationStore();
  const { showToast } = useToastStore();
  
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('bank');
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({
    bank: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      iban: '',
      swift: ''
    },
    paypal: {
      email: ''
    },
    crypto: {
      walletAddress: '',
      network: 'ETH'
    }
  });
  const [minimumPayout, setMinimumPayout] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');

  useEffect(() => {
    if (affiliation) {
      setPayoutMethod(affiliation.payoutMethod || 'bank');
      if (affiliation.payoutDetails) {
        setPayoutDetails(affiliation.payoutDetails);
      }
    }
  }, [affiliation]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateAffiliationSettings({
        payoutMethod,
        payoutDetails,
        minimumPayout,
        notificationsEnabled: true,
        autoApprove: false
      });
      showToast('Paramètres de paiement mis à jour', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePayoutRequest = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount < minimumPayout) {
      showToast(`Le montant minimum est de ${minimumPayout}€`, 'error');
      return;
    }

    try {
      await requestPayout(amount);
      showToast('Demande de paiement envoyée', 'success');
      setRequestAmount('');
    } catch (error) {
      showToast('Erreur lors de la demande', 'error');
    }
  };

  const availableBalance = affiliation?.totalCommissions || 0;

  return (
    <div className="space-y-6">
      {/* Solde disponible */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Solde disponible</h3>
            <p className="text-3xl font-bold text-green-600">{availableBalance.toFixed(2)} €</p>
            <p className="text-sm text-gray-600 mt-1">
              Seuil minimum de paiement : {minimumPayout} €
            </p>
          </div>
          <BanknotesIcon className="h-12 w-12 text-green-600" />
        </div>

        {availableBalance >= minimumPayout && (
          <div className="mt-6 flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant à retirer
              </label>
              <input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder={`Min. ${minimumPayout}€`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={handlePayoutRequest}
              disabled={!requestAmount || parseFloat(requestAmount) < minimumPayout}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Demander un paiement
            </button>
          </div>
        )}
      </div>

      {/* Méthode de paiement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Méthode de paiement
        </h3>

        <div className="space-y-4">
          {/* Sélection de la méthode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setPayoutMethod('bank')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                payoutMethod === 'bank'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <BuildingLibraryIcon className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <p className="font-medium">Virement bancaire</p>
            </button>

            <button
              onClick={() => setPayoutMethod('paypal')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                payoutMethod === 'paypal'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">PayPal</p>
            </button>

            <button
              onClick={() => setPayoutMethod('crypto')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                payoutMethod === 'crypto'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="font-medium">Crypto</p>
            </button>
          </div>

          {/* Détails selon la méthode */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            {payoutMethod === 'bank' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-4">Informations bancaires</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      value={payoutDetails.bank?.accountName || ''}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bank: { ...payoutDetails.bank!, accountName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la banque
                    </label>
                    <input
                      type="text"
                      value={payoutDetails.bank?.bankName || ''}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bank: { ...payoutDetails.bank!, bankName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={payoutDetails.bank?.iban || ''}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bank: { ...payoutDetails.bank!, iban: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code SWIFT/BIC
                    </label>
                    <input
                      type="text"
                      value={payoutDetails.bank?.swift || ''}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bank: { ...payoutDetails.bank!, swift: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {payoutMethod === 'paypal' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-4">Informations PayPal</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email PayPal
                  </label>
                  <input
                    type="email"
                    value={payoutDetails.paypal?.email || ''}
                    onChange={(e) => setPayoutDetails({
                      ...payoutDetails,
                      paypal: { email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
            )}

            {payoutMethod === 'crypto' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-4">Informations Crypto</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Réseau
                  </label>
                  <select
                    value={payoutDetails.crypto?.network || 'ETH'}
                    onChange={(e) => setPayoutDetails({
                      ...payoutDetails,
                      crypto: { ...payoutDetails.crypto!, network: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="USDT">Tether (USDT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse du wallet
                  </label>
                  <input
                    type="text"
                    value={payoutDetails.crypto?.walletAddress || ''}
                    onChange={(e) => setPayoutDetails({
                      ...payoutDetails,
                      crypto: { ...payoutDetails.crypto!, walletAddress: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    placeholder="0x..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seuil minimum */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seuil minimum de paiement
          </label>
          <select
            value={minimumPayout}
            onChange={(e) => setMinimumPayout(parseInt(e.target.value))}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={50}>50 €</option>
            <option value={100}>100 €</option>
            <option value={200}>200 €</option>
            <option value={500}>500 €</option>
          </select>
          <p className="mt-2 text-sm text-gray-600">
            Les paiements seront effectués automatiquement lorsque votre solde atteindra ce montant.
          </p>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Sauvegarder les paramètres</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Avertissement */}
      <div className="bg-yellow-50 rounded-xl p-4 flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-1">Important :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Les paiements sont traités entre le 1er et le 5 de chaque mois</li>
            <li>Un délai de 2-5 jours ouvrés est nécessaire selon la méthode choisie</li>
            <li>Des frais de transaction peuvent s'appliquer selon votre banque</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PayoutSettings;
