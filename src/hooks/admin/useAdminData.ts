import { useQueryBuilder } from '../analytics/common/useQueryBuilder';
import { useModifyBuilder } from '../analytics/common/useModifyBuilder';
import { useQueryClient } from 'react-query';
import {
  Owner,
  Guild,
  SuccessResponse,
  OwnerGuild,
  Agency,
  CreateAgencyDto,
  UpdateAgencyDto,
  AssignAgencyGuildDto,
  UpdateOwnerRoleDto,
  AssignGuildDto,
  ToggleGuildStateDto,
  OwnerRole,
} from './admin.types';
import { Agency as AgencyDto, User } from "@/types/dataTypes";


const ADMIN_QUERY_KEYS = {
  owners: ['admin', 'owners'],
  guilds: ['admin', 'guilds'],
  ownerGuilds: (ownerId: string) => ['admin', 'owners', ownerId, 'guilds'],
  agencies: ['admin', 'agencies'],
  agencyById: (agencyId: string) => ['admin', 'agencies', agencyId],
  agencyGuilds: (agencyId: string) => ['admin', 'agencies', agencyId, 'guilds'],
  users: ['admin', 'users'],
  groups: ['admin', 'groups'],
};

// --- Owner Management Hooks ---

export const useGetAllOwners = () => {
  return useQueryBuilder<Owner[]>(
    ADMIN_QUERY_KEYS.owners,
    () => '/admin/owners'
  );
};

export type UpdateOwnerRoleVariables = {
  id: string;
  payload: {
    role: OwnerRole;
    agencyId?: string;
  };
};
export const useUpdateOwnerRole = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<UpdateOwnerRoleVariables>(
    ({ id }) => `/admin/owners/${id}/role`,
    {
      method: 'PATCH',
      includeGuildId: false,
      body: (variables) => variables.payload, // Use only the payload for the request body
      onSuccess: (updatedOwner, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.owners);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
      },
    }
  );
};

export type AssignGuildVariables = { id: string; payload: AssignGuildDto };
export const useAssignGuildToOwner = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<AssignGuildVariables>(
    ({ id }) => `/admin/owners/${id}/guilds`,
    {
      method: 'POST',
      body: (variables) => variables.payload,
      includeGuildId: false,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.ownerGuilds(variables.ownerId));
      },
    }
  );
};

export type RemoveGuildVariables = { ownerId: string; guildId: string };
export const useRemoveGuildFromOwner = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<RemoveGuildVariables>(
    ({ ownerId, guildId }) => `/admin/owners/${ownerId}/guilds/${guildId}`,
    {
      method: 'DELETE',
      includeGuildId: false,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.ownerGuilds(variables.ownerId));
      },
    }
  );
};

// --- Guild Management Hooks ---

export const useGetAllGuilds = () => {
  return useQueryBuilder<Guild[]>(
    ADMIN_QUERY_KEYS.guilds,
    () => '/admin/guilds'
  );
};

export const useGetGuildsForOwner = (ownerId: string | null | undefined) => {
  return useQueryBuilder<Guild[]>(
    ADMIN_QUERY_KEYS.ownerGuilds(ownerId!),
    () => `/admin/owners/${ownerId}/guilds`,
    { enabled: !!ownerId }
  );
};

export type ToggleGuildVariables = { guildId: string; payload: ToggleGuildStateDto };
export const useToggleGuildActivityState = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<ToggleGuildVariables>(
    ({ guildId, payload }) => `/admin/guilds/${guildId}/active`,
    {
      method: 'PATCH',
      includeGuildId: false,
      body: (variables) => variables.payload,
      onSuccess: (updatedGuild, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.guilds);
        queryClient.setQueryData<Guild[] | undefined>(ADMIN_QUERY_KEYS.guilds, (oldData) =>
          oldData?.map(guild => guild.id === variables.guildId ? updatedGuild : guild)
        );
      },
    }
  );
};

export type UpdateGuildVariables = { guildId: string; payload: Partial<Guild> };
export const useUpdateGuildMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Guild, UpdateGuildVariables>(
    ({ guildId }) => `/admin/guilds/${guildId}`,
    {
      method: 'PATCH',
      includeGuildId: false,
      onSuccess: (updatedGuild, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.guilds);
        queryClient.setQueryData<Guild[] | undefined>(ADMIN_QUERY_KEYS.guilds, (oldData) =>
          oldData?.map(guild => guild.id === variables.guildId ? updatedGuild : guild)
        );
      },
    }
  );
};

export type DeleteGuildVariables = { guildId: string };
export const useDeleteGuildMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, DeleteGuildVariables>(
    ({ guildId }) => `/admin/guilds/${guildId}`,
    {
      method: 'DELETE',
      includeGuildId: false,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.guilds);
        queryClient.setQueryData<Guild[] | undefined>(ADMIN_QUERY_KEYS.guilds, (oldData) =>
          oldData?.filter(guild => guild.id !== variables.guildId)
        );
      },
    }
  );
};

