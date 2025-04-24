import { useMemo } from 'react';
import { useGuildsData, Guild } from './useGuildsData';

export const useGuildInfo = (guildId: string | undefined) => {
  const { guilds, isLoading } = useGuildsData();
  
  const guildInfo = useMemo(() => {
    if (!guildId || guilds.length === 0) return null;
    return guilds.find(guild => guild.id === guildId) || null;
  }, [guildId, guilds]);

  return {
    guild: guildInfo,
    guildName: guildInfo?.name || 'Unknown Guild',
    isLoading
  };
}; 