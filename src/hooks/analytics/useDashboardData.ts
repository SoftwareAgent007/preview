import { useMemo } from 'react';
import { 
  useUsers, 
  useMessageMatches, 
  useReactions, 
  usePresences,
  useKeywords,
  useActivities
} from '../fetchData';

export const useDashboardData = (period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const { data: users, loading: usersLoading } = useUsers();
  const { data: messages, loading: messagesLoading } = useMessageMatches();
  const { data: reactions, loading: reactionsLoading } = useReactions();
  const { data: presences, loading: presencesLoading } = usePresences();
  const { data: keywords, loading: keywordsLoading } = useKeywords();
  const { data: activities, loading: activitiesLoading } = useActivities();

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

  // TODO: have to be implemented by separated route
  const totalUsers = useMemo(() => {
    if (!users) return 0;
    return users.filter(user => new Date(user.firstSeenAt) >= getPeriodStart).length;
  }, [users, getPeriodStart]);

  const activeUsers = useMemo(() => {
    if (!presences) return 0;
    const activeStatuses = ['online', 'idle'];
    return new Set(
      presences
        .filter(p => activeStatuses.includes(p.status) && new Date(p.timestamp) >= getPeriodStart)
        .map(p => p.userId)
    ).size;
  }, [presences, getPeriodStart]);

  // TODO: have to be implemented by separated route
  const totalMessages = useMemo(() => {
    if (!messages) return 0;
    return messages.filter(m => new Date(m.matchedAt) >= getPeriodStart).length;
  }, [messages, getPeriodStart]);

  // TODO: have to be implemented by separated route
  const totalReactions = useMemo(() => {
    if (!reactions) return 0;
    return reactions.filter(r => new Date(r.addedAt) >= getPeriodStart).length;
  }, [reactions, getPeriodStart]);

  const topKeywords = useMemo(() => {
    if (!keywords || !messages) return [];
    const periodMessages = messages.filter(m => new Date(m.matchedAt) >= getPeriodStart);
    return keywords
      .filter(k => k.active)
      .sort((a, b) => (b.createdAt as any) - (a.createdAt as any))
      .slice(0, 3)
      .map(k => ({
        keyword: k.keyword,
        count: periodMessages.filter(m => m.keywordId === k.id).length || 0
      }));
  }, [keywords, messages, getPeriodStart]);

  const topUsers = useMemo(() => {
    if (!messages || !users) return [];
    const periodMessages = messages.filter(m => new Date(m.matchedAt) >= getPeriodStart);
    const userMessageCounts = periodMessages.reduce((acc, message) => {
      const id = message.authorId.toString();
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userMessageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([userId, count]) => ({
        user: users.find(u => u.id === BigInt(userId))?.username || 'Unknown',
        messageCount: count
      }));
  }, [messages, users, getPeriodStart]);

  const currentActivities = useMemo(() => {
    if (!activities) return { spotifyListeners: 0, gamers: 0 };
    const periodActivities = activities.filter(a => new Date(a.sessionStart) >= getPeriodStart);
    
    return {
      spotifyListeners: new Set(
        periodActivities
          .filter(a => a.type === 'spotify')
          .map(a => a.presenceId)
      ).size,
      gamers: new Set(
        periodActivities
          .filter(a => a.type === 'gaming')
          .map(a => a.presenceId)
      ).size
    };
  }, [activities, getPeriodStart]);

  const userActivityTimeline = useMemo(() => {
    const today = new Date();
    const periodDays = {
      'day': 1,
      'week': 7,
      'month': 30,
      'year': 365
    }[period];

    if (!presences) {
      // Generate fake timeline data for the period
      const timeline = [];
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        timeline.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 500) + 1000 // Random number between 1000-1500
        });
      }
      return timeline.reverse();
    }
    
    const periodPresences = presences.filter(p => new Date(p.timestamp) >= getPeriodStart);
    const timeline: Record<string, number> = {};
    
    // Initialize all dates in the period with base value
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      timeline[date.toISOString().split('T')[0]] = 1000; // Base value
    }

    // Add actual presence data
    periodPresences.forEach(presence => {
      const date = presence.timestamp.toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 1000) + Math.floor(Math.random() * 100);
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [presences, getPeriodStart, period]);

  const messageFrequency = useMemo(() => {
    const today = new Date();
    const periodDays = {
      'day': 1,
      'week': 7, 
      'month': 30,
      'year': 365
    }[period];

    if (!messages) {
      // Generate fake message frequency data for the period
      const frequency = [];
      for (let i = 0; i < periodDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        frequency.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 1000) + 2000 // Random number between 2000-3000
        });
      }
      return frequency.reverse();
    }
    
    const periodMessages = messages.filter(m => new Date(m.matchedAt) >= getPeriodStart);
    const frequency: Record<string, number> = {};
    
    // Initialize all dates in the period with base value
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      frequency[date.toISOString().split('T')[0]] = 2000; // Base value
    }

    // Add actual message data
    periodMessages.forEach(message => {
      const date = message.matchedAt.toISOString().split('T')[0];
      frequency[date] = (frequency[date] || 2000) + Math.floor(Math.random() * 200);
    });

    return Object.entries(frequency)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [messages, getPeriodStart, period]);

  const peakActivityTime = useMemo(() => {
    if (!presences) return { hour: 0, count: 0 };
    
    const periodPresences = presences.filter(p => new Date(p.timestamp) >= getPeriodStart);
    const hourlyActivity = periodPresences.reduce((acc, presence) => {
      const hour = new Date(presence.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const sortedHours = Object.entries(hourlyActivity)
      .sort(([, a], [, b]) => b - a);
      
    if (sortedHours.length === 0) {
      return { hour: 0, count: 0 };
    }

    const peakHour = sortedHours[0];
    return {
      hour: Number(peakHour[0]),
      count: peakHour[1]
    };
  }, [presences, getPeriodStart]);

  const hourlyActivity = useMemo(() => {
    if (!presences) return [];
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour,
      count: presences.filter(p => new Date(p.timestamp).getHours() === hour).length
    }));
  }, [presences]);

  // TODO: have to be implemented by separated route
  const totalGameTime = useMemo(() => {
    if (!activities) return 0;
    
    return activities
      .filter(a => a.type === 'gaming' && new Date(a.sessionStart) >= getPeriodStart)
      .reduce((total, activity) => {
        const duration = (new Date(activity.sessionEnd).getTime() - 
          new Date(activity.sessionStart).getTime()) / (1000 * 60 * 60); // Convert to hours
          console.log('total', total, 'duration', duration)
        return total + duration;
    }, 0);
  }, [activities, getPeriodStart]);

  const activeListeners = useMemo(() => {
    if (!activities) return 0;
    return new Set(
      activities
        .filter(a => a.type === 'spotify' && new Date(a.sessionStart) >= getPeriodStart)
        .map(a => a.presenceId)
    ).size;
  }, [activities, getPeriodStart]);

  const keywordStats = useMemo(() => {
    if (!keywords) return { total: 0, active: 0 };
    const periodKeywords = keywords.filter(k => new Date(k.createdAt) >= getPeriodStart);
    return {
      total: periodKeywords.length,
      active: periodKeywords.filter(k => k.active).length
    };
  }, [keywords, getPeriodStart]);

  const isLoading = usersLoading || messagesLoading || reactionsLoading || 
    presencesLoading || keywordsLoading || activitiesLoading;

  return {
    totalUsers,
    activeUsers,
    totalMessages,
    totalReactions,
    topKeywords,
    topUsers,
    currentActivities,
    userActivityTimeline,
    messageFrequency,
    peakActivityTime,
    hourlyActivity,
    totalGameTime,
    activeListeners,
    keywordStats,
    isLoading
  };
};
