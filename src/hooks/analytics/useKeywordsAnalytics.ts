import { useMemo } from 'react';
import { useKeywords, useMessageMatches } from '../fetchData';

export const useKeywordsAnalytics = (period: 'day' | 'week' | 'month' | 'year' = 'year') => {
  const { data: keywords } = useKeywords();
  const { data: messages } = useMessageMatches();

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


  const activeKeywords = useMemo(() => {
    return keywords?.filter(keyword => keyword.active) || [];
  }, [keywords]);

  const matchesTimeline = useMemo(() => {
    const timeline: Record<string, number> = {};
    messages?.forEach(message => {
      const date = message.matchedAt.toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    return Object.entries(timeline).map(([date, count]) => ({ date, count }));
  }, [messages]);

  const totalActiveKeywords = useMemo(() => {
    return keywords?.filter(keyword => keyword.active).length || 0;
  }, [keywords]);

  const totalMatches = useMemo(() => {
    return messages?.length || 0;
  }, [messages]);

  const keywordStats = useMemo(() => {
    if (!keywords) return { total: 0, active: 0 };
    const periodKeywords = keywords.filter(k => new Date(k.createdAt) >= getPeriodStart);
    return {
      total: periodKeywords.length,
      active: periodKeywords.filter(k => k.active).length
    };
  }, [keywords, getPeriodStart]);

  return {
    activeKeywords,
    matchesTimeline,
    totalActiveKeywords,
    totalMatches,
    keywordStats
  };
};
