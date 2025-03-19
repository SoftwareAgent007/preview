// useDashboardData.ts
import { useMemo } from 'react';
import { DashboardOverviewResponse } from '@/types/dataTypes';
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

  const defaultStats = {
    totalUsers: { count: 0, label: 'Total Users' },
    activeUsers: { count: 0, label: 'Active Users' },
    totalMessages: { count: 0, label: 'Total Messages' },
    totalReactions: { count: 0, label: 'Total Reactions' },
    topKeywords: [],
    topUsers: [],
    currentActivities: {
      activeGamers: { count: 0, label: 'Active Gamers' },
      spotifyListeners: { count: 0, label: 'Spotify Listeners' },
    },
    peakActivityTime: { time: '00:00', users: 0, percentChange: 0 },
    totalGameTime: { hours: 0, hourChange: '+0h' },
    hourlyActivity: [],
    activeListeners: { count: 0, percentChange: 0 },
    keywordsCount: { count: 0, percentChange: 0 },
  };

  const activityStats = useMemo(() => {
    // if (!activityData) return defaultStats;

    return {
      ...defaultStats,
      ...activityData,
    };
  }, [activityData]);

  return {
    ...activityStats,
    hourlyActivityData,
    isLoading,
    error,
  };
}
