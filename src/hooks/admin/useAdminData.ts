import { useQueryBuilder } from '../analytics/common/useQueryBuilder';
import { useModifyBuilder } from '../analytics/common/useModifyBuilder';
import { useQueryClient } from 'react-query';
import {
  Owner,
  Guild,
  UpdateOwnerRolePayload,
  AssignGuildPayload,
  ToggleGuildStatePayload,
  SuccessResponse,
  OwnerGuild,
  ApiError,
  // --- New Agency Types (Define these based on actual API structure) ---
  Agency,
  CreateAgencyDto,
  UpdateAgencyDto,
  AssignAgencyGuildDto,
} from './admin.types';

const ADMIN_QUERY_KEYS = {
  owners: ['admin', 'owners'],
  guilds: ['admin', 'guilds'],
  ownerGuilds: (ownerId: string) => ['admin', 'owners', ownerId, 'guilds'],
  agencies: ['admin', 'agencies'],
  agencyById: (agencyId: string) => ['admin', 'agencies', agencyId],
  agencyGuilds: (agencyId: string) => ['admin', 'agencies', agencyId, 'guilds'],
};

// --- Owner Management Hooks ---

export const useGetAllOwners = () => {
  return useQueryBuilder<Owner[]>(
    ADMIN_QUERY_KEYS.owners,
    () => '/admin/owners'
  );
};

type UpdateOwnerRoleVariables = { ownerId: string; payload: UpdateOwnerRolePayload };
export const useUpdateOwnerRole = () => {
  const queryClient = useQueryClient();
  // Note: If lint errors persist, the generic order or definition of useModifyBuilder might need review.
  // It's expected to be <TResponse, TVariables>
  return useModifyBuilder<Owner, UpdateOwnerRoleVariables>(
    ({ ownerId }) => `/admin/owners/${ownerId}/role`,
    {
      method: 'PATCH',
      onSuccess: (updatedOwner, variables) => {
        // Optimistic update or specific item invalidation could be better
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.owners);
        // Maybe update the specific owner query if one exists
        // queryClient.setQueryData(ADMIN_QUERY_KEYS.ownerById(variables.ownerId), updatedOwner);
      },
    }
  );
};

type AssignGuildVariables = { ownerId: string; payload: AssignGuildPayload };
export const useAssignGuildToOwner = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<OwnerGuild, AssignGuildVariables>( // Assuming OwnerGuild is the response type for assigning
    ({ ownerId }) => `/admin/owners/${ownerId}/guilds`,
    {
      method: 'POST',
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.ownerGuilds(variables.ownerId));
        // Consider invalidating the specific owner's details if it includes guild list
        // queryClient.invalidateQueries(['admin', 'owners', variables.ownerId]);
      },
    }
  );
};

type RemoveGuildVariables = { ownerId: string; guildId: string };
export const useRemoveGuildFromOwner = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, RemoveGuildVariables>(
    ({ ownerId, guildId }) => `/admin/owners/${ownerId}/guilds/${guildId}`,
    {
      method: 'DELETE',
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.ownerGuilds(variables.ownerId));
        // Consider invalidating the specific owner's details
        // queryClient.invalidateQueries(['admin', 'owners', variables.ownerId]);

        // Optimistic update example (remove guild from cache):
        // queryClient.setQueryData<Guild[] | undefined>(
        //   ADMIN_QUERY_KEYS.ownerGuilds(variables.ownerId),
        //   (oldData) => oldData?.filter(guild => guild.id !== variables.guildId)
        // );
      },
      // onError: (error, variables, context) => {
      //   // Rollback optimistic update if needed
      //   queryClient.invalidateQueries(ADMIN_QUERY_KEYS.ownerGuilds(variables.ownerId));
      // }
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
    ADMIN_QUERY_KEYS.ownerGuilds(ownerId!), // Non-null assertion ok due to enabled flag
    () => `/admin/owners/${ownerId}/guilds`,
    { enabled: !!ownerId } // Only run query if ownerId is provided
  );
};

type ToggleGuildVariables = { guildId: string; payload: ToggleGuildStatePayload };
export const useToggleGuildActivityState = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Guild, ToggleGuildVariables>( // Assuming the updated Guild is returned
    ({ guildId }) => `/admin/guilds/${guildId}/active`,
    {
      method: 'PATCH',
      onSuccess: (updatedGuild, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.guilds);
        // Also invalidate any specific guild queries if they exist
        // queryClient.invalidateQueries(['admin', 'guilds', variables.guildId]);

        // Update cache directly for faster UI response
        queryClient.setQueryData<Guild[] | undefined>(ADMIN_QUERY_KEYS.guilds, (oldData) =>
          oldData?.map(guild => guild.id === variables.guildId ? updatedGuild : guild)
        );
      },
    }
  );
};







// --- Agency Management Hooks ---

