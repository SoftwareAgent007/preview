import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { Download, Users } from "lucide-react";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import TrendIndicator from "@/components/common/TrendIndicator";
import AreaLineChart from "@/components/charts/AreaLineChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
// import { useEffect, useState } from "react";

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
    hourlyActivity,
    activeListeners,
    keywordStats,
    isLoading
  } = useDashboardData('month'); // Using month period for better data view

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // const [graphWidth, setGraphWidth] = useState(100);
  // const [graphHeight, setGraphHeight] = useState(100);

  // useEffect(() => {
      // const resizeObserver = new ResizeObserver((event) => {
      //     setGraphWidth(event[0].contentBoxSize[0].inlineSize);
      //     setGraphHeight(event[0].contentBoxSize[0].blockSize);
      // });

      // resizeObserver.observe(document.querySelectorAll(".chart-parent"));
  // });

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
              <div className="chart-parent flex justify-between">
                <AreaLineChart data={userActivityTimeline} width={543} height={300}/>
              </div>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Message Activity</span>
              <div className="flex justify-between">
                <AreaLineChart data={messageFrequency} width={543} height={300} graphColor="#b1c4f5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between gap-6 mb-6">
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Current Activities</span>
              <div className="grid grid-cols-6 bg-blue-100/40 mb-5 rounded-xl">
                <div className="flex items-center justify-center p-4">
                  <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png" alt="Spotify Logo" className="w-8 h-8" />
                </div>
                <div className="col-span-5 p-4">
                  <div>
                    <span className="text-xl font-bold text-gray-600">Spotify Listeners</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium mr-2">{currentActivities.spotifyListeners}</span>
                    <span className="text-gray-500 font-medium">users</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-6 bg-blue-100/40 rounded-xl">
                <div className="flex items-center justify-center p-4">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <div className="col-span-5 p-4">
                  <div>
                    <span className="text-xl font-bold text-gray-600">Active Gamers</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium mr-2">{currentActivities.gamers}</span>
                    <span className="text-gray-500 font-medium">users</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="w-[35%] p-4 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-sm font-bold mb-2">Top Keywords</span>
              {topKeywords.map((keyword, index) => (
                <div key={index} className="grid grid-cols-6 bg-blue-100/40 mb-1 rounded-xl">
                  <div className="flex items-center justify-center p-2">
                    <span className="text-gray-600 text-3xl">#</span>
                  </div>
                  <div className="col-span-5 p-2">
                    <div>
                      <span className="text-lg font-bold text-gray-600">{keyword.keyword}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium mr-1">{keyword.count}</span>
                      <span className="text-gray-500 font-medium">matches</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Top Users</span>
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center mb-2 p-2 rounded-lg bg-blue-100/40">
                  <Users className="w-8 h-8 text-gray-600 mr-3" />
                  <div className="flex justify-between w-full">
                    <span className="font-medium text-gray-700">{user.user}</span>
                    <span className="text-gray-500">{user.messageCount} messages</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-between gap-6">
          <Card className="flex-1 p-6 h-150">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Hourly Activity</span>
              <HorizontalBarChart data={hourlyActivity} height={500} width={600} />
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
