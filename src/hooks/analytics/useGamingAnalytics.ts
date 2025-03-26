import { useMemo } from 'react';
import { useQueryBuilder } from './common/useQueryBuilder';
import {
  ActiveGame,
  GameReport,
  PopularGame,
  GameStats,
  PaginatedWrapper
} from '@/types/analytics/gamingTypes';

interface PaginatedParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
}

export const useGameDetails = (gameName: string) => {
  const { data: gameStats, isLoading: statsLoading, error: statsError } = useQueryBuilder<GameStats>(
    ['gameStats', gameName],
    (guildId, startDate, endDate) => 
      `/games/${encodeURIComponent(gameName)}/stats?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const { data: gameReport, isLoading: reportLoading, error: reportError } = useQueryBuilder<GameReport>(
    ['gameReport', gameName],
    (guildId, startDate, endDate) => 
      `/games/${encodeURIComponent(gameName)}/report?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
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

export const useGamingStats = (paginationParams?: PaginatedParams) => {
  const { page = 1, limit = 10 } = paginationParams || {};


  const { data: activeGames, isLoading: activeGamesLoading, error: activeGamesError } = useQueryBuilder<PaginatedResponse<ActiveGame[]>>(
    ['activeGames', page, limit], 
    (guildId, startDate, endDate) =>
      `/games?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
  );

  const { data: popularGames, isLoading: popularGamesLoading, error: popularGamesError } = useQueryBuilder<PaginatedResponse<PopularGame[]>>(
    ['popularGames', page, limit],
    (guildId, startDate, endDate) => 
      `/games/popular?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
  );

  const stats = useMemo(() => ({
    activeGames: activeGames?.data || [] as ActiveGame[],
    popularGames: popularGames?.data || [] as PopularGame[],
    pagination: {
      activeGames: {
        total: activeGames?.total || 0,
        page: activeGames?.page || page,
        limit: activeGames?.limit || limit,
      },
      popularGames: {
        total: popularGames?.total || 0,
        page: popularGames?.page || page,
        limit: popularGames?.limit || limit,
      }
    }
  }), [activeGames, popularGames, page, limit]);

  return {
    ...stats,
    isLoading: activeGamesLoading || popularGamesLoading,
    error: activeGamesError || popularGamesError,
  };
};

export const useRolesDistribution = () => {
  const { data: rolesDistribution, isLoading, error } = useQueryBuilder<{
    roleName: string;
    count: number;
    percentage: number;
    color: string;
  }[]>(
    ['rolesDistribution'],
    (guildId) => `/games/roles-distribution?guildId=${guildId}`
  );

  return {
    rolesDistribution: rolesDistribution || [],
    isLoading,
    error
  };
};