export type MoveGuildVariables = { guildId: string; groupId: string };
export const useMoveGuildMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, MoveGuildVariables>(
    ({ guildId, groupId }) => `/admin/guilds/${guildId}/group/${groupId}`,
    {
      method: 'PATCH',
      includeGuildId: false,
      onSuccess: () => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.guilds);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.groups);
      },
    }
  );
};

// --- Agency Management Hooks ---


// Define the structure the API actually returns based on your JSON example
interface RawAgencyGuild {
  agencyId: string;
  guildId: string;
  assignedAt: any; // Adjust type as needed (e.g., string, Date)
  guild: Guild; // The nested guild object
}

interface RawAgencyData extends Omit<Agency, 'agencyGuilds'> {
  agencyGuilds: RawAgencyGuild[];
}

export const useGetAllAgencies = () => {
  // Fetch RawAgencyData[], transform into Agency[] using the select option
  return useQueryBuilder<AgencyDto[]>(
    ADMIN_QUERY_KEYS.agencies,
    () => '/admin/agencies',
    {
      select: (data) => {
        // Ensure data is an array before processing
        if (!Array.isArray(data)) {
          console.warn("useGetAllAgencies received non-array data:", data);
          return []; // Return empty array or handle error appropriately
        }
        // Map each agency in the raw data to the desired Agency structure
        return data.map(agency => {
           // Basic check for valid agency object
           if (!agency || typeof agency !== 'object') {
             console.warn("Invalid agency object found in data:", agency);
             return null; // Skip this invalid entry
           }
           return {
             ...agency,
             // Transform agencyGuilds: extract the nested 'guild' object from each item
             agencyGuilds: Array.isArray(agency.agencyGuilds)
               ? agency.agencyGuilds
                   .map(ag => ag?.guild) // Safely access the nested guild object
                   .filter((g): g is Guild => !!g) // Filter out any null/undefined guilds and assert type
               : [], // Default to an empty array if agencyGuilds isn't a valid array
           };
        }).filter((a): a is Agency => !!a); // Filter out any nulls resulting from invalid entries
      },
    }
  );
};

export const useGetAgencyById = (agencyId: string | null | undefined) => {
  return useQueryBuilder<Agency>(
    ADMIN_QUERY_KEYS.agencyById(agencyId!),
    () => `/admin/agencies/${agencyId}`,
    { enabled: !!agencyId }
  );
};

export type CreateAgencyVariables = { payload: CreateAgencyDto };
export const useCreateAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Omit<Agency, 'id'>, CreateAgencyVariables>(
    () => '/admin/agencies',
    {
      method: 'POST',
      includeGuildId: false,
      onSuccess: () => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
      },
    }
  );
};

export type UpdateAgencyVariables = { agencyId: string; payload: UpdateAgencyDto };
export const useUpdateAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<UpdateAgencyVariables>(
    ({ agencyId }) => `/admin/agencies/${agencyId}`,
    {
      method: 'PATCH',
      includeGuildId: false,
      body: (variables) => variables.payload, // Use only the payload for the request body
      onSuccess: (updatedAgency, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyById(variables.agencyId));
        queryClient.setQueryData(ADMIN_QUERY_KEYS.agencyById(variables.agencyId), updatedAgency);
        queryClient.setQueryData<Agency[] | undefined>(ADMIN_QUERY_KEYS.agencies, (oldData) =>
          oldData?.map(agency => agency.id === variables.agencyId ? updatedAgency : agency)
        );
      },
    }
  );
};

export type DeleteAgencyVariables = { agencyId: string };
export const useDeleteAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, DeleteAgencyVariables>(
    ({ agencyId }) => `/admin/agencies/${agencyId}`,
    {
      method: 'DELETE',
      includeGuildId: false,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyById(variables.agencyId));
        queryClient.removeQueries(ADMIN_QUERY_KEYS.agencyById(variables.agencyId));
        queryClient.setQueryData<Agency[] | undefined>(ADMIN_QUERY_KEYS.agencies, (oldData) =>
          oldData?.filter(agency => agency.id !== variables.agencyId)
        );
      },
    }
  );
};

// --- Agency-Guild Relationship Hooks ---

export const useGetGuildsForAgency = (agencyId: string | null | undefined) => {
  return useQueryBuilder<Guild[]>(
    ADMIN_QUERY_KEYS.agencyGuilds(agencyId!),
    () => `/admin/agencies/${agencyId}/guilds`,
    { enabled: !!agencyId }
  );
};

export type AssignGuildToAgencyVariables = { agencyId: string; guildId: string };
export const useAssignGuildToAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, AssignGuildToAgencyVariables>(
    ({ agencyId }) => `/admin/agencies/${agencyId}/guilds`,
    {
      method: 'POST',
      includeGuildId: false,
      body: ({ guildId }) => ({ guildId }),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.ownerGuilds(variables.userId));
      },
    }
  );
};

