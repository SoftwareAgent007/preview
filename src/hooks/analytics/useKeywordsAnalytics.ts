import { useQueryBuilder } from './common/useQueryBuilder';
import { useModifyBuilder } from './common/useModifyBuilder';
import { KeywordAnalyticsResponseDto } from '@/types/dataTypes';
import { useQueryClient } from 'react-query';

interface AddKeywordParams {
  keyword: string;
  guildId: string;
}

interface KeywordActionParams {
  id: string;
  guildId: string;
}

interface AddKeywordResponse {
  id: string;
  keyword: string;
  active: boolean;
}

export const useKeywordsAnalytics = (
  page: number = 1,
  pageSize: number = 50,
  guildId?: string
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

  const addKeyword = useModifyBuilder<AddKeywordParams, AddKeywordResponse>(
    () => `/keywords`,
    {
      body: (params) => ({
        active: true,
        guildId: params.guildId,
        keyword: params.keyword
      }),
      onSuccess: async () => {
        // Refetch all queries in sequence to ensure data consistency
        await Promise.all([
          queryClient.invalidateQueries(['keywordTags']),
          queryClient.invalidateQueries(['keywordsAnalytics']),
          queryClient.invalidateQueries(['keywordsAnalytics', 1]), // Refetch first page
          refetchAnalytics(), // Refetch current analytics data
          refetchTags() // Refetch tags
        ]);
      }
    }
  );

  const toggleKeywordActive = useModifyBuilder<KeywordActionParams>(
    (params) => `/keywords/${params.id}/toggle-active`,
    {
      method: 'PATCH',
      onSuccess: () => {
        queryClient.invalidateQueries(['keywordTags']);
        queryClient.invalidateQueries(['keywordsAnalytics']);
      }
    }
  );

  const deleteKeyword = useModifyBuilder<KeywordActionParams>(
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
    refetchAnalytics
  };
};
