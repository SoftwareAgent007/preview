import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import { DashboardOverviewResponse, TimeRange } from '@/types/dataTypes';

export const useDashboardData = (period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  // const { timeRange } = useContext(DateRangeContext);
  const timeRange = { startDate: new Date((new Date()).setMonth((new Date()).getMonth() - 1)), endDate: new Date() };

  const { data: activityData, isLoading, error } = useQuery<DashboardOverviewResponse>(
    ['activity-overview', 323644524268093441],
    () =>
      apiService.getData(
        `/dashboard/overview?guildId=${323644524268093441}&startDate=${timeRange.startDate.toISOString()}&endDate=${timeRange.endDate.toISOString()}`
      ),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      onError: (err) => console.error('Error fetching activity overview:', err),
    }
  );

  const { data: hourlyActivityData } = useQuery(
    ['hourly-activity', 618826436299456533],
    () =>
      apiService.getData(
        `/presence-activity/hourly-activity?guildId=618826436299456533&startDate=${timeRange.startDate.toISOString()}&endDate=${timeRange.endDate.toISOString()}`
      ),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      onError: (err) => console.error('Error fetching hourly activity:', err),
    }
  );
  
  // Default values for activity statistics
  const defaultStats = {
    totalUsers: {
      count: 0,
      label: "Total Users"
    },
    activeUsers: {
      count: 0,
      label: "Active Users"
    },
    totalMessages: {
      count: 0,
      label: "Total Messages"
    },
    totalReactions: {
      count: 0,
      label: "Total Reactions"
    },
    topKeywords: [],
    topUsers: [],
    currentActivities: {
      activeGamers: {
        count: 0,
        label: "Active Gamers"
      },
      spotifyListeners: {
        count: 0,
        label: "Spotify Listeners"
      }
    },
    peakActivityTime: {
      time: "00:00",
      users: 0,
      percentChange: 0
    },
    totalGameTime: {
      hours: 0,
      hourChange: "+0h"
    },
    hourlyActivity: [],
    activeListeners: {
      count: 0,
      percentChange: 0
    },
    keywordsCount: {
      count: 0,
      percentChange: 0
    }
  };

  // Compute activity statistics with fallbacks
  const activityStats = useMemo(() => {
    if (!activityData) return defaultStats;

    return {
      totalUsers: activityData.totalUsers ?? defaultStats.totalUsers,
      activeUsers: activityData.activeUsers ?? defaultStats.activeUsers,
      totalMessages: activityData.totalMessages ?? defaultStats.totalMessages,
      totalReactions: activityData.totalReactions ?? defaultStats.totalReactions,
      currentActivities: activityData.currentActivities ?? defaultStats.currentActivities,
      peakActivityTime: activityData.peakActivityTime ?? defaultStats.peakActivityTime,
      totalGameTime: activityData.totalGameTime ?? defaultStats.totalGameTime,
      topKeywords: activityData.topKeywords ?? defaultStats.topKeywords,
      topUsers: activityData.topUsers ?? defaultStats.topUsers,
      hourlyActivity: activityData.hourlyActivity ?? defaultStats.hourlyActivity,
      activeListeners: activityData.activeListeners ?? defaultStats.activeListeners,
      keywordsCount: activityData.keywordsCount ?? defaultStats.keywordsCount,
    };
  }, [activityData]);

  return {
    ...activityStats,
    hourlyActivityData,
    isLoading,
    error,
    timeRange
  };
};
