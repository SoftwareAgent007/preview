import {
  ActivityOverviewResponse,
  DeviceUsage,
  HourlyActivityResponse,
  PeakHour,
  StatusBreakdown
} from '@/types/analytics/presenceTypes';
import { useMemo } from 'react';
import { useQueryBuilder } from './common/useQueryBuilder';

interface RoleDistribution {
  labels: string[];
  data: number[];
  colors: string[];
  totalUsers: number;
}

interface TimeRange {
  startDate: string;
  endDate: string;
}

const formatHours = (hours: number): string => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  return `${hours}h`;
};

const useTimeRange = (period: 'day' | 'week' | 'month' | 'year' = 'week') => {
  return useMemo<TimeRange>(() => {
    const now = new Date();
    let startDate: Date;
    
    switch(period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    return {
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString()
    };
  }, [period]);
};

export function useActivityOverview(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const timeRange = useTimeRange(period);
  return useQueryBuilder<ActivityOverviewResponse>(
    ['activityOverview', timeRange],
    (guildId) => `/presence-activity/overview?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );
}

export function useStatusBreakdown(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const timeRange = useTimeRange(period);
  return useQueryBuilder<StatusBreakdown[]>(
    ['statusBreakdown', timeRange],
    (guildId) => `/presence-activity/status-breakdown?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`,
    {
      select: (data) => data.map(item => ({
        ...item,
        color: item.status === 'online' ? '#10b981' : // Green
               item.status === 'idle' ? '#f59e0b' :   // Amber
               item.status === 'dnd' ? '#ef4444' :    // Red
               '#6b7280'                              // Gray for offline
      }))
    }
  );
}

export function useHourlyActivity(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const timeRange = useTimeRange(period);
  return useQueryBuilder<HourlyActivityResponse>(
    ['hourlyActivity', timeRange],
    (guildId) => `/presence-activity/hourly-activity?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );
}

export function usePeakHours(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const timeRange = useTimeRange(period);
  return useQueryBuilder<PeakHour[]>(
    ['peakHours', timeRange],
    (guildId) => `/presence-activity/peak-hours?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );
}

export function useDeviceUsage(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const timeRange = useTimeRange(period);
  return useQueryBuilder<DeviceUsage[]>(
    ['deviceUsage', timeRange],
    (guildId) => `/presence-activity/device-usage?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );
}

export function useRoleDistribution(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const timeRange = useTimeRange(period);
  return useQueryBuilder<RoleDistribution>(
    ['roleDistribution', timeRange],
    (guildId) => `/presence-activity/role-distribution?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );
}
