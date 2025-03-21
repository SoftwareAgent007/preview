import { useMemo } from 'react';
import { DashboardOverviewResponse, DailyMetric, HourlyMetric } from '@/types/dataTypes';
import { useQueryBuilder } from './common/useQueryBuilder';

export function useDashboardData() {
  const {
    data: activityData,
    isLoading,
    error,
  } = useQueryBuilder<DashboardOverviewResponse>(
    ['activity-overview-dashboard'],
    (guildId, startDate, endDate) =>
      `/dashboard/overview?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const {
    data: hourlyActivityData,
  } = useQueryBuilder<any>(
    ['hourly-activity-dashboard'],
    (guildId, startDate, endDate) =>
      `/presence-activity/hourly-activity?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const {
    data: dailyMessageMetrics,
  } = useQueryBuilder<DailyMetric[]>(
    ['daily-message-metrics'],
    (guildId, startDate, endDate) =>
      `/message-metrics/daily?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const activityStats = useMemo(() => {
    // if (!activityData) return defaultStats;

    return {
      ...activityData,
    };
  }, [activityData]);

  return {
    ...activityStats,
    hourlyActivityData,
    dailyMessageMetrics,
    isLoading,
    error,
  };
}
