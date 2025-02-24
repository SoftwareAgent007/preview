import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import CircleRoleChart from "@/components/charts/circleChartOfRoles";
import { useGamingAnalyticsResponse } from "@/hooks/fetchData";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";
import TopGamesList from "./components/TopGamesList";

const GamingAnalytics = () => {
  const gamingAnalyticsResponse = useGamingAnalyticsResponse();
  const { 
    activeUsers,
    avgSessionTime = 0,
    totalGameTime = 0,
    peakPlayers = 0,
    activeRolesPlayingNow = [],
    topGames = []
  } = gamingAnalyticsResponse || {};

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);

  const updateGraphWidth = () => {
    if (wrapperRef.current) {
      setGraphWidth(wrapperRef.current.offsetWidth / 2.3);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateGraphWidth);
    return () => window.removeEventListener("resize", updateGraphWidth);
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      updateGraphWidth();
    }
  }, [wrapperRef.current]);

  return (
    <div ref={wrapperRef} className="w-full bg-gray-50">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        
      <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Active Users</span>
              <span className="text-2xl font-bold">{activeUsers.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Currently active users</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Avg. Session Time</span>
              <span className="text-2xl font-bold">{avgSessionTime}</span>
              <span className="text-sm text-gray-500">Average session duration</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Peak Players</span>
              <span className="text-2xl font-bold">{peakPlayers.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Highest concurrent players</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Total Game Time</span>
              <span className="text-2xl font-bold">{totalGameTime.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Total hours played</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="grid gap-6">
            <TopGamesList topGames={topGames} />
            <Card className="p-6 h-[500px]">
              <UserActivityTimeline width={graphWidth} />
            </Card>
          </div>
          
          <div className="grid grid-rows-8 gap-6 h-[1000px]">
            <Card className="p-6 row-span-5">
              <CircleRoleChart data={activeRolesPlayingNow} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamingAnalytics;
