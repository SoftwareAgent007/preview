import { useQueryBuilder } from './common/useQueryBuilder';
import { useQueryClient } from 'react-query';

export enum LogActionType {
  UPDATE_OWNER_ROLE = 'UPDATE_OWNER_ROLE',
  ASSIGN_GUILD = 'ASSIGN_GUILD',
  REMOVE_GUILD = 'REMOVE_GUILD',
  ACTIVATE_GUILD = 'ACTIVATE_GUILD',
  DEACTIVATE_GUILD = 'DEACTIVATE_GUILD',
  ASSIGN_GUILD_TO_AGENCY = 'ASSIGN_GUILD_TO_AGENCY',
  CHANGE_OWNER_AGENCY = 'CHANGE_OWNER_AGENCY',
  REMOVE_OWNER_AGENCY = 'REMOVE_OWNER_AGENCY',
  REMOVE_MULTIPLE_GUILDS = 'REMOVE_MULTIPLE_GUILDS',
}

export interface AdminAction {
  id: string;
  actionType: LogActionType;
  targetId: string;
  targetType: string;
  ownerId: string;
  ownerName: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface PaginatedWrapper<T> {
  data: T;
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLogsFilter {
  page?: number;
  perPage?: number;
  actionType?: LogActionType;
  targetId?: string;
  targetType?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
}

export const useAuditLogs = (filters: AuditLogsFilter = {}) => {
  const queryClient = useQueryClient();
  
  const {
    page = 1,
    perPage = 10,
    actionType,
    targetId,
    targetType,
    ownerId,
    startDate,
    endDate
  } = filters;
  
  // Build query params string
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('perPage', perPage.toString());
    
    if (actionType) params.append('actionType', actionType);
    if (targetId) params.append('targetId', targetId);
    if (targetType) params.append('targetType', targetType);
    if (ownerId) params.append('ownerId', ownerId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return params.toString();
  };
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQueryBuilder<PaginatedWrapper<AdminAction[]>>(
    ['auditLogs', page, perPage, actionType, targetId, targetType, ownerId, startDate, endDate],
    () => `/admin/logs?${buildQueryParams()}`
  );
  
  // Extract the logs data and pagination meta
  const logs = data?.data || [];
  const meta = data?.meta || {
    page,
    perPage,
    total: 0,
    totalPages: 0
  };
  
  // Get distinct action types for filtering
  const { data: actionTypes } = useQueryBuilder<LogActionType[]>(
    ['auditLogActionTypes'],
    () => `/admin/logs/`
  );
  
  // Get distinct target types for filtering
  const { data: targetTypes } = useQueryBuilder<string[]>(
    ['auditLogTargetTypes'],
    () => `/admin/logs/`
  );
  
  // Get admins list for filtering
  const { data: admins } = useQueryBuilder<{ id: string; name: string }[]>(
    ['auditLogAdmins'],
    () => `/admin/logs/`  );
  
  // For export logs functionality
  const exportLogs = () => {
    const baseUrl = process.env.REACT_APP_API_URL || '';
    const url = `${baseUrl}/admin/logs/export?${buildQueryParams()}`;
    window.open(url, '_blank');
  };
  
  return {
    logs,
    meta,
    isLoading,
    error,
    refetch,
    actionTypes: actionTypes || Object.values(LogActionType),
    targetTypes: targetTypes || [],
    admins: admins || [],
    exportLogs
  };
};
