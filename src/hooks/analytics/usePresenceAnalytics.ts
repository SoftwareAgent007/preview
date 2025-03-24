// usePresenceAnalytics.ts

import { ActivityOverviewResponse,
  StatusBreakdown,
  HourlyActivityResponse,
  PeakHour,
  DeviceUsage } from "@/pages/UsersDetailedActivityAnalytics/PresenceAnalytics/interfaces/presence-activirt.interfaces";
import { useQueryBuilder } from "./common/useQueryBuilder";

export function usePresenceActivity() {
  // 1) Обзор
  const {
    data: overview = {} as ActivityOverviewResponse,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQueryBuilder<ActivityOverviewResponse>(
    ['activityOverview'],
    (guildId, startDate, endDate) =>
      `/presence-activity/overview?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  // 2) Разбивка статусов
  const {
    data: statusBreakdown = [] as StatusBreakdown[],
    isLoading: statusLoading,
    error: statusError,
  } = useQueryBuilder<StatusBreakdown[]>(
    ['statusBreakdown'],
    (guildId, startDate, endDate) =>
      `/presence-activity/status-breakdown?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  // 3) Почасовая активность
  const {
    data: hourlyActivity = {} as HourlyActivityResponse,
    isLoading: hourlyLoading,
    error: hourlyError,
  } = useQueryBuilder<HourlyActivityResponse>(
    ['hourlyActivity'],
    (guildId, startDate, endDate) =>
      `/presence-activity/hourly-activity?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  // 4) Пиковые часы
  const {
    data: peakHours = [] as PeakHour[],
    isLoading: peakLoading,
    error: peakError,
  } = useQueryBuilder<PeakHour[]>(
    ['peakHours'],
    (guildId, startDate, endDate) =>
      `/presence-activity/peak-hours?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  // 5) Устройства
  const {
    data: deviceUsage = [] as DeviceUsage[],
    isLoading: deviceLoading,
    error: deviceError,
  } = useQueryBuilder<DeviceUsage[]>(
    ['deviceUsage'],
    (guildId, startDate, endDate) =>
      `/presence-activity/device-usage?guildId=${guildId}&startDate=${startDate}&endDate=${endDate}`
  );

  return {
    overview,
    statusBreakdown,
    hourlyActivity,
    peakHours,
    deviceUsage,
    isLoading: overviewLoading || statusLoading || hourlyLoading || peakLoading || deviceLoading,
    error: overviewError || statusError || hourlyError || peakError || deviceError,
  };
}
