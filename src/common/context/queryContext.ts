import { createContext, useContext, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DEFAULT_START_DATE, DEFAULT_END_DATE } from '@/hooks/apiService';

export const STORAGE_KEY = 'dashboard_period';
export const GUILD_STORAGE_KEY = 'selected_guild';

export interface DashboardContextType {
  selectedPeriod?: DateRange;
  guildId: string;
  setGuildId: (id: string) => void;
  setSelectedPeriod: (period: DateRange) => void;
  startDate: string;
  endDate: string;
}

const getStoredPeriod = (): DateRange => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      from: new Date(parsed.from),
      to: new Date(parsed.to)
    };
  }
  return {
    from: new Date(DEFAULT_START_DATE),
    to: new Date(DEFAULT_END_DATE)
  };
};

export const DashboardContext = createContext<DashboardContextType>({
  selectedPeriod: getStoredPeriod(),
  guildId: localStorage.getItem(GUILD_STORAGE_KEY) || '',
  setSelectedPeriod: (period: DateRange) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      from: period.from?.toISOString(),
      to: period.to?.toISOString()
    }));
  },
  setGuildId: (id: string) => {
    localStorage.setItem(GUILD_STORAGE_KEY, id);
  },
  startDate: DEFAULT_START_DATE,
  endDate: DEFAULT_END_DATE
});

export const useDashboardContext = (): Required<DashboardContextType> => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context as Required<DashboardContextType>;
};