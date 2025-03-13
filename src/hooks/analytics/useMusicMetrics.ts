import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import { MusicDashboardResponse, TimeRange } from '@/types/music.interface';

export const useMusicData = (
  guildId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'month'
) => {
  const timeRange: TimeRange = useMemo(() => {
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

    return { startDate, endDate };
  }, [period]);

  console.log('MusicDashboardResponse')
  const { data: musicData, isLoading, error } = useQuery<MusicDashboardResponse>(
    ['music-dashboard', guildId, period],
    () =>
      apiService.getData(
        `/music-metrics/dashboard?guildId=${guildId}&startDate=${timeRange.startDate.toISOString()}&endDate=${timeRange.endDate.toISOString()}`
      ),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      onError: (err) => console.error('Error fetching music data:', err),
    }
  );

  const defaultMusicStats = {
    overview: {
      totalPlays: { value: 0, change: 0 },
      activeListeners: { value: 0, change: 0 },
      uniqueArtists: { value: 0, change: 0 },
      dualListenings: { value: 0, change: 0 },
    },
    genres: [],
    topArtists: [],
    peakHours: { hourlyDistribution: [], peakHour: 0, totalListens: 0 },
    avgSession: { averageMinutes: 0, formattedDuration: '0m', change: 0 },
    popularTracks: [],
  };

  const musicStats = useMemo(() => {
    if (!musicData) return defaultMusicStats;

    return {
      overview: musicData.overview ?? defaultMusicStats.overview,
      genres: musicData.genres ?? defaultMusicStats.genres,
      topArtists: musicData.topArtists ?? defaultMusicStats.topArtists,
      peakHours: musicData.peakHours ?? defaultMusicStats.peakHours,
      avgSession: musicData.avgSession ?? defaultMusicStats.avgSession,
      popularTracks: musicData.popularTracks ?? defaultMusicStats.popularTracks,
    };
  }, [musicData]);

  return {
    ...musicStats,
    isLoading,
    error,
    timeRange,
  };
};
