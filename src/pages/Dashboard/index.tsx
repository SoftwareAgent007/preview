import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { Download } from "lucide-react";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import TrendIndicator from "@/components/common/TrendIndicator";

const Dashboard = () => {
  const {
    totalUsers,
    activeUsers,
    totalMessages,
    totalReactions,
    topKeywords,
    topUsers,
    currentActivities,
    userActivityTimeline,
    messageFrequency,
    peakActivityTime,
    totalGameTime,
    activeListeners,
    keywordStats,
    isLoading
  } = useDashboardData('month'); // Using month period for better data view

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.DASHBOARD]} />
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Full Report
          </Button>
        </div>

        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Total Users</span>
              <span className="text-2xl font-bold">{totalUsers.toLocaleString()}</span>
              <span className="text-sm text-gray-500">New users this period</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Active Users</span>
              <span className="text-2xl font-bold">{activeUsers.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Currently active users</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Total Messages</span>
              <span className="text-2xl font-bold">{totalMessages.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Messages this period</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Total Reactions</span>
              <span className="text-2xl font-bold">{totalReactions.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Reactions this period</span>
            </div>
          </Card>
        </div>

        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">User Activity</span>
              <div className="flex justify-between">
                <pre className="text-sm">
                  {JSON.stringify(userActivityTimeline, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Message Activity</span>
              <div className="flex justify-between">
                <pre className="text-sm">
                  {JSON.stringify(messageFrequency, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between gap-6 mb-6">
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Current Activities</span>
              <div className="flex justify-between mb-2">
                <span>Spotify Listeners</span>
                <span>{currentActivities.spotifyListeners}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Gamers</span>
                <span>{currentActivities.gamers}</span>
              </div>
            </div>
          </Card>
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Top Keywords</span>
              {topKeywords.map((keyword, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span>{keyword.keyword}</span>
                  <span>{keyword.count} matches</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Top Users</span>
              {topUsers.map((user, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span>{user.user}</span>
                  <span>{user.messageCount} messages</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-between gap-6">
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Hourly Activity</span>
              {/* Here you could add a chart using hourlyActivity data */}
            </div>
          </Card>
          <div className="flex-1 grid grid-cols-2 h-60 gap-6">
            <Card className="p-6 р-50">
              <div className="h-full flex flex-col justify-between">
                <span className="text-gray-500 text-sm font-medium">Peak Activity Time</span>
                <div className="flex-1 flex items-center">
                  <span className="text-2xl font-bold">{peakActivityTime?.hour}:00</span>
                </div>
                <div className="text-sm text-gray-500 flex-row justify-between">
                  <span>{peakActivityTime?.count} users active</span>
                  <TrendIndicator unit={'%'} value={15} isPositive={true} />
                </div>
              </div>
            </Card>
            <Card className="p-6 р-50">
              <div className="h-full flex flex-col justify-between">
                <span className="text-gray-500 text-sm font-medium">Total Game Time</span>
                <div className="flex-1 flex items-center">
                  <span className="text-2xl font-bold">{Math.round(totalGameTime)}h</span>
                </div>
                <div className="text-sm text-gray-500 flex-row justify-between">
                  <TrendIndicator value={8} unit="h" isPositive={true} />
                </div>
              </div>
            </Card>
            <Card className="p-6 р-50">
              <div className="h-full flex flex-col justify-between">
                <span className="text-gray-500 text-sm font-medium">Active Listeners</span>
                <div className="flex-1 flex items-center">
                  <span className="text-2xl font-bold">{activeListeners}</span>
                </div>
                <div className="text-sm text-gray-500 flex-row justify-between">
                  <TrendIndicator unit={'%'} value={12} isPositive={false} />
                </div>
              </div>
            </Card>
            <Card className="p-6 р-50">
              <div className="h-full flex flex-col justify-between">
                <span className="text-gray-500 text-sm font-medium">Keywords</span>
                <div className="flex-1 flex items-center">
                  <span className="text-2xl font-bold">{keywordStats.total}</span>
                </div>
                <div className="text-sm text-gray-500 flex-row justify-between">
                  <span>{keywordStats.active} active</span>
                  <TrendIndicator unit={'%'} value={5} isPositive={true} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
