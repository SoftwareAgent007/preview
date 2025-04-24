import { DashboardContext } from '@/common/context/queryContext';
import { apiService } from '@/hooks/apiService';
import { useContext } from 'react';
import { useMutation, UseMutationOptions } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routes.constant';

export function useModifyBuilder<TParams, TResponse = any>(
  buildUrl: (params: TParams) => string,
  options?: {
    body?: (params: TParams) => any;
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    includeGuildId?: boolean;
  } & Omit<UseMutationOptions<TResponse, Error, TParams>, 'mutationFn'>
) {
  options = { includeGuildId: true, ...options };
  const dashboardContext = useContext(DashboardContext);
  const navigate = useNavigate();
  const guildId = dashboardContext.guildId;
  const shouldIncludeGuildId = options?.includeGuildId !== false;

  if (!guildId && shouldIncludeGuildId) {
    return useMutation<TResponse, Error, TParams>(
      async () => {
        navigate(ROUTES.ASSIGN_GUILD);
        throw new Error('Guild ID is required for API operations');
      },
      {
        ...options,
        retry: false
      }
    );
  }

  const mutationFn = async (params: TParams): Promise<TResponse> => {
    const url = buildUrl(params);
    const body = options?.body ? options.body(params) : params;
    
    // Add guildId to body for non-DELETE requests if includeGuildId is true
    const requestBody = options?.method !== 'DELETE' && shouldIncludeGuildId 
      ? { ...body, guildId } 
      : body;
    
    switch(options?.method) {
      case 'DELETE':
        return shouldIncludeGuildId 
          ? apiService.deleteData(url, guildId) 
          : apiService.deleteData(url);
      case 'PATCH':
        return shouldIncludeGuildId 
          ? apiService.patchData(url, requestBody, guildId) 
          : apiService.patchData(url, requestBody);
      case 'PUT':
        return shouldIncludeGuildId 
          ? apiService.putData(url, requestBody, guildId) 
          : apiService.putData(url, requestBody);
      default:
        return shouldIncludeGuildId 
          ? apiService.postData(url, requestBody, guildId) 
          : apiService.postData(url, requestBody);
    }
  };

  return useMutation<TResponse, Error, TParams>(mutationFn, {
    retry: 1,
    ...options,
  });
}
