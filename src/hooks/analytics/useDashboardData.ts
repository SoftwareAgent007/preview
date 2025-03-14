import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import { DashboardOverviewResponse } from '@/types/dataTypes';

export const useDashboardData = (period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const getPeriodStart = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "day":
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case "week":
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case "year":
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    }
  }, [period]);

  const requestParams = {
    guildId: "323644524268093441",
    startDate: getPeriodStart,
    endDate: new Date().toISOString(),
  };

  const { data: activityData, isLoading, error } = useQuery<DashboardOverviewResponse, Error>(
    ['activity-overview', requestParams.guildId],
    () =>
      apiService.getData(
        `/dashboard/overview?guildId=${requestParams.guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
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
    ['hourly-activity', requestParams.guildId],
    () =>
      apiService.getData(
        `/presence-activity/hourly-activity?guildId=${requestParams.guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
      ),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      onError: (err) => console.error('Error fetching hourly activity:', err),
    }
  );
  
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
    timeRange: {
      startDate: new Date(requestParams.startDate),
      endDate: new Date(requestParams.endDate)
    }
  };
};
