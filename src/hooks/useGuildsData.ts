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

export const useGuildsData = (guildIds?: string[]) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { data, isLoading, error } = useQueryBuilder<Guild[]>(
    ['guilds', guildIds],
    () =>
      `/owners/${user.id}/guilds`
  );

  return {
    guilds: data || [],
    isLoading,
    error
  } as const;
};