export const useGetAllAgencies = () => {
  return useQueryBuilder<Agency[]>(
    ADMIN_QUERY_KEYS.agencies,
    () => '/admin/agencies'
  );
};

export const useGetAgencyById = (agencyId: string | null | undefined) => {
  return useQueryBuilder<Agency>(
    ADMIN_QUERY_KEYS.agencyById(agencyId!),
    () => `/admin/agencies/${agencyId}`,
    { enabled: !!agencyId }
  );
};

type CreateAgencyVariables = { payload: CreateAgencyDto };
export const useCreateAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Agency, CreateAgencyVariables>(
    () => '/admin/agencies',
    {
      method: 'POST',
      onSuccess: () => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
      },
    }
  );
};

type UpdateAgencyVariables = { agencyId: string; payload: UpdateAgencyDto };
export const useUpdateAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<Agency, UpdateAgencyVariables>(
    ({ agencyId }) => `/admin/agencies/${agencyId}`,
    {
      method: 'PATCH',
      onSuccess: (updatedAgency, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyById(variables.agencyId));
        // Optimistic update
        queryClient.setQueryData(ADMIN_QUERY_KEYS.agencyById(variables.agencyId), updatedAgency);
        queryClient.setQueryData<Agency[] | undefined>(ADMIN_QUERY_KEYS.agencies, (oldData) =>
          oldData?.map(agency => agency.id === variables.agencyId ? updatedAgency : agency)
        );
      },
    }
  );
};

type DeleteAgencyVariables = { agencyId: string };
export const useDeleteAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, DeleteAgencyVariables>(
    ({ agencyId }) => `/admin/agencies/${agencyId}`,
    {
      method: 'DELETE',
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencies);
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyById(variables.agencyId));
        // Remove from cache
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

type AssignGuildToAgencyVariables = { agencyId: string; payload: AssignAgencyGuildDto };
export const useAssignGuildToAgency = () => {
  const queryClient = useQueryClient();
  // Assuming response is SuccessResponse or the updated Agency/Guild list
  return useModifyBuilder<SuccessResponse, AssignGuildToAgencyVariables>(
    ({ agencyId }) => `/admin/agencies/${agencyId}/guilds`,
    {
      method: 'POST',
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyGuilds(variables.agencyId));
        // Maybe invalidate agency details if it includes guilds
        // queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyById(variables.agencyId));
      },
    }
  );
};

type RemoveGuildFromAgencyVariables = { agencyId: string; guildId: string };
export const useRemoveGuildFromAgency = () => {
  const queryClient = useQueryClient();
  return useModifyBuilder<SuccessResponse, RemoveGuildFromAgencyVariables>(
    ({ agencyId, guildId }) => `/admin/agencies/${agencyId}/guilds/${guildId}`,
    {
      method: 'DELETE',
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyGuilds(variables.agencyId));
        // queryClient.invalidateQueries(ADMIN_QUERY_KEYS.agencyById(variables.agencyId));
      },
    }
  );
};

// --- Agency-Owner Relationship Hooks ---

type AssignOwnerToAgencyVariables = { ownerId: string; agencyId: string };
export const useAssignOwnerToAgency = () => {
  const queryClient = useQueryClient();
  // Assuming response is the updated Owner or SuccessResponse
  return useModifyBuilder<Owner, AssignOwnerToAgencyVariables>(
    ({ ownerId, agencyId }) => `/admin/owners/${ownerId}/agency/${agencyId}`,
    {
      method: 'POST',
      onSuccess: (updatedOwner, variables) => {
        // Invalidate the specific owner and the list of all owners
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.owners);
        // If you have a query for a single owner:
        // queryClient.invalidateQueries(['admin', 'owners', variables.ownerId]);
        // Update owner cache
        queryClient.setQueryData<Owner[] | undefined>(ADMIN_QUERY_KEYS.owners, (oldData) =>
          oldData?.map(owner => owner.id === variables.ownerId ? updatedOwner : owner)
        );
      },
    }
  );
};

type RemoveOwnerFromAgencyVariables = { ownerId: string };
export const useRemoveOwnerFromAgency = () => {
  const queryClient = useQueryClient();
  // Assuming response is the updated Owner (without agency) or SuccessResponse
  return useModifyBuilder<Owner, RemoveOwnerFromAgencyVariables>(
    ({ ownerId }) => `/admin/owners/${ownerId}/agency`,
    {
      method: 'DELETE',
      onSuccess: (updatedOwner, variables) => {
        queryClient.invalidateQueries(ADMIN_QUERY_KEYS.owners);
        // queryClient.invalidateQueries(['admin', 'owners', variables.ownerId]);
         queryClient.setQueryData<Owner[] | undefined>(ADMIN_QUERY_KEYS.owners, (oldData) =>
          oldData?.map(owner => owner.id === variables.ownerId ? updatedOwner : owner)
        );
      },
    }
  );
};
