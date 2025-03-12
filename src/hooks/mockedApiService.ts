import { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import { ActiveRolesData, ActivityData, ActivityOverview, ActivityStatusData, DataSet, PeakActivityTime, TrendData } from '@/components/common/types/userAnalytic.types';

// TODO: later implement here reusable fetch requests and add usage in hooks



export const generateRandomData = {
  bigInt: () => BigInt(faker.string.numeric(15)), 
  string: (length = 10) => faker.string.alphanumeric(length),
  date: () => faker.date.past(),
  boolean: () => faker.datatype.boolean(),
  array: (generator: () => any, length = 3) => 
    Array.from({ length }, () => generator()),
  
  user: () => ({
    id: generateRandomData.bigInt(),
    username: faker.internet.userName(),
    geoLocation: faker.location.country(),
    firstSeenAt: generateRandomData.date(),
    lastActiveAt: generateRandomData.date(),
  }),

  keyword: () => ({
    id: generateRandomData.bigInt(),
    keyword: faker.word.noun(),
    createdAt: generateRandomData.date(),
    active: generateRandomData.boolean(),
    matches: { count: faker.number.int({ min: 1, max: 60 }) },
    guildId: generateRandomData.bigInt(),
  }),

  messageMatch: () => ({
    id: generateRandomData.bigInt(),
    messageId: generateRandomData.bigInt(),
    channelId: generateRandomData.bigInt(),
    guildId: generateRandomData.bigInt(),
    authorId: generateRandomData.bigInt(),
    keywordId: generateRandomData.bigInt(),
    preContext: faker.lorem.sentence(),
    postContext: faker.lorem.sentence(),
    matchedAt: generateRandomData.date(),
  }),

  reaction: () => ({
    id: generateRandomData.bigInt(),
    messageId: generateRandomData.bigInt(),
    guildId: generateRandomData.bigInt(),
    channelId: generateRandomData.bigInt(),
    userId: generateRandomData.bigInt(),
    emojiName: faker.internet.emoji(),
    emojiId: generateRandomData.bigInt(),
    addedAt: generateRandomData.date(),
    removedAt: generateRandomData.date(),
  }),

  presence: () => ({
    id: generateRandomData.bigInt(),
    userId: faker.string.uuid(),
    guildId: faker.string.uuid(),
    timestamp: generateRandomData.date(),
    status: faker.helpers.arrayElement(['online', 'offline', 'idle', 'dnd']),
  }),

  activity: () => {
    const sessionStart = generateRandomData.date();
    const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000); 
    return {
      id: generateRandomData.bigInt(),
      presenceId: generateRandomData.bigInt(),
      type: faker.helpers.arrayElement(['spotify', 'gaming', 'other']),
      sessionStart,
      sessionEnd,
      duration: 60 * 60 * 1000, 
      name: faker.commerce.productName(),
      state: faker.lorem.word(),
      details: faker.lorem.sentence(),
    };
  },

  spotifyActivity: () => ({
    id: generateRandomData.bigInt(),
    activityId: generateRandomData.bigInt(),
    songName: faker.music.songName(),
    artist: faker.person.fullName(),
    album: faker.music.genre(),
    trackId: faker.string.uuid(),
    albumCoverUrl: faker.image.url(),
    genres: generateRandomData.array(() => faker.music.genre()),
  }),

  gamingActivity: () => ({
    id: generateRandomData.bigInt(),
    activityId: generateRandomData.bigInt(),
    gameName: faker.commerce.productName(),
    isCompetitive: generateRandomData.boolean(),
    partySize: faker.number.int({ min: 1, max: 100 }), 
    partyMaxSize: faker.number.int({ min: 100, max: 1000 }), 
    platformId: faker.string.uuid(),
  }),

  generateGamingAnalyticsResponse: (startDate?: Date, endDate?: Date) => {
    const randomDate = faker.date.past();
    const date = startDate && randomDate < startDate ? startDate : (endDate && randomDate > endDate ? endDate : randomDate);
    
    const response = {
      activeUsers: faker.number.int({ min: 50, max: 5000 }),
      avgSessionTime: `${faker.number.int({ min: 10, max: 120 })}m`,
      peakPlayers: faker.number.int({ min: 100, max: 10000 }),
      totalGameTime: faker.number.int({ min: 1000, max: 1000000 }),
      userActivityTimeline: generateRandomData.array(
        () => ({
          date: date.toISOString().split("T")[0],
          count: faker.number.int({ min: 1, max: 1000 }),
        }),
        faker.number.int({ min: 10, max: 30 })
      ),
      activeRolesPlayingNow: generateRandomData.array(
        () => ({
          role: faker.helpers.arrayElement(['owner', 'admin', 'user', 'moderator']),
          count: faker.number.int({ min: 1, max: 500 }),
          percentage: (Math.random() * 100).toFixed(1),
          color: faker.color.rgb(),
        }),
        4
      ),
      topGames: generateRandomData.array(
        () => ({
          game: faker.commerce.productName(),
          hoursPlayed: faker.number.int({ min: 1, max: 500 }),
        }),
        faker.number.int({ min: 5, max: 15 })
      ),
    };

    console.log('Generated Gaming Analytics Response:', response);
    return response;
  },

  generatePresenceAnalyticsResponse: (startDate?: Date, endDate?: Date) => {
    const randomDate = faker.date.past();
    const date = startDate && randomDate < startDate ? startDate : (endDate && randomDate > endDate ? endDate : randomDate);
    
    return {
      activeUsers: faker.number.int({ min: 50, max: 5000 }),
      avgSessionTime: `${faker.number.int({ min: 10, max: 120 })}m`,
      peakUsers: faker.number.int({ min: 100, max: 10000 }),
      totalPresenceTime: faker.number.int({ min: 1000, max: 1000000 }),
      userActivityTimeline: Array.from({ length: faker.number.int({ min: 10, max: 30 }) }, () => ({
        date: date.toISOString().split("T")[0],
        count: faker.number.int({ min: 1, max: 1000 }),
      })),
      activeRolesNow: ['Online', 'Offline', 'Idle', 'DND'].map(role => ({
        role,
        count: faker.number.int({ min: 1, max: 500 }),
        percentage: (Math.random() * 100).toFixed(1),
        color: faker.helpers.arrayElement(['#33FF57', '#FF5733', '#FF33A8', '#3357FF']),
      })),
      topActivities: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () => ({
        activity: faker.commerce.productName(),
        hoursSpent: faker.number.int({ min: 1, max: 500 }),
      })),
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.max(0, Math.round(100 + (Math.sin((i / 24) * Math.PI) * 100) + faker.number.int({ min: -20, max: 20 }))),
      })),
      statusCounts: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        statusCounts: {
          Online: faker.number.int({ min: 0, max: 500 }),
          Offline: faker.number.int({ min: 0, max: 500 }),
          Idle: faker.number.int({ min: 0, max: 500 }),
          DND: faker.number.int({ min: 0, max: 500 }),  
        },
      })),
    };
  },

  generateStatusPageAnalyticsResponse(): {
    totalUniqueStatuses: number;
    avgStatusDuration: string;
    peakActivityTime: string;
    updateFrequency: string;
    statusDurationTimeline: Array<{
      date: string;
      count: number;
    }>;
    topStatusMessages: Array<{
      status: string;
      usedBy: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
  } {
    return {
      totalUniqueStatuses: faker.number.int({ min: 10, max: 500 }),
      avgStatusDuration: `${faker.number.int({ min: 1, max: 48 })}h`,
      peakActivityTime: `${faker.number.int({ min: 0, max: 23 })}:00`,
      updateFrequency: `${faker.number.int({ min: 1, max: 60 })}m`,
      statusDurationTimeline: generateRandomData.array(
        () => ({
          date: faker.date.past().toISOString().split('T')[0],
          count: faker.number.int({ min: 1, max: 100 }),
        }),
        faker.number.int({ min: 5, max: 20 })
      ),
      topStatusMessages: generateRandomData.array(
        () => ({
          status: faker.helpers.arrayElement(['Gaming Time', 'AFK', 'Voice', 'Studying', 'Chatting']),
          usedBy: faker.number.int({ min: 1, max: 1000 }),
          trend: faker.helpers.arrayElement(['increasing', 'decreasing', 'stable']),
        }),
        faker.number.int({ min: 3, max: 10 })
      ),
    };
  },

  generateStatusData() {
    return generateRandomData.array(() => ({
      status: faker.lorem.words(3),
      usedBy: faker.number.int({ min: 1, max: 1000 }),
      trend: faker.helpers.arrayElement(['increasing', 'decreasing', 'stable']),
    }), faker.number.int({ min: 20, max: 40 }));
  },
  
  generateMockActivityData(weeks: number) {
    const startDate = new Date();
    const mockData: ActivityStatusData[] = [];
  
    for (let i = 0; i < weeks; i++) {
      const weekData: ActivityStatusData = {};
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() - (i * 7));
  
      for (let j = 0; j < 7; j++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + j);
        const dayName = day.toLocaleString('default', { weekday: 'long' });
        const dateString = day.toISOString().split('T')[0]; 
        weekData[dayName] = { value: Math.floor(Math.random() * 500), date: dateString }; 
      }
      mockData.push(weekData);
    }
    return mockData;
  },
  
  otherActivity: () => ({
    id: generateRandomData.bigInt(),
    activityId: generateRandomData.bigInt(),
    activityType: faker.number.int({ min: 1, max: 10000 }), 
    url: faker.internet.url(),
    applicationId: faker.string.uuid(),
    emoji: faker.internet.emoji(),
  }),

  artist: () => ({
    id: generateRandomData.bigInt(),
    name: faker.person.fullName(),
    spotifyId: faker.string.uuid(),
    genres: generateRandomData.array(() => faker.music.genre()),
    createdAt: generateRandomData.date(),
    updatedAt: generateRandomData.date(),
  }),
  
  generateStatusActivityHeatmapResponse() {
    return {
      heatmap: generateRandomData.array(
        () => ({
          weekDay: faker.date.weekday(),
          weekIndex: faker.number.int({ min: 0, max: 6 }),
          activity: faker.number.int({ min: 0, max: 100 }),
        }),
        7
      ),
    };
  },

  generatePaginatedStatusListResponse(page = 1, pageSize = 10) {
    const total = faker.number.int({ min: 50, max: 500 });
    return {
      statuses: generateRandomData.array(
        () => ({
          status: faker.lorem.words(2),
          usageCount: faker.number.int({ min: 1, max: 1000 }),
          trend: faker.helpers.arrayElement(['increasing', 'decreasing', 'stable']),
        }),
        pageSize
      ),
      total,
      page,
      pageSize,
    };
  },

  generatePlayingStatisticGraphData(): DataSet {
    const generateDataPoints = (days: number, min: number, max: number) => {
      return Array.from({ length: days }, (_, index) => ({
        date: new Date(2024, 0, index + 1).toISOString().split("T")[0],
        count: faker.number.int({ min, max }),
      }));
    };

    return {
      activeUsers: {
        data: generateDataPoints(5, 1000, 2000),
        color: "#3B82F6",
      },
      playingNow: {
        data: generateDataPoints(5, 700, 1200),
        color: "#2ecc71",
      },
    };
  },

  generateMockUserActivityData(): ActivityData {
    
    const generateTrendData = (): TrendData => {
      return {
        count: faker.number.int({ min: 100, max: 1000 }),
        trend: faker.number.float({ min: -10, max: 10 }),
      };
    }


    const generateActiveRolesData = (): ActiveRolesData[] => {
      return Array.from({ length: 7 }, () => ({
        date: generateRandomData.date().toISOString().split("T")[0],
        activityCount: faker.number.int({ min: 50, max: 500 }),
      }));
    }

    const generateActivityOverview = (): ActivityOverview => {
      return {
        owner: faker.number.int({ min: 1, max: 10 }),
        admin: faker.number.int({ min: 5, max: 50 }),
        user: faker.number.int({ min: 100, max: 1000 }),
        moderator: faker.number.int({ min: 5, max: 50 }),
      };
    }

    const generatePeakActivityTime = (): PeakActivityTime => {
      return {
        peakTime: generateRandomData.date().toISOString(),
        timezone: "UTC",
        trend: faker.number.float({ min: -5, max: 5 }),
      };
    }
    return {
      id: generateRandomData.bigInt(),
      presenceId: generateRandomData.bigInt(),
      presence: { id: generateRandomData.bigInt() }, 
      type: faker.helpers.arrayElement(['spotify', 'gaming', 'other']),
      sessionStart: generateRandomData.date(),
      sessionEnd: generateRandomData.date(),
      duration: 60 * 60 * 1000, 
      name: faker.commerce.productName(),
      state: faker.lorem.word(),
      details: faker.lorem.sentence(),
      onlineUsers: generateTrendData(),
      peakActivityTime: generatePeakActivityTime(),
      avgSessionTime: { ...generateTrendData(), timezone: "UTC" },
      playingNow: generateTrendData(),
      activeRoles: generateActiveRolesData(),
      activityOverview: generateActivityOverview(),
    };
  }

}

