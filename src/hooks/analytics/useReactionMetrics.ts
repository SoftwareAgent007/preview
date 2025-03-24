import { useQuery } from 'react-query';
import { apiService } from '../apiService';

type HistogramDataDto = {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
};

export const useReactionMetrics = (
  guildId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'year',
  page: number = 1,
  pageSize: number = 50,
  specificDate?: string
) => {
  const getPeriodStart = (): string => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'year':
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    }
  };

  const requestParams = {
    guildId,
    startDate: getPeriodStart(),
    endDate: new Date().toISOString(),
    page,
    limit: pageSize,
  };

  const { data: histogramData, isLoading: histogramLoading, error: histogramError } = useQuery<HistogramDataDto[]>(
    ['reactions-histogram', guildId, period, page, pageSize],
    () =>
      apiService.getData(
        `/reactions/histogram?guildId=${requestParams.guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}&page=${requestParams.page}&limit=${requestParams.limit}`
      ),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      enabled: !!guildId,
      onError: (err) => console.error('Error fetching histogram data:', err),
    }
  );

  const { data: dateData, isLoading: dateLoading, error: dateError } = useQuery<HistogramDataDto>(
    ['reactions-by-date', specificDate],
    () =>
      apiService.getData(
        `/reactions/by-date?date=${specificDate}`
      ),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      enabled: !!specificDate,
      onError: (err) => console.error('Error fetching date data:', err),
    }
  );

  const defaultHistogramData: HistogramDataDto[] = [];
  const defaultDateData: HistogramDataDto = {} as HistogramDataDto;

  return {
    histogramData: histogramData ?? defaultHistogramData,
    dateData: dateData ?? defaultDateData,
    isLoading: histogramLoading || dateLoading,
    error: histogramError || dateError,
    requestParams,
  };
};