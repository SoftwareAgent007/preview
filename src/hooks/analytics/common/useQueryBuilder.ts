import { DashboardContext } from '@/common/context/queryContext';
import { apiService } from '@/hooks/apiService';
import { useContext } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';

const defaultContext = {
  selectedPeriod: {
    from: new Date("2025-03-15T00:46:16.937Z"),
    to: new Date("2025-03-15T00:46:16.937Z")
  },
  guildId: "1306748279903621142"
};


export function useQueryBuilder<TData>(  queryKey: any[], // ключ для useQuery
  buildUrl: (guildId: string, startDate: string, endDate: string) => string,
  options?: UseQueryOptions<TData, Error>
) {
  const dashboardContext = useContext(DashboardContext);

  if (!dashboardContext) {
    throw new Error("useQueryBuilder must be used within a DashboardContextProvider");
  }

  const selectedPeriod = dashboardContext?.selectedPeriod 
  
  const guildId = defaultContext.guildId;

  const queryFn = async (): Promise<TData> => {
    const url = buildUrl(guildId, selectedPeriod?.from?.toISOString() || '2025-03-10T00:00:00Z', selectedPeriod?.to?.toISOString() || '2025-03-13T23:59:59Z');
    return apiService.getData(url);
  };

  return useQuery<TData, Error>(queryKey, queryFn, {
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}