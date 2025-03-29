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
interface PeakHour {
  hour: number;
  playerCount: number;
}

interface BasicStats {
  totalPlayers: number;
  totalHours: number;
  avgSessionMinutes: number;
  peakPartySize: number;
  returnRate: number;
  peakHours: PeakHour[];
}

interface PlaytimeDistribution {
  rangeLabel: string;
  userCount: number;
  percentage: number;
}

interface TopGamer {
  userId: string;
  hoursPlayed: number;
  sessionCount: number;
}

interface WeeklyTrend {
  weekStartDate: string;
  totalUsers: number;
  totalHours: number;
  avgSessionMinutes: number;
}

interface TimeOfDayBreakdown {
  timeBlock: string;
  userCount: number;
  percentOfTotal: number;
}

interface PeakConcurrentUsers {
  date: string;
  hour: number;
  userCount: number;
}

interface GameStatsResponse {
  basicStats: BasicStats;
  playtimeDistribution: PlaytimeDistribution[];
  topGamers: TopGamer[];
  weeklyTrends: WeeklyTrend[];
  timeOfDayBreakdown: TimeOfDayBreakdown[];
  peakConcurrentUsers: PeakConcurrentUsers;
}

export const useGameDetails = (gameName: string) => {
  const { data: gameReport, isLoading: reportLoading, error: reportError } = useQueryBuilder<GameStatsResponse>(
    ['gameReport', gameName],
    (guildId, startDate, endDate) => 
      `/games/${encodeURIComponent(gameName)}/report?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    gameReport,
    isLoading: reportLoading,
    error: reportError,
  };
};

export const useGamingStats = (paginationParams?: PaginatedParams) => {
  const { page = 1, limit = 10 } = paginationParams || {};

  const { data: popularGames, isLoading: popularGamesLoading, error: popularGamesError } = useQueryBuilder<PaginatedResponse<PopularGame[]>>(
    ['popularGames', page, limit],
    (guildId, startDate, endDate) => 
      `/games/popular?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
  );

  const stats = useMemo(() => ({
    popularGames: popularGames?.data || [] as PopularGame[],
    pagination: {
      popularGames: {
        total: popularGames?.total || 0,
        page: popularGames?.page || page,
        limit: popularGames?.limit || limit,
      }
    }
  }), [popularGames, page, limit]);

  return {
    ...stats,
    isLoading: stats.pagination && popularGamesLoading,
    error: popularGamesError,
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
