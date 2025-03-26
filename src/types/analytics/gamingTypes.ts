export interface PeakHour {
  hour: number;
  playerCount: number;
}

export interface WeeklyTrend {
  weekStartDate: string;
  totalUsers: number;
  totalHours: number;
  avgSessionMinutes: number;
}

export interface GameStats {
  totalPlayers: number;
  totalHours: number;
  avgSessionMinutes: number;
  peakPartySize: number;
  returnRate: number;
  peakHours: PeakHour[];
  weeklyTrends: WeeklyTrend[];
  playtimeDistribution: PlaytimeDistribution[];
  topGamers: TopGamer[];
  timeOfDayBreakdown: TimeOfDayBreakdown[];
}

export interface ActiveGame {
  gameName: string;
  playerCount: number;
  lastPlayed: Date;
}

export interface PopularGame {
  gameName: string;
  totalHours: number;
  uniquePlayers: number;
  avgSessionMinutes: number;
  peakHours: PeakHour[];
}

export interface PlaytimeDistribution {
  rangeLabel: string;
  userCount: number;
  percentage: number;
}

export interface TopGamer {
  userId: string;
  hoursPlayed: number;
  sessionCount: number;
}

export interface TimeOfDayBreakdown {
  timeBlock: string;
  userCount: number;
  percentOfTotal: number;
}

export interface GameReport {
  basicStats: GameStats;
  playtimeDistribution: PlaytimeDistribution[];
  topGamers: TopGamer[];
  weeklyTrends: WeeklyTrend[];
  timeOfDayBreakdown: TimeOfDayBreakdown[];
}
interface PaginationWrapper {
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalApproved?: number;
  totalRejected?: number;
}

export interface PaginatedWrapper<T> {
  data: T;
  pagination: PaginationWrapper;
}
