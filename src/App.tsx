import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout children={<></>}/>}>
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
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;
