import { useEffect, useMemo } from "react";
import { useGamingAnalyticsResponse } from "../fetchData";

export const useGamingAnalyticsData = (period: 'day' | 'week' | 'month' | 'year' = 'year') => {

  const { data } = useGamingAnalyticsResponse()

  useEffect(() => {
    console.log('data шт гіу уааусе',data)
  },[data])

  const getPeriodStart = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return now; // Fallback to now if period is not recognized
    }
  }, [period]);

  const filteredData = useMemo(() => {
    const result = data[0]
    console.log('data', data)
    // .find(item => {
    //   const itemDate = new Date(item.userActivityTimeline[0].date); // Assuming the first date in the timeline represents the activity date
    //   console.log('itemDate >= getPeriodStart', itemDate, getPeriodStart)
    //   return itemDate >= getPeriodStart;
    // });
    return result ? {
      activeUsers: result.activeUsers,
      avgSessionTime: result.avgSessionTime,
      peakPlayers: result.peakPlayers,
      totalGameTime: result.totalGameTime,
      userActivityTimeline: result.userActivityTimeline,
      activeRolesPlayingNow: result.activeRolesPlayingNow,
      topGames: result.topGames,
    } : null; // Return null if no matching data found
  }, [data, getPeriodStart]);

  return filteredData;
}
