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
import { DEFAULT_DATE_RANGE, DEFAULT_START_DATE, DEFAULT_END_DATE } from "./hooks/apiService.ts";
import AssignGuild from "./pages/Auth/AssignGuild.tsx";
import Admin from "./pages/Admin/index.tsx";
import AuditLogs from "./pages/AuditLogs/index.tsx";
import AgencyPartnerDashboard from "./pages/AgencyManage/AgencyPartnerDashboard.tsx";
import ClientDashboard from "./pages/AgencyManage/ClientDashboard.tsx";
import RoleProtectedRoute from "./components/common/RoleProtectedRoute.tsx";

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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initialGuildId = user.guildIds?.includes("1306748279903621142") ? "1306748279903621142" : (localStorage.getItem('selected_guild') || user.guildIds || '');
  const [guildId, setGuildId] = useState<string>(initialGuildId);
  
  const handleSetPeriod = (period: DateRange) => {
    setSelectedPeriod(period);
    localStorage.setItem('dashboard_period', JSON.stringify({
      from: period.from?.toISOString(),
      to: period.to?.toISOString()
    }));
  };

  const handleSetGuildId = (id: string) => {
    setGuildId(id);
    // localStorage.setItem('selected_guild', id);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <DashboardContext.Provider 
              value={{ 
                selectedPeriod,
                setSelectedPeriod: handleSetPeriod, 
                startDate: selectedPeriod.from?.toISOString() || DEFAULT_START_DATE,
                endDate: selectedPeriod.to?.toISOString() || DEFAULT_END_DATE,
                guildId,
                setGuildId: handleSetGuildId
              }}
            >
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public routes */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                  </Route>
                  
                  {/* Semi-protected route - requires auth but no guild */}
                  <Route element={<ProtectedRoute allowNoGuild />}>
                    <Route path="/assign-guild" element={<AssignGuild />} />
                  </Route>

                  {/* Protected routes - require both auth and guild */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout children/>}>
                      {/* Routes accessible to all authenticated users */}
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
                      
                      {/* Admin-only routes */}
                      <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="admin" element={<Admin />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                      </Route>
                      
                      {/* Agency Partner routes */}
                      <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'AGENCY_PARTNER']} />}>
                        <Route path="agency-partner-dashboard" element={<AgencyPartnerDashboard />} />
                      </Route>
                      
                      {/* Client routes */}
                      <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'CLIENT']} />}>
                        <Route path="client-dashboard" element={<ClientDashboard />} />
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </AnimatePresence>
            </DashboardContext.Provider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
