import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import { ActiveGame, GameReport, PopularGame, GameStats } from '@/types/dataTypes';

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

export const useGameDetails = (guildId: string, gameName: string, period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const { startDate, endDate } = getTimeRange(period);

  const queryParams = new URLSearchParams({ guildId, startDate, endDate }).toString();

  const { data: gameStats, isLoading: statsLoading, error: statsError } = useQuery<GameStats>(
    ['gameStats', guildId, gameName, period],
    () => apiService.getData(`/games/${gameName}/stats?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { data: gameReport, isLoading: reportLoading, error: reportError } = useQuery<GameReport>(
    ['gameReport', guildId, gameName, period],
    () => apiService.getData(`/games/${gameName}/report?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  return {
    gameStats,
    gameReport,
    isLoading: statsLoading || reportLoading,
    error: statsError || reportError,
  };
};

export const useGamingStats = (guildId: string, period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const { startDate, endDate } = getTimeRange(period);
  
  const queryParams = new URLSearchParams({ guildId, startDate, endDate }).toString();

  const { data: activeGames, isLoading: activeGamesLoading, error: activeGamesError } = useQuery<ActiveGame[]>(
    ['activeGames', guildId, period],
    () => apiService.getData(`/games?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  const { data: popularGames, isLoading: popularGamesLoading, error: popularGamesError } = useQuery<PopularGame[]>(
    ['popularGames', guildId, period],
    () => apiService.getData(`/games/popular?${queryParams}`),
    { staleTime: 1000 * 60 * 30, cacheTime: 1000 * 60 * 30, retry: 1 }
  );

  return {
    activeGames,
    popularGames,
    isLoading: activeGamesLoading || popularGamesLoading,
    error: activeGamesError || popularGamesError,
  };
};