export type RemoveGuildFromAgencyVariables = { agencyId: string; guildId: string };
export const useRemoveGuildFromAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, RemoveGuildFromAgencyVariables>(
    ({ agencyId, guildId }) => `/admin/agencies/${agencyId}/guilds/${guildId}`,
    {
      method: 'DELETE',
      includeGuildId: false,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyGuilds(variables.agencyId));
      },
    }
  );
};

// --- Agency-Owner Relationship Hooks ---

export type AssignOwnerToAgencyVariables = { ownerId: string; agencyId: string };
export const useAssignOwnerToAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<AssignOwnerToAgencyVariables>(
    ({ ownerId, agencyId }) => `/admin/agencies/owners/${ownerId}/agency/${agencyId}`,
    {
      method: 'POST',
      includeGuildId: false,
      onSuccess: (updatedOwner, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.owners);
        queryClient.setQueryData<Owner[] | undefined>(ADMIN_QUERY_KEYS.owners, (oldData) =>
          oldData?.map(owner => owner.id === variables.ownerId ? updatedOwner : owner)
        );
      },
    }
  );
};

export type RemoveOwnerFromAgencyVariables = { ownerId: string };
export const useRemoveOwnerFromAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<RemoveOwnerFromAgencyVariables>(
    ({ ownerId }) => `/admin/agencies/owners/${ownerId}/agency`,
    {
      method: 'DELETE',
      includeGuildId: false,
      onSuccess: (updatedOwner, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.owners);
        queryClient.setQueryData<Owner[] | undefined>(ADMIN_QUERY_KEYS.owners, (oldData) =>
          oldData?.map(owner => owner.id === variables.ownerId ? updatedOwner : owner)
        );
      },
    }
  );
};

// --- User Management Hooks ---

export type UpdateUserVariables = { userId: string; payload: Partial<User> };
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  // TData = User (expected API response), TVariables = UpdateUserVariables (input to mutation)
  return useModifyBuilder<User, UpdateUserVariables>(
    // URL builder function receives TVariables
    (variables: UpdateUserVariables) => `/admin/users/${variables.userId}`,
    {
      method: 'PATCH',
      includeGuildId: false,
      // onSuccess receives (data: TData, variables: TVariables)
      onSuccess: (updatedUser: User, variables: UpdateUserVariables) => {
        // Invalidate query to refetch in the background
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.users);
        // Optimistically update the query cache
        queryClient.setQueryData<User[] | undefined>(
          ADMIN_QUERY_KEYS.users,
          (oldData): User[] | undefined => // Explicit return type for updater
            oldData?.map((user: User) => // Explicit type for user in map
              user.id === variables.userId ? updatedUser : user
            )
        );
      },
    }
  );
};

export type DeleteUserVariables = { userId: string };
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, DeleteUserVariables>(
    ({ userId }) => `/admin/users/${userId}`,
    {
      method: 'DELETE',
      includeGuildId: false,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.users);
        queryClient.setQueryData<User[] | undefined>(ADMIN_QUERY_KEYS.users, (oldData) =>
          oldData?.filter(user => user.id !== variables.userId)
        );
      },
    }
  );
};

export type CreateUserVariables = { 
  payload: {
    email: string;
    name: string;
    role: OwnerRole;
    password: string;
    agencyId?: string;
    guildId?: string;
  }
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Owner, CreateUserVariables>(
    () => `/auth/register`,
    {
      method: 'POST',
      includeGuildId: false,
      body: (variables) => variables.payload,
      onSuccess: () => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.owners);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
      },
    }
  );
};

// --- Group Management Hooks ---

export const useGetAllGroups = () => {
  return useQueryBuilder<Group[]>(
    ADMIN_QUERY_KEYS.groups,
    () => '/admin/groups'
  );
};

export type UpdateGroupVariables = { groupId: string; payload: Partial<Group> };
export const useUpdateGroupMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Group, UpdateGroupVariables>(
    ({ groupId }) => `/admin/groups/${groupId}`,
    {
      method: 'PATCH',
      includeGuildId: false,
      onSuccess: (updatedGroup, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.groups);
        queryClient.setQueryData<Group[] | undefined>(ADMIN_QUERY_KEYS.groups, (oldData) =>
          oldData?.map(group => group.id === variables.groupId ? updatedGroup : group)
        );
      },
    }
  );
};

export type DeleteGroupVariables = { groupId: string };
export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, DeleteGroupVariables>(
    ({ groupId }) => `/admin/groups/${groupId}`,
    {
      method: 'DELETE',
      includeGuildId: false,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.groups);
        queryClient.setQueryData<Group[] | undefined>(ADMIN_QUERY_KEYS.groups, (oldData) =>
          oldData?.filter(group => group.id !== variables.groupId)
        );
      },
    }
  );
};

export type AddGroupVariables = { payload: Partial<Group> };
export const useAddGroupMutation = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Group, AddGroupVariables>(
    () => '/admin/groups',
    {
      method: 'POST',
      includeGuildId: false,
      onSuccess: () => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.groups);
      },
    }
  );
};
