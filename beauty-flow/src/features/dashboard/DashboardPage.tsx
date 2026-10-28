import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, CheckCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAppointmentStore } from '../appointments/store';
import { useClientStore } from '../clients/store';
import { useServiceStore } from '../services/store';
import { useTeamStore } from '../team/store';
import { useAuthStore } from '../auth/store';
import { useProfileStore } from '../profile/store';
import { useSubscriptionLimits } from '../subscription/hooks/useSubscriptionLimits';
import { formatPrice } from '../../utils/currency';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader, Panel, StatGroup, Badge, Segmented } from '../../components/ui';
import { dateLocale } from './dateLocale';
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
import { Appointment } from '../appointments/types';
import { useEnrichedAppointments } from './hooks/useEnrichedAppointments';

const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation('dashboard');
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { appointments, loadAppointments } = useAppointmentStore();
  const { clients, fetchClients } = useClientStore();
  const { services } = useServiceStore();
  const { members } = useTeamStore();
  const { currentPlan, usageStats, checkAppointmentLimit } = useSubscriptionLimits();
  // Until usage-stats arrives, the auth user's plan is the truth (the local store defaults to FREE)
  const plan = usageStats ? currentPlan : user?.subscription?.planType || currentPlan;
  
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

  // Prochains rendez-vous: date + heure de début (apt.date seul vaut minuit)
  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    const startsAt = (apt: Appointment) =>
      new Date(`${String(apt.date).slice(0, 10)}T${(apt.startTime || '00:00').padStart(5, '0')}`).getTime();
    return enrichedAppointments
      .filter(apt => apt.status !== 'cancelled' && startsAt(apt) >= now)
      .sort((a, b) => startsAt(a) - startsAt(b))
      .slice(0, 5);
  }, [enrichedAppointments]);

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
      <div className="flex justify-center py-24" role="status" aria-label={t('loading')}>
        <div className="size-8 rounded-full border-2 border-gray-200 border-t-orange-500 animate-spin dark:border-gray-800 dark:border-t-orange-400" />
      </div>
    );
  }

  const name = user?.firstName || user?.establishmentName;
  const alertStyles = {
    warning: { icon: ExclamationTriangleIcon, color: 'text-amber-600 dark:text-amber-400' },
    success: { icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-400' },
    info: { icon: BellIcon, color: 'text-gray-400' },
  };

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={name ? `${t('welcome')}, ${name}` : t('title')}
        subtitle={<span className="first-letter:uppercase inline-block">{format(new Date(), 'EEEE d MMMM yyyy', { locale: dateLocale(i18n.language) })}</span>}
        meta={
          <Badge tone={plan === 'FREE' ? 'neutral' : 'orange'}>
            {t('user_menu.plan_prefix', { ns: 'common' })} {t(`user_menu.plans.${plan}`, { ns: 'common', defaultValue: plan })}
          </Badge>
        }
        actions={
          <Segmented
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: 'day', label: t('time_periods.day') },
              { value: 'week', label: t('time_periods.week') },
              { value: 'month', label: t('time_periods.month') },
            ]}
          />
        }
      />

      {alerts.length > 0 && (
        <div className="panel mb-6 divide-y divide-gray-100 dark:divide-gray-800 dark:bg-gray-900 dark:border-gray-800">
          {alerts.map((alert, index) => {
            const { icon: Icon, color } = alertStyles[alert.type as keyof typeof alertStyles] || alertStyles.info;
            return (
              <div key={index} className="flex items-center gap-3 px-5 py-3">
                <Icon className={`size-5 shrink-0 ${color}`} />
                <p className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                {alert.action && (
                  <Link to={alert.action.link} className="shrink-0 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
                    {alert.action.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <StatGroup
        items={[
          {
            label: t('kpis.daily_revenue'),
            value: formatPrice(stats.todayRevenue, profile.currency),
            hint: `${stats.todayAppointments} ${t('kpis.appointments')}`,
            accent: true,
          },
          {
            label: t('kpis.monthly_revenue'),
            value: formatPrice(stats.monthRevenue, profile.currency),
            hint: (
              <span className={stats.revenueGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% <span className="text-gray-500 dark:text-gray-400">{t('metrics.vs_last_period')}</span>
              </span>
            ),
          },
          { label: t('kpis.clients'), value: stats.totalClients, hint: `+${stats.newClients} ${t('kpis.this_month')}` },
          { label: t('kpis.occupancy'), value: `${stats.occupancyRate.toFixed(0)}%`, hint: `${stats.upcomingAppointments} ${t('kpis.upcoming')}` },
        ]}
      />

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <Panel title={t('charts_titles.revenue_evolution')} className="lg:col-span-2">
          <RevenueChart appointments={enrichedAppointments} timeRange={timeRange} />
        </Panel>
        <UpcomingAppointments appointments={upcomingAppointments} />

        <Panel title={t('charts_titles.appointments_by_status')}>
          <AppointmentChart appointments={filteredAppointments} />
        </Panel>
        <Panel title={t('charts_titles.popular_services')}>
          <ServicePopularityChart appointments={enrichedAppointments} services={services} />
        </Panel>
        <TeamPerformanceWidget appointments={enrichedAppointments} members={members} />

        <div className="lg:self-start">
          <BusinessInsights appointments={enrichedAppointments} clients={clients || []} services={services} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity appointments={enrichedAppointments} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