function createDataHook<T>(generateFn: () => T, count = 100) { 
  return () => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      try {
        const generatedData = Array.from({ length: count }, generateFn);
        setData(generatedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }, []);

    return { data, loading, error };
  };
}

export const usePlayingStatisticGraphData = generateRandomData.generatePlayingStatisticGraphData;
export const useUsersActivityData = generateRandomData.generateMockUserActivityData;
export const useUsers = createDataHook(generateRandomData.user);
export const useKeywords = createDataHook(generateRandomData.keyword);
export const useMessageMatches = createDataHook(generateRandomData.messageMatch);
export const useReactions = createDataHook(generateRandomData.reaction);
export const usePresences = createDataHook(generateRandomData.presence);
export const useActivities = createDataHook(generateRandomData.activity);
export const useSpotifyActivities = createDataHook(generateRandomData.spotifyActivity);
export const useGamingActivities = createDataHook(generateRandomData.gamingActivity);
export const useGamingAnalyticsResponse = generateRandomData.generateGamingAnalyticsResponse;
export const usePresenceAnalyticsResponse = generateRandomData.generatePresenceAnalyticsResponse;
export const useStatusPageAnalyticsResponse = generateRandomData.generateStatusPageAnalyticsResponse;
export const useMockActivityData = generateRandomData.generateMockActivityData;
export const useStatusData = generateRandomData.generateStatusData;
export const useOtherActivities = createDataHook(generateRandomData.otherActivity);
export const useArtists = createDataHook(generateRandomData.artist);