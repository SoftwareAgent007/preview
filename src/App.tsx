import { ThemeProvider } from "./components/theme/ThemeProvider"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard/index"
import KeywordAnalytics from "./pages/KeywordsAnalytics/index" 
import UserActivityAnalytics from "./pages/UserActivityAnalytics/index"
import StatusAnalytics from "./pages/UsersDetailedActivityAnalytics/StatusAnalytics/index"
import GamingAnalytics from "./pages/UsersDetailedActivityAnalytics/GamingAnalytics/index"
import PresenceAnalytics from "./pages/UsersDetailedActivityAnalytics/PresenceAnalytics/index"
import UsersDetailedActivityAnalytics from "./pages/UsersDetailedActivityAnalytics/index.tsx"
import MusicMetrics from "./pages/MusicMetrics/index"
import Header from "./components/common/Header.tsx"

function App() {
  return (
    // <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Header />
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
        </Routes>
      </BrowserRouter>
    // </ThemeProvider>
  )
}

export default App
