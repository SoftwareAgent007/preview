import { useQueryBuilder } from "./analytics/common/useQueryBuilder";

export interface Guild {
  id: string;
  name: string;
  joinedAt: Date;
  memberCount: number;
  assignedPodName: string | null;
  shardId: number;
  eventsPerSecond: number;
  active: boolean;
}

/**
 * Hook to fetch guilds for a specific owner
 * Uses the /auth/guilds/:id endpoint from AuthController
 */
export const useGuildsData = (ownerId: string) => {
  const { data, isLoading, error } = useQueryBuilder<Guild[]>(
    ['guilds', ownerId],
    () => `/auth/guilds/${ownerId}`
  );

  return {
    guilds: data || [],
    isLoading,
    error
  } as const;
};