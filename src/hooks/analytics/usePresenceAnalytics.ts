import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import { ActivityOverviewResponse, DeviceUsage, HourlyActivityResponse, PeakHour, StatusBreakdown } from '@/pages/UsersDetailedActivityAnalytics/PresenceAnalytics/interfaces/presence-activirt.interfaces';

const getTimeRange = (period: 'day' | 'week' | 'month' | 'year') => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
};

export const usePresenceActivity = (guildId: string, period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const { startDate, endDate } = getTimeRange(period);
  const queryParams = new URLSearchParams({ guildId, startDate, endDate }).toString();

  const { data: overview = {} as ActivityOverviewResponse, isLoading: overviewLoading, error: overviewError } = useQuery<ActivityOverviewResponse>(
    ['activityOverview', guildId, period],
    () => apiService.getData(`/presence-activity/overview?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { data: statusBreakdown = [] as StatusBreakdown[], isLoading: statusLoading, error: statusError } = useQuery<StatusBreakdown[]>(
    ['statusBreakdown', guildId, period],
    () => apiService.getData(`/presence-activity/status-breakdown?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { data: hourlyActivity = {} as HourlyActivityResponse, isLoading: hourlyLoading, error: hourlyError } = useQuery<HourlyActivityResponse>(
    ['hourlyActivity', guildId, period],
    () => apiService.getData(`/presence-activity/hourly-activity?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { data: peakHours = [] as PeakHour[], isLoading: peakLoading, error: peakError } = useQuery<PeakHour[]>(
    ['peakHours', guildId, period],
    () => apiService.getData(`/presence-activity/peak-hours?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { data: deviceUsage = [] as DeviceUsage[], isLoading: deviceLoading, error: deviceError } = useQuery<DeviceUsage[]>(
    ['deviceUsage', guildId, period],
    () => apiService.getData(`/presence-activity/device-usage?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  return {
    overview,
    statusBreakdown,
    hourlyActivity,
    peakHours,
    deviceUsage,
    isLoading: overviewLoading || statusLoading || hourlyLoading || peakLoading || deviceLoading,
    error: overviewError || statusError || hourlyError || peakError || deviceError,
  };
};

