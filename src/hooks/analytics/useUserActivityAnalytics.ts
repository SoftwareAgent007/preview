import { useMemo } from 'react';
import { useUsersActivityData } from '../fetchData';
import { ActivityData } from '@/components/common/types/userAnalytic.types';

export const useUserActivityAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const { data }: { data: ActivityData[] } = useUsersActivityData();

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
    }
  }, [period]);

  const activityStats = useMemo(() => {
    if (!data) return { peakActivityTime: null, onlineUsers: 0, avgSessionTime: 0, playingNow: 0, activeRoles: [], activityOverview: null };
    
    const periodActivities = data.filter(activity => {
      const sessionStart = new Date(activity.sessionStart);
      const sessionEnd = new Date(activity.sessionEnd);
      return sessionStart >= getPeriodStart || sessionEnd >= getPeriodStart;
    });
    
    return {
      peakActivityTime: periodActivities.length > 0 ? periodActivities[0].peakActivityTime : null,
      onlineUsers: periodActivities.reduce((acc, activity) => acc + activity.onlineUsers.count, 0),
      avgSessionTime: periodActivities.reduce((acc, activity) => acc + activity.avgSessionTime.count, 0) / periodActivities.length || 0,
      playingNow: periodActivities.reduce((acc, activity) => acc + activity.playingNow.count, 0),
      activeRoles: periodActivities.flatMap(activity => activity.activeRoles),
      activityOverview: periodActivities.length > 0 ? periodActivities[0].activityOverview : null
    };
  }, [data, getPeriodStart]);

  return {
    activityStats
  };
};
