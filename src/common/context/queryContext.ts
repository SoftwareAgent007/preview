import { createContext, useContext } from 'react';
import { DateRange } from 'react-day-picker';

export interface DashboardContextType {
  selectedPeriod: DateRange;
  guildId: string;
  setSelectedPeriod: (period: DateRange) => void;
  setGuildId: (id: string) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};