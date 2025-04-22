import { useMemo } from "react";
import { useQuery } from "react-query";
import { apiService } from "../apiService";
import { ActivityOverviewResponse,
  StatusBreakdown,
  HourlyActivityResponse,
  PeakHour,
  DeviceUsage } from "@/pages/UsersDetailedActivityAnalytics/PresenceAnalytics/interfaces/presence-activirt.interfaces";
import { AverageSessionResponse } from "@/types/music.interface";
import { useQueryBuilder } from "./common/useQueryBuilder";

export interface UserActivityAnalytics {
  activityOverview: ActivityOverviewResponse | null;
  statusBreakdown: StatusBreakdown[];
  hourlyActivity: HourlyActivityResponse | null;
  peakHours: PeakHour[];
  deviceUsage: DeviceUsage[];
  activeRoles: any;
  avgSessionTime: AverageSessionResponse;
  joins: any;
  leaves: any;
  isLoading: boolean;
  error: string | null;
}

export const useUserActivityAnalytics = (
  guildId: string,
  period: "day" | "week" | "month" | "year" = "year"
): UserActivityAnalytics => {
  const getPeriodStart = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "day":
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case "week":
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case "year":
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    }
  }, [period]);

  const requestParams = {
    guildId: "618826436299456533",
    startDate: getPeriodStart,
    endDate: new Date().toISOString(),
  };

  const fetchWithErrorKey = (key: string, endpoint: string) =>
    useQuery(key, () => apiService.getData(endpoint).catch((error: Error) => {
      throw new Error(`${key}: ${error.message}`);
    }), {
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    });

  const { data: activityOverview, isLoading: overviewLoading, error: overviewError } = fetchWithErrorKey(
    "userActivityOverview",
    `/presence-activity/overview?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
  );

  const { data: statusBreakdown, isLoading: statusLoading, error: statusError } = fetchWithErrorKey(
    "statusBreakdown",
    `/presence-activity/status-breakdown?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
  );

  const { data: hourlyActivity, isLoading: hourlyLoading, error: hourlyError } = fetchWithErrorKey(
    "hourlyActivity",
    `/presence-activity/hourly-activity?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
  );

  const { data: peakHours, isLoading: peakLoading, error: peakError } = fetchWithErrorKey(
    "peakHours",
    `/presence-activity/peak-hours?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}&limit=5`
  );

  const { data: deviceUsage, isLoading: deviceLoading, error: deviceError } = fetchWithErrorKey(
    "deviceUsage",
    `/presence-activity/device-usage?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
  );

  const { data: activeRoles, isLoading: rolesLoading, error: rolesError } = fetchWithErrorKey(
    "activeRoles",
    `/guilds/${618826436299456533}/active-roles`
  );

  const { data: avgSessionTime, isLoading: sessionLoading, error: sessionError } = fetchWithErrorKey(
    "avgSessionTime",
    `/music-metrics/average-session?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
  );

  const { data: joins, isLoading: joinsLoading, error: joinsError } = fetchWithErrorKey(
    "joins",
    `/presence-activity/joins?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
  );

  const { data: leaves, isLoading: leavesLoading, error: leavesError } = fetchWithErrorKey(
    "leaves",
    `/presence-activity/leaves?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}`
  );

  const isLoading = overviewLoading || peakLoading || hourlyLoading || rolesLoading || sessionLoading || joinsLoading || leavesLoading || statusLoading || deviceLoading;

  const error = [
    overviewError,
    statusError,
    hourlyError,
    peakError,
    deviceError,
    rolesError,
    sessionError,
    joinsError,
    leavesError,
  ].filter(Boolean).map((e: unknown) => (e as Error).message).join(", ");

  return {
    activityOverview: activityOverview ?? null,
    statusBreakdown: statusBreakdown ?? [],
    hourlyActivity: hourlyActivity ?? null,
    peakHours: peakHours ?? [],
    deviceUsage: deviceUsage ?? [],
    activeRoles,
    avgSessionTime,
    joins,
    leaves,
    isLoading,
    error: error || null,
  };
};
interface ActivityTrendParams {
  guildId: string;
  activityType: 'user' | 'spotify' | 'gaming' | 'device';
  viewType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  deviceType?: string;
  limit?: number;
}

interface TrendDataPoint {data: {
  date: string;
  activeUsers: number;
}}

export const useActivityTrend = ({
  activityType,
  viewType,
  deviceType,
  limit
}: Omit<ActivityTrendParams, 'guildId'>) => {
  const { data, isLoading, error } = useQueryBuilder<{data: TrendDataPoint[]}>(
    ['activityTrend', activityType, viewType, deviceType, limit],
    (guildId) => {
      const params = new URLSearchParams({
        guildId,
        activityType,
        viewType,
        ...(deviceType && { deviceType }),
        ...(limit && { limit: limit.toString() })
      });
      return `/presence-activity/active-users-trend?${params}`;
    }
  );

  return {
    data,
    isLoading,
    error
  };
};