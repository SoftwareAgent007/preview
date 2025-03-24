import { DashboardContext } from '@/common/context/queryContext';
import { apiService } from '@/hooks/apiService';
import { useContext } from 'react';
import { useMutation, UseMutationOptions } from 'react-query';

const defaultContext = {
  guildId: "1306748279903621142"
};

export function useModifyBuilder<TParams, TResponse = any>(
  buildUrl: (params: TParams) => string,
  options?: {
    body?: (params: TParams) => any;
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  } & Omit<UseMutationOptions<TResponse, Error, TParams>, 'mutationFn'>
) {
  const dashboardContext = useContext(DashboardContext);
  const guildId = defaultContext.guildId;

  const mutationFn = async (params: TParams): Promise<TResponse> => {
    const url = buildUrl(params);
    const body = options?.body ? options.body(params) : params;
    body.guildId = guildId;
    
    switch(options?.method) {
      case 'DELETE':
        return apiService.deleteData(url);
      case 'PATCH':
        return apiService.patchData(url, body);
      case 'PUT':
        return apiService.putData(url, body);
      default:
        return apiService.postData(url, body);
    }
  };

  return useMutation<TResponse, Error, TParams>(mutationFn, {
    retry: 1,
    ...options,
  });
}
