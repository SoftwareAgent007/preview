import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../apiService';
import {
  KeywordAnalyticsResponseDto,
} from '@/types/dataTypes';

export const useKeywordsAnalytics = (
  guildId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'year',
  page: number = 1,
  pageSize: number = 50
) => {
  const getPeriodStart = (): string => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'year':
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    }
  };

  const requestParams = {
    guildId,
    startDate: getPeriodStart(),
    endDate: new Date().toISOString(),
    page,
    limit: pageSize,
  };

  const {
    data: keywordsAnalytics,
    isLoading,
    error,
  } = useQuery<KeywordAnalyticsResponseDto, Error>(
    ['keywordsAnalytics', guildId, period, page, pageSize],
    () =>
      apiService.getData(
        `/keywords/analytics?guildId=${618826436299456533}&page=${requestParams.page}&limit=${requestParams.limit}`
      ),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      onError: (error) => {
        console.error('Error fetching keyword analytics:', error);
      },
    }
  );

  const defaultAnalytics = {
    totalKeywords: 0,
    activeKeywords: 0,
    totalMatches: 0,
    keywordsList: [],
    matchesTimeline: [],
    activeKeywordTags: [],
    pagination: {
      totalItems: 0,
      itemsPerPage: pageSize,
      currentPage: page,
      totalPages: 0,
    },
  };

  const sanitizedAnalytics = keywordsAnalytics
    ? {
        totalKeywords: keywordsAnalytics.totalKeywords ?? defaultAnalytics.totalKeywords,
        activeKeywords: keywordsAnalytics.activeKeywords ?? defaultAnalytics.activeKeywords,
        totalMatches: keywordsAnalytics.totalMatches ?? defaultAnalytics.totalMatches,
        keywordsList: keywordsAnalytics.keywordsList ?? defaultAnalytics.keywordsList,
        matchesTimeline: keywordsAnalytics.matchesTimeline ?? defaultAnalytics.matchesTimeline,
        activeKeywordTags: keywordsAnalytics.activeKeywordTags ?? defaultAnalytics.activeKeywordTags,
        pagination: keywordsAnalytics.pagination ?? defaultAnalytics.pagination,
      }
    : defaultAnalytics;

  return {
    ...sanitizedAnalytics,
    isLoading,
    requestParams,
    error,
  };
};
