import { useQueryBuilder } from './common/useQueryBuilder';

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

interface OwnerInfo {
  id: string;
  name: string;
  email: string;
  role: string; // Consider using a Role enum if available
}

export interface AdminAction {
  id: string;
  ownerId: string; // ID of the user performing the action
  actionType: LogActionType;
  targetId: string; // ID of the entity being acted upon
  targetType: string; // Type of the entity (e.g., 'GUILD', 'USER', 'AGENCY')
  details: Record<string, any>; // Action-specific details
  createdAt: string; // Timestamp of the action
  owner: OwnerInfo; // Details of the user performing the action
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

  const queryParams = {
    page,
    perPage,
    actionType,
    targetId,
    targetType,
    ownerId,
    startDate,
    endDate,
  };

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQueryBuilder<PaginatedWrapper<AdminAction[]>>(
    ['auditLogs', queryParams],
    () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      return `/admin/logs?${params.toString()}`;
    }
  );

  const logs = data?.data || [];
  const meta = data?.meta || {
    page,
    perPage,
    total: 0,
    totalPages: 0
  };

  return {
    logs,
    meta,
    isLoading,
    error,
    refetch,
    // The following are no longer fetched from separate endpoints
    actionTypes: Object.values(LogActionType),
    targetTypes: [], // Since target types are not fetched, return an empty array
    admins: [],      // Since admins are not fetched, return an empty array
    exportLogs: () => {   // For export logs functionality
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      const url = `${baseUrl}/admin/logs/export?${params.toString()}`;
      window.open(url, '_blank');
    }
  };
};
