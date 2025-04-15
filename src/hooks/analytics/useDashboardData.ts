import { useMemo } from 'react';
import { useQueryBuilder } from './common/useQueryBuilder';

export enum TimeViewType {
  DAY = 'day',
  WEEK = 'week', 
  MONTH = 'month',
  YEAR = 'year'
}

interface MessageOverview {
  totalMessages: number;
  peakDay: {
    date: string;
    count: number;
  } | null;
  averageMessagesPerDay: number;
}

interface MessageTrend {
  data: {
    date: string;
    messageCount: number;
  }[];
}

export function useMessageMetrics() {
  const { data: overview, isLoading: overviewLoading } = useQueryBuilder<MessageOverview>(
    ['message-match-overview'],
    (guildId, startDate, endDate) => `/message-match/overview?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const { data: totalMessages } = useQueryBuilder<{totalMessages: number}>(
    ['message-match-total'],
    (guildId, startDate, endDate) => `/message-match/total?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const { data: uniqueAuthors } = useQueryBuilder<{uniqueAuthors: number}>(
    ['message-match-authors'],
    (guildId, startDate, endDate) => `/message-match/unique-authors?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    overview,
    totalMessages: totalMessages?.totalMessages,
    uniqueAuthors: uniqueAuthors?.uniqueAuthors,
    isLoading: overviewLoading
  };
}

export function useMessageTrend(viewType: TimeViewType, limit?: number) {
  const { data, isLoading } = useQueryBuilder<MessageTrend>(
    ['message-match-trend', viewType, limit],
    (guildId, startDate, endDate) => 
      `/message-match/message-trend?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}&viewType=${viewType}${limit ? `&limit=${limit}` : ''}`
  );

  return {
    trend: data?.data || [],
    isLoading
  };
}

interface UsersOverview {
  totalUsers: {
    count: number;
    label: string;
    percentChange: number;
    newUsersCount: number;
    departedUsersCount: number;
    netChange: number;
  };
  activeUsers: {
    today: {
      count: number;
      percentChange: number;
    };
    pastWeek: {
      count: number;
      percentChange: number;  
    };
    pastMonth: {
      count: number;
      percentChange: number;
    };
  };
}

interface MessagesOverview {
  totalMessages: {
    count: number;
    totalCount?: number;
    label: string;
    percentChange: number;
  };
  totalReactions: {
    count: number;
    percentChange: number;
  };
}

interface KeywordsOverview {
  totalKeywords: number;
  activeKeywords: number;
  totalMatches: number;
  keywordsList: {
    id: string;
    keyword: string;
    matches: {
      count: number;
    };
    createdAt: Record<string, unknown>;
    active: boolean;
    guildId: string;
  }[];
  matchesTimeline: {
    date: string;
    count: number;
  }[];
  activeKeywordTags: string[];
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

interface ActivityOverview {
  currentActivities: {
    activeGamers: {
      count: number;
      label: string;
    };
    spotifyListeners: {
      count: number;
      label: string;
    };
  };
  hourlyActivity: {
    hourlyDistribution: any[];
    statusDistribution: {
      online: number;
      offline: number;
      idle: number;
      dnd: number;
    };
    peakHour: number;
    peakHourChange: {
      hour: number;
      change: number;
    };
  };
}

interface GamingOverview {
  totalGameTime: {
    hours: number;
    hourChange: string;
  };
}

interface ActiveUsersOverview {
  activeListeners: {
    count: number;
    percentChange: number;
  };
  activeGamers: {
    count: number;
    percentChange: number;
  };
}

interface TopContributorsOverview {
  topUsers: {
    username: string;
    messages: number;
  }[];
}

interface CurrentlyPlayedGame {
  gameName: string;
  playerCount: number;
  percentage: number;
}

export interface ActivityTrendData {
  data: {
    date: string;
    activeUsers: number;
  }[];
}

export function useActivityTrend(activityType: 'user' | 'spotify' | 'gaming' | 'device', viewType: 'daily' | 'weekly' | 'monthly' | 'yearly', deviceType?: string) {
  const { data, isLoading } = useQueryBuilder<ActivityTrendData>(
    ['presence-activity-trend', activityType, viewType, deviceType],
    (guildId) => `/presence-activity/active-users-trend?guildId=${guildId}&activityType=${activityType}&viewType=${viewType}${deviceType ? `&deviceType=${deviceType}` : ''}`
  );
  return { data, isLoading };
}
export function useActivityData(date: Date) {
  const startDate = new Date(date);
  startDate.setUTCHours(0, 0, 0, 0); // Ensure startDate is set to the start of the day in UTC
  const endDate = new Date(date);
  endDate.setUTCHours(23, 59, 59, 999); // Local end of the day


  const { data, isLoading, error } = useQueryBuilder<ActivityOverview>(
    ['dashboard-activity', startDate, endDate],
    (guildId) => `/dashboard/activity?guildId=${guildId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );

  return {
    hourlyActivity: data?.hourlyActivity,
    currentActivities: data?.currentActivities,
    isLoading,
    error
  };
}

export function useDashboardData() {
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQueryBuilder<UsersOverview>(
    ['dashboard-users'],
    (guildId, startDate, endDate) => `/dashboard/users?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const {
    data: messagesData,
  } = useQueryBuilder<MessagesOverview>(
    ['dashboard-messages'],
    (guildId, startDate, endDate) => `/dashboard/messages?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const {
    data: keywordsData,
  } = useQueryBuilder<KeywordsOverview>(
    ['dashboard-keywords'],
    (guildId) => `/keywords/analytics?guildId=${guildId}&limit=${3}&page=${1}`
  );

  const {
    data: gamingData,
  } = useQueryBuilder<GamingOverview>(
    ['dashboard-gaming'],
    (guildId, startDate, endDate) => `/dashboard/gaming?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const {
    data: activeUsersData,
  } = useQueryBuilder<ActiveUsersOverview>(
    ['dashboard-active-users'],
    (guildId, startDate, endDate) => `/dashboard/active-users?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const {
    data: contributorsData,
  } = useQueryBuilder<TopContributorsOverview>(
    ['dashboard-contributors'],
    (guildId, startDate, endDate) => `/dashboard/contributors?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  const { data: activeUsersTrend } = useActivityTrend('user', 'daily');

  const { data: currentlyPlayedGames } = useQueryBuilder<{gameName: string; playerCount: number; percentage: number}[]>(
    ['currently-played-games'],
    (guildId) => `/games/currently-played?guildId=${guildId}`
  );

  const dashboardData = useMemo(() => ({
    totalUsers: usersData?.totalUsers,
    activeUsers: usersData?.activeUsers,
    totalMessages: messagesData?.totalMessages,
    totalReactions: messagesData?.totalReactions,
    topKeywords: keywordsData?.keywordsList,
    topUsers: contributorsData?.topUsers,
    totalGameTime: gamingData?.totalGameTime,
    activeListeners: activeUsersData?.activeListeners,
    activeGamers: activeUsersData?.activeGamers,
    activeUsersTrend: activeUsersTrend?.data,
    currentlyPlayedGames: currentlyPlayedGames || []
  }), [
    usersData,
    messagesData,
    keywordsData,
    gamingData,
    activeUsersData,
    contributorsData,
    activeUsersTrend,
    currentlyPlayedGames
  ]);

  return {
    ...dashboardData,
    isLoading: isUsersLoading,
    error: usersError,
  };
}
