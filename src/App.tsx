import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AnimatePresence } from "framer-motion"
import Dashboard from "./pages/Dashboard/index";
import KeywordAnalytics from "./pages/KeywordsAnalytics/index"; 
import UserActivityAnalytics from "./pages/UserActivityAnalytics/index";
import StatusAnalytics from "./pages/UsersDetailedActivityAnalytics/StatusAnalytics/index";
import GamingAnalytics from "./pages/UsersDetailedActivityAnalytics/GamingAnalytics/index";
import PresenceAnalytics from "./pages/UsersDetailedActivityAnalytics/PresenceAnalytics/index";
import UsersDetailedActivityAnalytics from "./pages/UsersDetailedActivityAnalytics/index.tsx";
import MessageReactionsAnalytics from "./pages/MessageReactionsAnalytics/index.tsx";
import MusicMetrics from "./pages/MusicMetrics/index";
import Header from "./components/common/Header.tsx";
import DashboardLayout from "./components/common/layout/DashboardLayout.tsx";

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: false, 
      retryOnMount: false,
      onError: (error) => {
        if (error.response?.status === 404 || error.message.includes('CORS')) {
          return false; 
        }
      }
    } 
  },
});


{/* <BrowserRouter>
<div className="flex flex-col h-screen">
  <Header className="fixed top-0 left-0 w-full h-14 bg-white shadow-md z-50" />
  
</div>
</BrowserRouter> */}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
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
    </ThemeProvider>
  );
}

export default App;
