import { DashboardContext } from '@/common/context/queryContext';
import { apiService } from '@/hooks/apiService';
import { useContext } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';

export function useQueryBuilder<TData>(
  queryKey: any[],
  buildUrl: (guildId: string, startDate: string, endDate: string) => string,
  options?: UseQueryOptions<TData, Error>
) {
  const dashboardContext = useContext(DashboardContext);

  if (!dashboardContext) {
    throw new Error("useQueryBuilder must be used within a DashboardContextProvider");
  }

  const selectedPeriod = dashboardContext?.selectedPeriod;
  const guildId = dashboardContext.guildId;

  if (!guildId) {
    return useQuery<TData, Error>(
      [...queryKey, 'no-guild-id'],
      async () => {
        throw new Error('Guild ID is required for API operations');
      },
      {
        ...options,
        enabled: false,
        retry: false
      }
    );
  }

  const fullQueryKey = [
    ...queryKey, 
    guildId,
    selectedPeriod?.from?.toISOString(),
    selectedPeriod?.to?.toISOString()
  ];

  const queryFn = async (): Promise<TData> => {
    const url = buildUrl(
      guildId,
      selectedPeriod?.from?.toISOString() || '',
      selectedPeriod?.to?.toISOString() || ''
    );
    return apiService.getData(url);
  };

  return useQuery<TData, Error>(fullQueryKey, queryFn, {
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!guildId,
    ...options,
  });
}