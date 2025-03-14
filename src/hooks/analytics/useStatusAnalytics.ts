import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import { PaginatedStatusListResponse, StatusActivityHeatmapResponse, StatusPageAnalyticsResponse } from '@/types/dataTypes';

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

export const useStatusAnalytics = (
  guildId: string, 
  period: 'day' | 'week' | 'month' | 'year' = 'month',
  page: number = 1,
  pageSize: number = 10
) => {
  const { startDate, endDate } = getTimeRange(period);
  const baseQueryParams = new URLSearchParams({ guildId, startDate, endDate }).toString();
  const paginatedQueryParams = new URLSearchParams({ 
    guildId, 
    startDate, 
    endDate,
    page: page.toString(),
    pageSize: pageSize.toString()
  }).toString();

  const { 
    data: statusAnalytics = {} as StatusPageAnalyticsResponse, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useQuery<StatusPageAnalyticsResponse>(
    ['statusAnalytics', guildId, period],
    () => apiService.getData(`/status-analytics/overview?${baseQueryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { 
    data: activityHeatmap = { heatmap: [] } as StatusActivityHeatmapResponse, 
    isLoading: heatmapLoading, 
    error: heatmapError 
  } = useQuery<StatusActivityHeatmapResponse>(
    ['statusHeatmap', guildId, period],
    () => apiService.getData(`/status-analytics/heatmap?${baseQueryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { 
    data: statusList = { statuses: [], total: 0, page: 1, pageSize: 10 } as PaginatedStatusListResponse, 
    isLoading: statusListLoading, 
    error: statusListError 
  } = useQuery<PaginatedStatusListResponse>(
    ['statusList', guildId, period, page, pageSize],
    () => apiService.getData(`/status-analytics/list?${paginatedQueryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  return {
    statusAnalytics,
    activityHeatmap,
    statusList,
    isLoading: analyticsLoading || heatmapLoading || statusListLoading,
    error: analyticsError || heatmapError || statusListError,
  };
};