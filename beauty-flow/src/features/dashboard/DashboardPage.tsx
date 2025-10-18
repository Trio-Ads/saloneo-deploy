import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  BellIcon,
  PlusIcon,
  ArrowPathIcon,
  ChartPieIcon,
  UserGroupIcon,
  ScissorsIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAppointmentStore } from '../appointments/store';
import { useClientStore } from '../clients/store';
import { useServiceStore } from '../services/store';
import { useTeamStore } from '../team/store';
import { useAuthStore } from '../auth/store';
import { useProfileStore } from '../profile/store';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { formatPrice } from '../../utils/currency';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  RevenueChart,
  AppointmentChart,
  ServicePopularityChart,
  TeamPerformanceWidget,
  QuickActions,
  UpcomingAppointments,
  RecentActivity,
  BusinessInsights
} from './components';
import { Appointment, AppointmentStatus } from '../appointments/types';
import { useEnrichedAppointments } from './hooks/useEnrichedAppointments';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { appointments, loadAppointments } = useAppointmentStore();
  const { clients, fetchClients } = useClientStore();
  const { services } = useServiceStore();
  const { members } = useTeamStore();
  const { currentPlan, checkAppointmentLimit } = useSubscriptionLimits();
  
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  // Enrichir les rendez-vous avec les prix et les informations client
  const enrichedAppointments = useEnrichedAppointments(appointments || [], services, clients || []);

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadAppointments(),
          fetchClients()
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [loadAppointments, fetchClients]);

  // Calculer les dates de début et fin selon la période sélectionnée
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now, { locale: fr }), end: endOfWeek(now, { locale: fr }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  // Filtrer les rendez-vous selon la période
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    const { start, end } = getDateRange();
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= start && aptDate <= end;
    });
  }, [appointments, timeRange]);

  // Calculer les statistiques principales
  const stats = useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const monthStart = startOfMonth(today);
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    // Rendez-vous du jour
    const todayAppointments = enrichedAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= todayStart && aptDate <= todayEnd;
    });

    // Revenus du mois
    const monthRevenue = enrichedAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= monthStart && apt.status === 'completed';
    }).reduce((sum, apt) => sum + (apt.price || 0), 0);

    // Revenus du mois dernier
    const lastMonthRevenue = enrichedAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= lastMonthStart && aptDate <= lastMonthEnd && apt.status === 'completed';
    }).reduce((sum, apt) => sum + (apt.price || 0), 0);

    // Nouveaux clients ce mois
    const newClientsThisMonth = clients?.filter(client => {
      const createdDate = new Date(client.createdAt);
      return createdDate >= monthStart;
    }).length || 0;

    // Taux d'occupation
    const totalSlots = members.length * 8 * 22; // 8h/jour, 22 jours/mois
    const bookedSlots = appointments?.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= monthStart && apt.status !== 'cancelled';
    }).length || 0;
    const occupancyRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

    return {
      todayAppointments: todayAppointments.length,
      todayRevenue: todayAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0),
      monthRevenue,
      revenueGrowth: lastMonthRevenue > 0 
        ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0,
      newClients: newClientsThisMonth,
      totalClients: clients?.length || 0,
      occupancyRate,
      upcomingAppointments: appointments?.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate > today && apt.status !== 'cancelled';
      }).length || 0
    };
  }, [appointments, clients, members, enrichedAppointments]);

  // Rendez-vous à venir (prochaines 24h)
  const upcomingAppointments = useMemo(() => {
    if (!appointments) return [];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= now && aptDate <= tomorrow && apt.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [appointments]);

  // Alertes et notifications
  const alerts = useMemo(() => {
    const alertList = [];

    // Alerte limite d'abonnement
    const limitCheck = checkAppointmentLimit();
    const usagePercentage = limitCheck.limit > 0 ? (limitCheck.current / limitCheck.limit) * 100 : 0;
    if (limitCheck && usagePercentage >= 80 && !limitCheck.canAdd) {
      alertList.push({
        type: 'warning',
        message: t('alerts.subscription_limit', { percentage: Math.round(usagePercentage) }),
        action: { label: t('alerts.upgrade'), link: '/subscription' }
      });
    }

    // Rendez-vous non confirmés
    const unconfirmedCount = appointments?.filter((apt: Appointment) => 
      apt.status === 'scheduled' && isToday(new Date(apt.date))
    ).length || 0;
    
    if (unconfirmedCount > 0) {
      alertList.push({
        type: 'info',
        message: t('alerts.unconfirmed_appointments', { count: unconfirmedCount }),
        action: { label: t('alerts.view'), link: '/appointments' }
      });
    }

    // Clients fidèles à récompenser (basé sur les points de fidélité)
    const loyalClients = clients?.filter((client: any) => 
      client.loyaltyPoints > 100
    ).length || 0;

    if (loyalClients > 0) {
      alertList.push({
        type: 'success',
        message: t('alerts.loyal_clients', { count: loyalClients }),
        action: { label: t('alerts.manage'), link: '/clients' }
      });
    }

    return alertList;
  }, [appointments, clients, checkAppointmentLimit, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-100 border-t-orange-500 dark:border-orange-900 dark:border-t-orange-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header avec salutation personnalisée */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                  {t('welcome')} {user?.firstName || user?.establishmentName} 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-base sm:text-lg">
                  {t('overview_subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center mt-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                  </span>
                  <span className="flex items-center">
                    <SparklesIcon className="h-4 w-4 mr-1 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    Plan {currentPlan}
                  </span>
                </div>
              </div>

              {/* Sélecteur de période - Mobile optimisé */}
              <div className="flex items-center justify-center sm:justify-start">
                <div className="inline-flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 w-full sm:w-auto">
                  <button
                    onClick={() => setTimeRange('day')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation ${
                      timeRange === 'day'
                        ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:scale-95'
                    }`}
                  >
                    {t('time_periods.day')}
                  </button>
                  <button
                    onClick={() => setTimeRange('week')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation ${
                      timeRange === 'week'
                        ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:scale-95'
                    }`}
                  >
                    {t('time_periods.week')}
                  </button>
                  <button
                    onClick={() => setTimeRange('month')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 touch-manipulation ${
                      timeRange === 'month'
                        ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white active:scale-95'
                    }`}
                  >
                    {t('time_periods.month')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes et notifications - Mobile optimisé */}
        {alerts.length > 0 && (
          <div className="mb-4 sm:mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  alert.type === 'warning' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                    : alert.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start sm:items-center">
                  {alert.type === 'warning' ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                  ) : alert.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                  ) : (
                    <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                  )}
                  <span className={`font-medium text-sm sm:text-base ${
                    alert.type === 'warning' 
                      ? 'text-amber-800 dark:text-amber-200' 
                      : alert.type === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {alert.message}
                  </span>
                </div>
                {alert.action && (
                  <Link
                    to={alert.action.link}
                    className={`w-full sm:w-auto text-center px-4 py-2.5 sm:py-2 rounded-lg font-medium text-sm transition-all duration-200 touch-manipulation active:scale-95 ${
                      alert.type === 'warning' 
                        ? 'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600' 
                        : alert.type === 'success'
                        ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    }`}
                  >
                    {alert.action.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* KPIs principaux - Mobile optimisé */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Revenus du jour - Mobile optimisé */}
          <div className="group relative touch-manipulation">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 group-active:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 hover:shadow-2xl active:shadow-2xl transform hover:scale-105 active:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">{t('kpis.daily_revenue')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 truncate">{formatPrice(stats.todayRevenue, profile.currency)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.todayAppointments} {t('kpis.appointments')}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0 ml-3">
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenus du mois - Mobile optimisé */}
          <div className="group relative touch-manipulation">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 group-active:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 hover:shadow-2xl active:shadow-2xl transform hover:scale-105 active:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">{t('kpis.monthly_revenue')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 truncate">{formatPrice(stats.monthRevenue, profile.currency)}</p>
                  <div className="flex items-center mt-1">
                    {stats.revenueGrowth >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mr-1 flex-shrink-0" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 mr-1 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${
                      stats.revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0 ml-3">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Clients - Mobile optimisé */}
          <div className="group relative touch-manipulation">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 group-active:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 hover:shadow-2xl active:shadow-2xl transform hover:scale-105 active:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">{t('kpis.clients')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalClients}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">+{stats.newClients} {t('kpis.this_month')}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0 ml-3">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Taux d'occupation - Mobile optimisé */}
          <div className="group relative touch-manipulation">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 group-active:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 hover:shadow-2xl active:shadow-2xl transform hover:scale-105 active:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">{t('kpis.occupancy')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.occupancyRate.toFixed(0)}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.upcomingAppointments} {t('kpis.upcoming')}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0 ml-3">
                  <ChartPieIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <QuickActions />

        {/* Graphiques et widgets - Mobile optimisé */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Graphique des revenus */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span className="truncate">{t('charts_titles.revenue_evolution')}</span>
            </h3>
            <RevenueChart appointments={appointments || []} timeRange={timeRange} />
          </div>

          {/* Graphique des rendez-vous */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span className="truncate">{t('charts_titles.appointments_by_status')}</span>
            </h3>
            <AppointmentChart appointments={filteredAppointments} />
          </div>
        </div>

        {/* Widgets secondaires - Mobile optimisé */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Prochains rendez-vous */}
          <div className="lg:col-span-1">
            <UpcomingAppointments appointments={upcomingAppointments} />
          </div>

          {/* Services populaires */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="truncate">{t('charts_titles.popular_services')}</span>
              </h3>
              <ServicePopularityChart appointments={appointments || []} services={services} />
            </div>
          </div>

          {/* Performance de l'équipe */}
          <div className="lg:col-span-1">
            <TeamPerformanceWidget appointments={appointments || []} members={members} />
          </div>
        </div>

        {/* Insights et activité récente - Mobile optimisé */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Business Insights */}
          <BusinessInsights 
            appointments={appointments || []} 
            clients={clients || []}
            services={services}
          />

          {/* Activité récente */}
          <RecentActivity appointments={appointments || []} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
