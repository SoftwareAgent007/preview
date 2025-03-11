import { faker } from "@faker-js/faker";

export const generateFakeStats = () => [
  {
    label: "Total Plays",
    value: faker.number.int({ min: 10000, max: 50000 }),
    change: faker.number.int({ min: -20, max: 20 }),
    isPositive: faker.datatype.boolean(),
  },
  {
    label: "Unique Artists",
    value: faker.number.int({ min: 500, max: 1500 }),
    change: faker.number.int({ min: -20, max: 20 }),
    isPositive: faker.datatype.boolean(),
  },
  {
    label: "Active Listeners",
    value: faker.number.int({ min: 1000, max: 5000 }),
    change: faker.number.int({ min: -20, max: 20 }),
    isPositive: faker.datatype.boolean(),
  },
];

export const generateFakeArtists = () =>
  Array.from({ length: 5 }, () => ({
    name: faker.person.fullName(),
    plays: faker.number.int({ min: 1000, max: 10000 }),
  }));

export const generateFakeGenreData = () => {
  const totalCount = 800;
  const counts = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * (totalCount / 5))
  );
  const sumCounts = counts.reduce((acc, count) => acc + count, 0);

  counts[counts.length - 1] += totalCount - sumCounts;

  return counts.map((count, i) => ({
    genre: faker.music.genre(),
    artist: faker.person.fullName(),
    count,
    total: totalCount,
  }));
};

export const generateListeningHoursData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    percentage: faker.number.int({ min: 10, max: 100 }),
  }));
};

export const generateSessionStats = () => {
  const currentSession = 135;
  const previousSession = 115;
  const change = ((currentSession - previousSession) / previousSession) * 100;
  return {
    current: currentSession,
    previous: previousSession,
    change,
    isPositive: change > 0,
  };
};
