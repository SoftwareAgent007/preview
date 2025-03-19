import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AnimatePresence } from "framer-motion"
import { useState } from 'react';
import Dashboard from "./pages/Dashboard/index";
import KeywordAnalytics from "./pages/KeywordsAnalytics/index"; 
import UserActivityAnalytics from "./pages/UserActivityAnalytics/index";
import StatusAnalytics from "./pages/UsersDetailedActivityAnalytics/StatusAnalytics/index";
import GamingAnalytics from "./pages/UsersDetailedActivityAnalytics/GamingAnalytics/index";
import PresenceAnalytics from "./pages/UsersDetailedActivityAnalytics/PresenceAnalytics/index";
import UsersDetailedActivityAnalytics from "./pages/UsersDetailedActivityAnalytics/index.tsx";
import MessageReactionsAnalytics from "./pages/MessageReactionsAnalytics/index.tsx";
import MusicMetrics from "./pages/MusicMetrics/index";
import DashboardLayout from "./components/common/layout/DashboardLayout.tsx";
import { DashboardContext } from "./common/context/queryContext.ts";
import { DateRange } from "react-day-picker";

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: false, 
      retryOnMount: false,
      onError: (error: unknown) => {
        if (
          (error as { response?: { status?: number } })?.response?.status === 404 ||
          (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes('CORS'))
        ) {
          return false; 
        }
      }    
    } 
  },
});

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>({ from: new Date(), to: new Date() });
  const [guildId, setGuildId] = useState('');

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <DashboardContext.Provider value={{ selectedPeriod, guildId, setSelectedPeriod, setGuildId }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />}/>
                <Route path="keyword-analytics" element={<KeywordAnalytics />} />
                <Route path="user-activity" element={<UserActivityAnalytics />} />
                <Route path="user-activity/detailed" element={<UsersDetailedActivityAnalytics />}>
                  <Route path="status" element={<StatusAnalytics />} />
                  <Route path="gaming" element={<GamingAnalytics />} />
                  <Route path="presence" element={<PresenceAnalytics />} />
                </Route>
                <Route path="music-metrics" element={<MusicMetrics />} />
                <Route path="message-reactions" element={<MessageReactionsAnalytics />} />
              </Routes>
            </DashboardLayout>
          </AnimatePresence>
        </BrowserRouter>
      </QueryClientProvider>
      </DashboardContext.Provider>
    </ThemeProvider>
  );
}

export default App;