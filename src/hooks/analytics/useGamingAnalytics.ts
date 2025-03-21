import { useMemo } from 'react';
import { useQueryBuilder } from './common/useQueryBuilder';
import {
  ActiveGame,
  GameReport,
  PopularGame,
  GameStats
} from '@/types/analytics/gamingTypes';

export const useGameDetails = (gameName: string) => {
  const { data: gameStats, isLoading: statsLoading, error: statsError } = useQueryBuilder<GameStats>(
    ['gameStats', gameName],
    (guildId, startDate, endDate) => `/games/${gameName}/stats?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const { data: gameReport, isLoading: reportLoading, error: reportError } = useQueryBuilder<GameReport>(
    ['gameReport', gameName],
    (guildId, startDate, endDate) => `/games/${gameName}/report?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const stats = useMemo(() => ({
    gameStats: gameStats || {} as GameStats,
    gameReport: gameReport || {} as GameReport,
  }), [gameStats, gameReport]);

  return {
    ...stats,
    isLoading: statsLoading || reportLoading,
    error: statsError || reportError,
  };
};

export const useGamingStats = () => {
  const { data: activeGames, isLoading: activeGamesLoading, error: activeGamesError } = useQueryBuilder<ActiveGame[]>(
    ['activeGames'],
    (guildId, startDate, endDate) => `/games?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const { data: popularGames, isLoading: popularGamesLoading, error: popularGamesError } = useQueryBuilder<PopularGame[]>(
    ['popularGames'],
    (guildId, startDate, endDate) => `/games/popular?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const stats = useMemo(() => ({
    activeGames: activeGames || [] as ActiveGame[],
    popularGames: popularGames || [] as PopularGame[],
  }), [activeGames, popularGames]);

  return {
    ...stats,
    isLoading: activeGamesLoading || popularGamesLoading,
    error: activeGamesError || popularGamesError,
  };
};
