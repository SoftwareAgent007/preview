export const mockData = [
  { date: "2024-11-21", positive: 150, neutral: 50, negative: -30 },
  { date: "2024-11-22", positive: 200, neutral: 60, negative: -40 },
  { date: "2024-11-23", positive: 180, neutral: 55, negative: -35 },
  { date: "2024-11-24", positive: 220, neutral: 65, negative: -50 },
  { date: "2024-11-25", positive: 170, neutral: 45, negative: -20 },
  { date: "2024-11-26", positive: 210, neutral: 70, negative: -45 },
  { date: "2024-11-27", positive: 190, neutral: 80, negative: -25 },
  { date: "2024-11-28", positive: 230, neutral: 75, negative: -55 },
  { date: "2024-11-29", positive: 240, neutral: 90, negative: -60 },
  { date: "2024-11-30", positive: 200, neutral: 85, negative: -50 },
  { date: "2024-12-01", positive: 210, neutral: 95, negative: -40 },
  { date: "2024-12-02", positive: 250, neutral: 100, negative: -270 },
  { date: "2024-12-03", positive: 200, neutral: 85, negative: -50 },
  { date: "2024-12-04", positive: 210, neutral: 95, negative: -40 },
  { date: "2024-12-05", positive: 250, neutral: 100, negative: -270 },
  { date: "2024-12-07", positive: 200, neutral: 85, negative: -50 },
  { date: "2024-12-08", positive: 210, neutral: 95, negative: -40 },
  { date: "2024-12-09", positive: 250, neutral: 100, negative: -270 },
  { date: "2024-12-10", positive: 200, neutral: 85, negative: -50 },
  { date: "2024-12-11", positive: 210, neutral: 95, negative: -40 },
  { date: "2024-12-12", positive: 250, neutral: 100, negative: -270 },
];

const totalReactions = mockData.reduce(
  (acc, data) => acc + data.positive + data.neutral + Math.abs(data.negative),
  0
);

const calculatePercentage = (value: number) =>
  ((value / totalReactions) * 100).toFixed(2);

export const positivePercentage = calculatePercentage(
  mockData.reduce((acc, data) => acc + data.positive, 0)
);
export const neutralPercentage = calculatePercentage(
  mockData.reduce((acc, data) => acc + data.neutral, 0)
);
export const negativePercentage = calculatePercentage(
  Math.abs(mockData.reduce((acc, data) => acc + data.negative, 0))
);
