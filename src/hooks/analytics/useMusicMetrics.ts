import { useMemo } from 'react';
import { MusicDashboardResponse } from '@/types/music.interface';
import { useQueryBuilder } from './common/useQueryBuilder';

export const useMusicData = () => {
  const {
    data: musicData,
    isLoading,
    error,
  } = useQueryBuilder<MusicDashboardResponse>(
    ['music-dashboard'],
    (guildId, startDate, endDate) =>
      `/music-metrics/dashboard?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const hasError = (value: unknown): boolean => !isLoading && !error;

  const musicStats = useMemo(() => ({
    overview: {
      totalPlays: {
        current: musicData?.overview?.totalPlays?.value || 0,
        previous: 0,
        isPositive: musicData?.overview?.totalPlays?.change > 0
      },
      uniqueArtists: {
        current: musicData?.overview?.uniqueArtists?.value || 0,
        previous: 0,
        isPositive: musicData?.overview?.uniqueArtists?.change > 0
      },
      activeListeners: {
        current: musicData?.overview?.activeListeners?.value || 0,
        previous: 0,
        isPositive: musicData?.overview?.activeListeners?.change > 0
      },
    },
    genres: musicData?.genres || [],
    topArtists: musicData?.topArtists || [],
    peakHours: {
      hourlyDistribution: musicData?.peakHours.hourlyDistribution || [],
    },
    avgSession: musicData?.avgSession ? {
      current: musicData.avgSession.formattedDuration,
      change: musicData.avgSession.change,
      previous: musicData.avgSession.averageMinutes - (musicData.avgSession.change || 0),
      isPositive: musicData.avgSession.change > 0,
      formattedDuration: musicData.avgSession.formattedDuration
    } : null,
    popularTracks: musicData?.popularTracks || [],
    hasError,
  }), [musicData, isLoading]);

  return {
    ...musicStats, 
    isLoading,
    error,
  } as const;
};
