import { PopularTrack, MusicOverviewResponse, GenrePreference, TopArtist, PeakHoursResponse, AverageSessionResponse } from '@/types/music.interface';
import { useQueryBuilder } from './common/useQueryBuilder';

export const usePopularTracks = (limit = 10) => {
  const { data, isLoading, error } = useQueryBuilder<PopularTrack[]>(
    ['popular-tracks', limit],
    (guildId, startDate, endDate) =>
      `/music-metrics/popular-tracks?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}&limit=${limit}`
  );

  return {
    popularTracks: data || [],
    isLoading,
    error
  } as const;
};

export const useOverviewMetrics = () => {
  const { data, isLoading, error } = useQueryBuilder<MusicOverviewResponse>(
    ['overview-metrics'],
    (guildId, startDate, endDate) =>
      `/music-metrics/overview?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    overview: {
      totalPlays: {
        current: data?.totalPlays?.value || 0,
        change: data?.totalPlays?.change,
        isPositive: Boolean(data?.totalPlays?.change > 0)
      },
      uniqueArtists: {
        current: data?.uniqueArtists?.value || 0,
        change: data?.uniqueArtists?.change,
        isPositive: Boolean(data?.uniqueArtists?.change > 0)
      },
      activeListeners: {
        current: data?.activeListeners?.value || 0,
        change: data?.activeListeners?.change,
        isPositive: Boolean(data?.activeListeners?.change > 0)
      },
      dualListenings: {
        current: data?.dualListenings?.value || 0,
        change: data?.dualListenings?.change,
        isPositive: Boolean(data?.dualListenings?.change > 0)
      }
    },
    isLoading,
    error
  } as const;
};

export const useGenrePreferences = () => {
  const { data, isLoading, error } = useQueryBuilder<GenrePreference[]>(
    ['genre-preferences'],
    (guildId, startDate, endDate) =>
      `/music-metrics/genres?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    genres: data || [],
    isLoading,
    error
  } as const;
};

export const useTopArtists = (limit = 5) => {
  const { data, isLoading, error } = useQueryBuilder<TopArtist[]>(
    ['top-artists', limit],
    (guildId, startDate, endDate) =>
      `/music-metrics/top-artists?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}&limit=${limit + 5}`
  );

  const filteredArtists = data
    ?.filter(artist => artist.artist.name) // Filter out artists without names
    ?.slice(0, limit); // Take requested number of artists

  return {
    topArtists: filteredArtists || [],
    isLoading,
    error
  } as const;
};

export const usePeakHours = () => {
  const { data, isLoading, error } = useQueryBuilder<PeakHoursResponse>(
    ['peak-hours'],
    (guildId, startDate, endDate) =>
      `/music-metrics/peak-hours?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    peakHours: {
      hourlyDistribution: data?.hourlyDistribution || []
    },
    isLoading,
    error
  } as const;
};

export const useAverageSession = () => {
  const { data, isLoading, error } = useQueryBuilder<AverageSessionResponse>(
    ['average-session'],
    (guildId, startDate, endDate) =>
      `/music-metrics/average-session?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    avgSession: data ? {
      current: data.formattedDuration,
      change: data.change,
      previous: data.averageMinutes - (data.change || 0),
      isPositive: data.change > 0,
      formattedDuration: data.formattedDuration
    } : null,
    isLoading,
    error
  } as const;
};

export const useMusicData = () => {
  const { overview, isLoading: overviewLoading, error: overviewError } = useOverviewMetrics();
  const { genres, isLoading: genresLoading, error: genresError } = useGenrePreferences();
  const { topArtists, isLoading: artistsLoading, error: artistsError } = useTopArtists();
  const { peakHours, isLoading: peakHoursLoading, error: peakHoursError } = usePeakHours();
  const { avgSession, isLoading: sessionLoading, error: sessionError } = useAverageSession();
  const { popularTracks, isLoading: tracksLoading, error: tracksError } = usePopularTracks(3);

  const isLoading = overviewLoading || genresLoading || artistsLoading || peakHoursLoading || sessionLoading || tracksLoading;
  const error = overviewError || genresError || artistsError || peakHoursError || sessionError || tracksError;

  const hasError = (value: unknown): boolean => !isLoading && !error;

  return {
    overview,
    genres,
    topArtists,
    peakHours,
    avgSession,
    popularTracks,
    hasError,
    isLoading,
    error
  } as const;
};
