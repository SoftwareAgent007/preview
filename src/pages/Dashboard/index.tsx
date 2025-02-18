import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { Download, Users } from "lucide-react";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import TrendIndicator from "@/components/common/TrendIndicator";
import AreaLineChart from "@/components/charts/AreaLineChart";
import HorizontalBarChart from "@/components/charts/hourActivity/HorizontalBarChart";
import ListElement from "@/components/ui/list-element";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";
import MessageFrequencyChart from "@/components/charts/userActivityTimeline/messageFrequencyChart";
import { useRef, useEffect, useState } from "react";

const Dashboard = () => {
  const {
    totalUsers,
    activeUsers,
    totalMessages,
    totalReactions,
    topKeywords,
    topUsers,
    currentActivities,
    peakActivityTime,
    totalGameTime,
    hourlyActivity,
    activeListeners,
    keywordStats,
    isLoading
  } = useDashboardData('month'); // Using month period for better data view

  const fontSize = {
    amountTitle: 'text-2xl font-bold',
    cardTitle: 'text-sm font-medium',
    defaultInfo: 'text-sm text-gray-500',
  };

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);

  const updateGraphWidth = () => {
    if (wrapperRef.current) {
      setGraphWidth(wrapperRef.current.offsetWidth / 2.3);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateGraphWidth);
    return () => window.removeEventListener('resize', updateGraphWidth);
  }, []);

  useEffect(() => {
    if (!isLoading && wrapperRef.current) {
      console.log("wrapperRef.current?.offsetHeight", wrapperRef.current.offsetHeight);
      updateGraphWidth();
    }  
  }, [isLoading, wrapperRef.current]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div id="dashboard-wrapper" ref={wrapperRef} className="block mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
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
            <UserActivityTimeline width={graphWidth} />
          </Card>
          <Card className="flex-1 p-6 h-100">
            <MessageFrequencyChart width={graphWidth} />
          </Card>
        </div>

        <div className="flex justify-between gap-6 mb-6">
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Current Activities</span>
              <ListElement logo={<Users className="w-8 h-8 text-gray-600" />} title="Active Gamers" description={`${currentActivities.gamers} users`} />
              <ListElement 
                logo={<img src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png" alt="Spotify Logo" className="w-8 h-8" />} 
                title="Spotify Listeners" 
                description={`${currentActivities.spotifyListeners} users`} 
              />
            </div>
          </Card>
          <Card className="w-[35%] p-4 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-sm font-bold mb-2">Top Keywords</span>
              {topKeywords.map((keyword, index) => (
                <ListElement 
                  key={index} 
                  logo={<span className="text-gray-600 text-3xl">#</span>} 
                  title={keyword.keyword} 
                  description={`${keyword.count} matches`} 
                />
              ))}
            </div>
          </Card>
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Top Users</span>
              {topUsers.map((user, index) => (
                <ListElement 
                  key={index} 
                  logo={<Users className="w-8 h-8 text-gray-600" />} 
                  title={user.user} 
                  description={`${user.messageCount} messages`} 
                  backgroundColor="" // Turn off background
                />
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
                  <span className="text-2xl font-bold">h</span>
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
