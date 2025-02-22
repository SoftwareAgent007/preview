import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import CircleRoleChart from "@/components/charts/circleChartOfRoles";
import { usePresenceAnalyticsResponse } from "@/hooks/fetchData";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";
import TopGamesList from "../GamingAnalytics/components/TopGamesList";
import HorizontalBarChart from "@/components/charts/hourActivity/horizontalBarChart";
import HorizontalTopHoursChart from "@/components/charts/hourActivity/horisontalTopHoursChart";
import InteractiveChart from "@/components/charts/userActivityTimeline/userPresenceActivityChart";

const PresenceAnalytics = () => {
  const presenceAnalyticsResponse = usePresenceAnalyticsResponse();
  const { 
    activeUsers,
    avgSessionTime = 0,
    totalPresenceTime = 0,
    peakUsers = 0,
    activeRolesNow = [],
    topActivities = [],
    hourlyActivity = [],
    statusCounts = []
  } = presenceAnalyticsResponse || {};

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
              <span className="text-gray-500 text-sm font-medium">Peak Users</span>
              <span className="text-2xl font-bold">{peakUsers.toLocaleString()}</span>
              <span className="text-sm text-gray-500">Highest concurrent users</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Total Presence Time</span>
              <span className="text-2xl font-bold">{totalPresenceTime.toLocaleString()}h</span>
              <span className="text-sm text-gray-500">Total hours present</span>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="flex-1 p-6">
            <InteractiveChart data={statusCounts} />
          </Card>
          <Card className="flex-1 p-6">
            <div className="flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Active Status (per last 7 days)</span>
              <CircleRoleChart data={activeRolesNow} />
              <div className="legend flex justify-center gap-8 mt-6 text-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md" style={{ backgroundColor: "#33FF57" }} />
                  <span className="text-lg font-medium">Online</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md" style={{ backgroundColor: "#FF5733" }} />
                  <span className="text-lg font-medium">Offline</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md" style={{ backgroundColor: "#FF33A8" }} />
                  <span className="text-lg font-medium">Idle</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md" style={{ backgroundColor: "#3357FF" }} />
                  <span className="text-lg font-medium">DND</span>
                </div>
              </div>
            </div>
          </Card>
          <Card className="flex-1 p-6">
            <div className="flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Peak Activity Hours</span>
              <span className="text-gray-500 text-sm mb-2">User activity distribution throughout the day</span>
              <HorizontalTopHoursChart data={hourlyActivity} height={500} width={500} />
            </div>
          </Card>
          <Card className="flex-1 p-6">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Hourly Activity</span>
              <HorizontalBarChart data={hourlyActivity} height={500} width={500} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PresenceAnalytics;
