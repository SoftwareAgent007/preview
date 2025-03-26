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

const formatDuration = (hours?: number, minutes?: number): string => {
  if (hours === undefined && minutes === undefined) return 'N/A';
  if (hours === 0 && minutes === 0) return '0m';
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return formatHours(hours || 0);
  return `${formatHours(hours || 0)} ${minutes}m`;
};

export function usePresenceActivity(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  // Calculate time range based on period
  const timeRange = useMemo<TimeRange>(() => {
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

  // Activity Overview
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError
  } = useQueryBuilder<ActivityOverviewResponse>(
    ['activityOverview', timeRange],
    (guildId) => `/presence-activity/overview?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );

  // Status Breakdown
  const {
    data: statusBreakdown,
    isLoading: statusLoading,
    error: statusError
  } = useQueryBuilder<StatusBreakdown[]>(
    ['statusBreakdown', timeRange],
    (guildId) => `/presence-activity/status-breakdown?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );

  // Hourly Activity
  const {
    data: hourlyActivity,
    isLoading: hourlyLoading,
    error: hourlyError
  } = useQueryBuilder<HourlyActivityResponse>(
    ['hourlyActivity', timeRange],
    (guildId) => `/presence-activity/hourly-activity?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );

  // Peak Hours
  const {
    data: peakHours,
    isLoading: peakLoading,
    error: peakError
  } = useQueryBuilder<PeakHour[]>(
    ['peakHours', timeRange],
    (guildId) => `/presence-activity/peak-hours?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );

  // Device Usage
  const {
    data: deviceUsage,
    isLoading: deviceLoading,
    error: deviceError
  } = useQueryBuilder<DeviceUsage[]>(
    ['deviceUsage', timeRange],
    (guildId) => `/presence-activity/device-usage?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );

  // Role Distribution
  const {
    data: roleDistribution,
    isLoading: roleLoading,
    error: roleError
  } = useQueryBuilder<RoleDistribution>(
    ['roleDistribution', timeRange],
    (guildId) => `/presence-activity/role-distribution?guildId=${guildId}&startDate=${timeRange.startDate}&endDate=${timeRange.endDate}`
  );

  return {
    overview: overview || {} as ActivityOverviewResponse,
    statusBreakdown: statusBreakdown || [] as StatusBreakdown[],
    hourlyActivity: hourlyActivity || {} as HourlyActivityResponse,
    peakHours: peakHours || [] as PeakHour[],
    deviceUsage: deviceUsage || [] as DeviceUsage[],
    roleDistribution: roleDistribution || {} as RoleDistribution,
    isLoading: overviewLoading || statusLoading || hourlyLoading || peakLoading || deviceLoading || roleLoading,
    error: overviewError || statusError || hourlyError || peakError || deviceError || roleError
  };
}
