import { useQueryBuilder } from './common/useQueryBuilder';
import { useMemo } from 'react';

export enum LogActionType {
  UPDATE_OWNER_ROLE = 'UPDATE_OWNER_ROLE',
  ASSIGN_GUILD = 'ASSIGN_GUILD',
  REMOVE_GUILD = 'REMOVE_GUILD',
  ACTIVATE_GUILD = 'ACTIVATE_GUILD',
  DEACTIVATE_GUILD = 'DEACTIVATE_GUILD',
  ASSIGN_GUILD_TO_AGENCY = 'ASSIGN_GUILD_TO_AGENCY',
  REMOVE_GUILD_FROM_AGENCY = 'REMOVE_GUILD_FROM_AGENCY',
  CHANGE_OWNER_AGENCY = 'CHANGE_OWNER_AGENCY',
  REMOVE_OWNER_AGENCY = 'REMOVE_OWNER_AGENCY',
  REMOVE_MULTIPLE_GUILDS = 'REMOVE_MULTIPLE_GUILDS',
}

interface OwnerInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface AdminAction {
  id: string;
  ownerId: string;
  actionType: LogActionType;
  targetId: string;
  targetType: string;
  details: Record<string, any>;
  createdAt: string;
  owner: OwnerInfo;
}

export interface ApiResponse<T> {
  data: T;
  pagination: {
    total: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
  }
  statusCode: number;
  timestamp: string;
  path: string;
  error: string | null;
  success: boolean;
  message: string | null;
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
  } = useQueryBuilder<ApiResponse<AdminAction[]>>(
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
  const meta = data?.pagination || {
    total: 0,
    currentPage: page,
    perPage,
    totalPages: 0
  };

  // Create an array of admins from the logs
  const admins: AdminUser[] = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    
    // Extract unique admins from the logs
    const uniqueAdmins = new Map<string, AdminUser>();
    logs.forEach(log => {
      if (log.owner && !uniqueAdmins.has(log.owner.id)) {
        uniqueAdmins.set(log.owner.id, {
          id: log.owner.id,
          name: log.owner.name,
          email: log.owner.email,
          role: log.owner.role
        });
      }
    });
    
    return Array.from(uniqueAdmins.values());
  }, [logs]);

  // Extract unique target types from the logs
  const uniqueTargetTypes = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    
    const types = new Set<string>();
    logs.forEach(log => {
      if (log.targetType) {
        types.add(log.targetType);
      }
    });
    
    return Array.from(types);
  }, [logs]);

  return {
    logs,
    meta,
    isLoading,
    error,
    refetch,
    actionTypes: Object.values(LogActionType),
    targetTypes: uniqueTargetTypes,
    admins,
    exportLogs: () => {
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
