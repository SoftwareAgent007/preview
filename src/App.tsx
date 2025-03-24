import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AnimatePresence } from "framer-motion";
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
import DashboardLayout from "./components/common/layout/DashboardLayout";
import ForgotPassword from "./pages/Auth/ForgotPassword.tsx";
import Register from "./pages/Auth/Register.tsx";
import Login from "./pages/Auth/Login.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import ProtectedRoute from "./components/common/ProtectedRoute.tsx";
import PublicRoute from "./components/common/PublicRoute.tsx";
import { DashboardContext } from "./common/context/queryContext.ts";
import { DateRange } from "react-day-picker";
import { DEFAULT_DATE_RANGE } from "./hooks/apiService.ts";

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
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>(DEFAULT_DATE_RANGE);
  const [guildId, setGuildId] = useState('');

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <DashboardContext.Provider value={{ selectedPeriod, guildId, setSelectedPeriod, setGuildId }}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public routes */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                  </Route>
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout children/>}>
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
                    </Route>
                  </Route>
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </QueryClientProvider>
        </DashboardContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
