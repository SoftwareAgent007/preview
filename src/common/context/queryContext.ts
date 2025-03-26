import { createContext, useContext } from 'react';
import { DateRange } from 'react-day-picker';
import { DEFAULT_START_DATE, DEFAULT_END_DATE } from '@/hooks/apiService';

export interface DashboardContextType {
  selectedPeriod?: DateRange;
  guildId: string;
  setSelectedPeriod: (period: DateRange) => void;
  setGuildId: (id: string) => void;
  startDate: string;
  endDate: string;
}

export const DashboardContext = createContext<DashboardContextType>({
  selectedPeriod: {
    from: new Date(DEFAULT_START_DATE),
    to: new Date(DEFAULT_END_DATE)
  },
  guildId: '',
  setSelectedPeriod: () => {},
  setGuildId: () => {},
  startDate: DEFAULT_START_DATE,
  endDate: DEFAULT_END_DATE
});

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};