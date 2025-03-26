export interface MetricCount {
  count: number;
  label: string;
}

export interface DurationMetric {
  hours?: number;
  minutes?: number;
  label: string;
}

export interface ActivityOverviewResponse {
  activeUsers: MetricCount;
  peakUsers: MetricCount;
  totalPresenceTime: DurationMetric;
  avgSessionTime: DurationMetric;
}

export interface StatusBreakdown {
  status: string;
  color?: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  online: number[];
  idle: number[];
  dnd: number[];
  offline: number[];
}

export interface PeakHourChange {
  percentageChange: number;
  previousDayUsers: number;
  currentDayUsers: number;
}

export interface HourlyActivityResponse {
  hourlyDistribution: number[];
  statusDistribution: StatusDistribution;
  peakHour: number;
  peakHourChange: PeakHourChange;
}

export interface PeakHour {
  hour: number;
  users: number;
}

export interface DeviceUsage {
  deviceType: string;
  count: number;
  percentage: number;
}

export interface AggregationResponse {
  success: boolean;
  message?: string;
}
