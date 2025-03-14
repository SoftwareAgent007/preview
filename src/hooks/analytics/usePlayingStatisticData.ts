import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import { ChartData, DataSet } from '@/components/common/types/userAnalytic.types';

export const usePlayingStatisticData = (
  guildId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'year'
) => {
  const getPeriodStart = useMemo(() => {
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
  }, [period]);

  const requestParams = {
    guildId,
    startDate: getPeriodStart,
    endDate: new Date().toISOString(),
  };

  const {
    data,
    isLoading,
    error,
  } = useQuery<DataSet>(
    ['playingStatistics', guildId, period],
    () =>
      apiService.getData(
        `/playing-statistics?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
      ),
    {
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    }
  );

  const processChartData = (chartData: ChartData) => ({
    ...chartData,
    data: [...chartData.data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`
  });

  const playingUserStats = useMemo(() => {
    if (!data) return {};

    const filteredData: DataSet = {};

    Object.keys(data).forEach((key: string) => {
      const chartData: ChartData = data[key];
      if (chartData && chartData.data) {
        filteredData[key] = processChartData(chartData);
      }
    });

    return filteredData;
  }, [data]);

  return {
    playingUserStats,
    isLoading,
    error,
  };
};
