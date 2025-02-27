import { useMemo } from 'react';
import { usePlayingStatisticGraphData } from '../fetchData';
import { ChartData, DataSet } from '@/components/common/types/userAnalytic.types';

export const usePlayingStatisticData = (period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const data = usePlayingStatisticGraphData();

  const getPeriodStart = useMemo(() => {
    const now = new Date();
    const year = new Date(now.setFullYear(now.getFullYear() - 1));
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return year;
    }
  }, [period]);

  // Function to filter and sort ChartData by date
  const processChartData = (chartData: ChartData) => ({
    ...chartData,
    data: [...chartData.data]
      .filter(({ date }) => new Date(date) >= getPeriodStart)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Set random color
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
  }, [data, getPeriodStart]);

  return {
    playingUserStats,
  };
};
