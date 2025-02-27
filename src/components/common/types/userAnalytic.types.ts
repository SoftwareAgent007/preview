export interface TrendData {
  count: number;
  trend: number;
}

export interface PeakActivityTime {
  peakTime: string;
  timezone: string;
  trend: number;
}

export interface ActiveRolesData {
  date: string;
  activityCount: number;
}

export interface ActivityOverview {
  owner: number;
  admin: number;
  user: number;
  moderator: number;
}

export interface ActivityStatusData {
  [key: string]: { value: number; date: string }; 
}

export interface ActivityData {
  id: bigint;
  presenceId: bigint;
  presence: { id: bigint};
  type: string;
  sessionStart: Date;
  sessionEnd: Date;
  duration: number;
  name: string;
  state: string;
  details: string;
  peakActivityTime: PeakActivityTime;
  onlineUsers: TrendData;
  avgSessionTime: TrendData & { timezone: string };
  playingNow: TrendData;
  activeRoles: ActiveRolesData[];
  activityOverview: ActivityOverview;
}

export type ChartData = {
  data: { date: string; count: number }[];
  color: string;
};

export type DataSet = {
  [key: string]: ChartData;
};
