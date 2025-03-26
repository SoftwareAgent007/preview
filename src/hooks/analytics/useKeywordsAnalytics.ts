import { useQueryBuilder } from './common/useQueryBuilder';
import { useModifyBuilder } from './common/useModifyBuilder';
import { KeywordAnalyticsResponseDto, TimelineDataDto, KeywordTrendResponse, KeywordListItemDto } from '@/types/dataTypes';
import { useQueryClient } from 'react-query';
import { useMemo } from 'react';

interface AddKeywordParams {
  keyword: string;
  guildId: string;
}

interface KeywordActionParams {
  keyword: string;
  guildId: string;
}

interface AddKeywordResponse {
  id: string;
  keyword: string;
  active: boolean;
}

export const useKeywordTimeline = (selectedKeyword?: string, startDate?: string, endDate?: string) => {
  const { data: selectedKeywordTimeline } = useQueryBuilder<{keywords: KeywordListItemDto[], totalCount: number}>(
    ['keywordTimeline', selectedKeyword],
    (guildId) => {
      const url = `/keywords/timeline?search=${selectedKeyword}&guildId=${guildId}&take=10&skip=0`;
      return url;
    },
    { enabled: !!selectedKeyword }
  );

  return { selectedKeywordTimeline };
};

export const useKeywordsAnalytics = (
  page: number = 1,
  pageSize: number = 50,
  guildId?: string,
  selectedKeywordId?: string
) => {
  const queryClient = useQueryClient();

  const {
    data: keywordsAnalytics,
    isLoading,
    error,
    refetch: refetchAnalytics
  } = useQueryBuilder<KeywordAnalyticsResponseDto>(
    ['keywordsAnalytics', page, pageSize],
    (guildId) =>
      `/keywords/analytics?guildId=${guildId}&page=${page}&limit=${pageSize}`
  );

  const { data: activeTags, refetch: refetchTags } = useQueryBuilder<string[]>(
    ['keywordTags', guildId],
    (guildId) => `/keywords/tags?guildId=${guildId}`
  );

  const { selectedKeywordTimeline } = useKeywordTimeline(selectedKeywordId);

  const addKeyword = useModifyBuilder<AddKeywordParams, AddKeywordResponse>(
    () => `/keywords`,
    {
      body: (params) => ({
        active: true,
        guildId: params.guildId,
        keyword: params.keyword
      }),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(['keywordTags']),
          queryClient.invalidateQueries(['keywordsAnalytics']),
          queryClient.invalidateQueries(['keywordsAnalytics', 1]),
          refetchAnalytics(),
          refetchTags()
        ]);
      }
    }
  );

  const toggleKeywordActive = useModifyBuilder<{keyword: string}>(
    (params) => `/keywords/${params.keyword}/toggle-active`,
    {
      method: 'PATCH',
      onSuccess: () => {
        queryClient.invalidateQueries(['keywordTags']);
        queryClient.invalidateQueries(['keywordsAnalytics']);
      }
    }
  );

  const deleteKeyword = useModifyBuilder<{id: number}>(
    (params) => `/keywords/${params.id}`,
    {
      method: 'DELETE',
      onSuccess: () => {
        queryClient.invalidateQueries(['keywordTags']);
        queryClient.invalidateQueries(['keywordsAnalytics']);
      }
    }
  );
    
  return {
    ...keywordsAnalytics,
    activeTags,
    isLoading,
    error,
    addKeyword,
    toggleKeywordActive,
    deleteKeyword,
    refetchAnalytics,
    selectedKeywordTimeline
  };
};
export const useKeywordTrend = (
  keyword?: string,
  viewType: 'day' | 'week' | 'month' | 'year' = 'day', 
  limit: number = 7
) => {
  // Calculate date range
  const dates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch(viewType) {
      case 'week':
        start.setDate(end.getDate() - 7 * limit);
        break;
      case 'month':
        start.setDate(end.getDate() - 30 * limit);
        break;
      default: // day
        start.setDate(end.getDate() - limit);
    }
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }, [viewType, limit]);

  const { data: trendData, isLoading: isTrendLoading } = useQueryBuilder<KeywordTrendResponse>(
    ['keywordTrend', keyword, viewType, limit],
    (guildId) => 
      `/message-match/trend?guildId=${guildId}&startDate=${dates.startDate}&endDate=${dates.endDate}&viewType=${viewType}&limit=${limit}${keyword ? `&keywords[]=${keyword}` : ''}`,
  );

  return { trendData: trendData?.data ?? [], isTrendLoading };
};

export const useKeywordsWithTrend = (
  page: number = 1,
  pageSize: number = 50,
  guildId?: string,
  selectedKeywords: string[] = []
) => {
  const {
    keywordsList,
    isLoading: isKeywordsLoading,
    ...rest
  } = useKeywordsAnalytics(page, pageSize, guildId);

  // Find most frequent keyword
  const mostFrequentKeyword = useMemo(() => {
    if (!keywordsList?.length) return null;
    return keywordsList.reduce((prev, current) => 
      (prev?.matches?.count ?? 0) > (current.matches?.count ?? 0) ? prev : current
    );
  }, [keywordsList]);

  // Combine selected keywords with most frequent one
  const keywordsToTrack = useMemo(() => {
    const keywords = new Set(selectedKeywords);
    if (mostFrequentKeyword && !selectedKeywords.includes(mostFrequentKeyword.keyword)) {
      keywords.add(mostFrequentKeyword.keyword);
    }
    return Array.from(keywords);
  }, [selectedKeywords, mostFrequentKeyword]);

  const { trendData, isTrendLoading } = useKeywordTrend(
    guildId,
    keywordsToTrack
  );

  return {
    keywordsList,
    trendData,
    isLoading: isKeywordsLoading || isTrendLoading,
    mostFrequentKeyword,
    ...rest
  };
};
