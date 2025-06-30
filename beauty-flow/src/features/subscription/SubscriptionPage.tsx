import React from 'react';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  BuildingOfficeIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  HeartIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { PlanCard } from './components/PlanCard';
import { useSubscriptionStore } from './store';
import { PLAN_LIMITS, PLAN_PRICES, PlanType, Plan } from './types';

export const SubscriptionPage: React.FC = () => {
  const { subscription, updateSubscription } = useSubscriptionStore();

  const plans: Plan[] = Object.values(PlanType).map((type) => ({
    type,
    limits: PLAN_LIMITS[type],
    price: PLAN_PRICES[type]
  }));

  const handlePlanSelect = (planType: PlanType) => {
    // Pour le moment, on met juste à jour le plan sans paiement
    updateSubscription({
      ...subscription,
      currentPlan: planType,
      startDate: new Date().toISOString()
    });
  };

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Sécurité Premium",
      description: "Vos données sont protégées avec un chiffrement de niveau bancaire"
    },
    {
      icon: ArrowTrendingUpIcon,
      title: "Croissance Garantie",
      description: "Augmentez votre chiffre d'affaires de 30% en moyenne"
    },
    {
      icon: HeartIcon,
      title: "Support 24/7",
      description: "Une équipe dédiée pour vous accompagner à chaque étape"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO HEADER SPECTACULAIRE */}
        <div className="relative mb-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 overflow-hidden">
            {/* Particules flottantes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            </div>

            <div className="relative text-center">
              {/* Icône principale avec animation */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-2xl transform hover:scale-110 transition-all duration-500">
                    <CurrencyDollarIcon className="h-12 w-12 text-white animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Titre avec effet gradient animé */}
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                Choisissez Votre Plan
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transformez votre salon avec Saloneo et rejoignez plus de{' '}
                <span className="font-bold text-indigo-600">10,000+ professionnels</span>{' '}
                qui ont révolutionné leur activité
              </p>

              {/* Badges de confiance */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">Essai gratuit 14 jours</span>
                </div>
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-blue-700 font-medium">Sans engagement</span>
                </div>
                <div className="flex items-center bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                  <StarIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-purple-700 font-medium">Support premium</span>
                </div>
              </div>

              {/* Promotion flash */}
              <div className="inline-block bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl animate-pulse">
                🔥 OFFRE LIMITÉE : -40% sur tous les plans ! 🔥
              </div>
            </div>
          </div>
        </div>

        {/* GRILLE DES PLANS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={plan.type}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PlanCard
                plan={plan}
                isCurrentPlan={plan.type === subscription.currentPlan}
                onSelect={handlePlanSelect}
              />
            </div>
          ))}
        </div>

        {/* SECTION POURQUOI BEAUTY FLOW */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Pourquoi choisir Saloneo ?
            </h2>
            <p className="text-xl text-gray-600">
              La solution complète pour faire prospérer votre salon de beauté
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TÉMOIGNAGES */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-2xl p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos clients</h2>
            <p className="text-xl opacity-90">Plus de 10,000 professionnels nous font confiance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Dubois",
                salon: "Salon Élégance",
                text: "Saloneo a transformé ma façon de travailler. +50% de réservations en 3 mois !",
                rating: 5
              },
              {
                name: "Sophie Martin",
                salon: "Beauty Paradise",
                text: "Interface intuitive et support exceptionnel. Je recommande vivement !",
                rating: 5
              },
              {
                name: "Amélie Laurent",
                salon: "Coiffure Moderne",
                text: "Mes clients adorent pouvoir réserver en ligne. Un vrai plus pour mon salon !",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="opacity-80">{testimonial.salon}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Questions Fréquentes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement."
              },
              {
                q: "Y a-t-il des frais cachés ?",
                a: "Aucun frais caché ! Le prix affiché est tout compris. Pas de frais de setup, pas de commission sur les ventes."
              },
              {
                q: "Que se passe-t-il si j'annule mon abonnement ?",
                a: "Vous gardez l'accès jusqu'à la fin de votre période de facturation. Vos données sont conservées 30 jours."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/50 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Prêt à transformer votre salon ?</h2>
            <p className="text-xl mb-6 opacity-90">Rejoignez des milliers de professionnels satisfaits</p>
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
              Commencer l'essai gratuit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
