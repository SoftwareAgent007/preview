import { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';

export const generateRandomData = {
  bigInt: () => BigInt(faker.string.numeric(15)), // Increased to 15 digits
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
    const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000); // Add 1 hour in milliseconds
    return {
      id: generateRandomData.bigInt(),
      presenceId: generateRandomData.bigInt(),
      type: faker.helpers.arrayElement(['spotify', 'gaming', 'other']),
      sessionStart,
      sessionEnd,
      duration: 60 * 60 * 1000, // 1 hour in milliseconds
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
    partySize: faker.number.int({ min: 1, max: 100 }), // Increased max
    partyMaxSize: faker.number.int({ min: 100, max: 1000 }), // Increased range
    platformId: faker.string.uuid(),
  }),

  otherActivity: () => ({
    id: generateRandomData.bigInt(),
    activityId: generateRandomData.bigInt(),
    activityType: faker.number.int({ min: 1, max: 10000 }), // Increased range
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
};

function createDataHook<T>(generateFn: () => T, count = 100) { // Increased default count
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

export const useUsers = createDataHook(generateRandomData.user);
export const useKeywords = createDataHook(generateRandomData.keyword);
export const useMessageMatches = createDataHook(generateRandomData.messageMatch);
export const useReactions = createDataHook(generateRandomData.reaction);
export const usePresences = createDataHook(generateRandomData.presence);
export const useActivities = createDataHook(generateRandomData.activity);
export const useSpotifyActivities = createDataHook(generateRandomData.spotifyActivity);
export const useGamingActivities = createDataHook(generateRandomData.gamingActivity);
export const useOtherActivities = createDataHook(generateRandomData.otherActivity);
export const useArtists = createDataHook(generateRandomData.artist);