import { useQueryBuilder } from '../analytics/common/useQueryBuilder';
import { PaginationDto, User } from '@/types/dataTypes';

interface AdminDataResponse {
  users: User[];
  pagination: PaginationDto;
}

interface OrganizationsResponse {
  organizations: any[];
}

export const useAdminData = (currentPage: number, pageSize: number, searchTerm: string) => {
  const { data: userData, isLoading: usersLoading, error: usersError } = useQueryBuilder<AdminDataResponse>(
    ['admin-users', currentPage, pageSize, searchTerm],
    (guildId) => 
      `/admin/users?guildId=${guildId}&page=${currentPage}&limit=${pageSize}&search=${searchTerm}`
  );

  const { data: orgData, isLoading: orgsLoading, error: orgsError } = useQueryBuilder<OrganizationsResponse>(
    ['admin-organizations'],
    (guildId) => `/admin/organizations?guildId=${guildId}`
  );

  const addUser = async (userData: Partial<User>) => {
    // Implementation would go here
    console.log('Adding user:', userData);
  };

  const toggleUserActive = async (userId: string) => {
    // Implementation would go here  
    console.log('Toggling user:', userId);
  };

  const deleteUser = async (userId: string) => {
    // Implementation would go here
    console.log('Deleting user:', userId);
  };

  const isLoading = usersLoading || orgsLoading;
  const error = usersError || orgsError;

  return {
    users: userData?.users || [],
    organizations: orgData?.organizations || [],
    pagination: userData?.pagination,
    isLoading,
    error,
    addUser,
    toggleUserActive, 
    deleteUser
  } as const;
};
