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
  medianSessionMinutes: number;
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
  medianSessionMinutes: number;
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

interface AggregateStats {
  totalGamingHours: number;
  totalGamingHoursChange: number;
  avgSessionMinutes: number;
  avgSessionMinutesChange: number;
  peakConcurrentPlayers: number;
  peakConcurrentPlayersChange: number;
  uniqueGamers: number;
  topGames: {
    gameName: string;
    hours: number;
    percentage: number;
  }[];
}

export const useGameDetails = (gameName: string) => {

  const { data: gameReport, isLoading: reportLoading, error: reportError } = useQueryBuilder<BasicStats>(
    ['gameReport', gameName],
    (guildId, startDate, endDate) => 
      `/games/${encodeURIComponent(gameName)}/basic-stats?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    gameReport,
    isLoading: reportLoading,
    error: reportError,
  };
};

export const useGamingStats = (paginationParams?: PaginatedParams) => {
  const { page = 1, limit = 10 } = paginationParams || {};

  const { data: popularGames = { data: [], total: 0, page, limit }, isLoading: popularGamesLoading, error: popularGamesError } = useQueryBuilder<PaginatedResponse<PopularGame[]>>(
    ['popularGames', page, limit],
    (guildId, startDate, endDate) => 
      `/games/popular?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
  );

  const { data: currentlyPlayedGames = [], isLoading: currentlyPlayedGamesLoading, error: currentlyPlayedGamesError } = useQueryBuilder<{gameName: string; playerCount: number; percentage: number}[]>(
    ['currently-played-games'],
    (guildId) => `/games/currently-played?guildId=${guildId}`
  );

  const stats = useMemo(() => ({
    currentlyPlayedGames,
    popularGames: popularGames.data,
    pagination: {
      currentlyPlayedGames: {
        total: currentlyPlayedGames.length,
        page,
        limit,
      },
      popularGames: {
        total: popularGames.total,
        page: popularGames.page,
        limit: popularGames.limit,
      }
    }
  }), [currentlyPlayedGames, popularGames, page, limit]);

  return {
    ...stats,
    isLoading: stats.pagination && (currentlyPlayedGamesLoading || popularGamesLoading),
    error: currentlyPlayedGamesError || popularGamesError,
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

export const useAggregateStats = () => {
  const { data: aggregateStats, isLoading, error } = useQueryBuilder<AggregateStats>(
    ['aggregateStats'],
    (guildId, startDate, endDate) => {
      const formattedStartDate = new Date(startDate).toISOString().split('T')[0] + 'T00:00:00.000Z';
      const formattedEndDate = new Date(endDate).toISOString().split('T')[0] + 'T23:59:59.999Z';
      return `/games/aggregate-stats?guildId=${guildId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
    }
  );

  return {
    aggregateStats,
    isLoading,
    error
  };
};
