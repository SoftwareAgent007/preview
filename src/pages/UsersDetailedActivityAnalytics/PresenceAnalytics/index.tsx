import CircleRoleChart from "@/components/charts/circleChartOfRoles";
import HorizontalTopHoursChart from "@/components/charts/hourActivity/HorisontalTopHoursChart";
import HorizontalBarChart from "@/components/charts/hourActivity/HorizontalBarChart";
import PresenceWeekActivityChart from "@/components/charts/userActivityTimeline/presenceActivityChart/userPresenceWeekActivityChart";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { usePresenceActivity } from "@/hooks/analytics/usePresenceAnalytics";
import { useRef } from "react";

const PresenceAnalytics = () => {
  const { overview, statusBreakdown, hourlyActivity, peakHours } = usePresenceActivity("guildId", "week");
  const { 
    activeUsers,
    avgSessionTime,
    totalPresenceTime,
    peakUsers,
  } = overview || {};

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={wrapperRef} className="w-full bg-gray-50">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        
        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Active Users</span>
              <span className="text-2xl font-bold">{activeUsers?.count.toLocaleString()}</span>
              <span className="text-sm text-gray-500">{activeUsers?.label}</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Avg. Session Time</span>
              <span className="text-2xl font-bold">{avgSessionTime?.hours}h {avgSessionTime?.minutes}m</span>
              <span className="text-sm text-gray-500">{avgSessionTime?.label}</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Peak Users</span>
              <span className="text-2xl font-bold">{peakUsers?.count.toLocaleString()}</span>
              <span className="text-sm text-gray-500">{peakUsers?.label}</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Total Presence Time</span>
              <span className="text-2xl font-bold">{totalPresenceTime?.hours}h</span>
              <span className="text-sm text-gray-500">{totalPresenceTime?.label}</span>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <PresenceWeekActivityChart  />
          <Card className="flex-1 p-6">
            <div className="flex flex-col">
              <div className="title">
                <span className="text-gray-500 text-lg font-bold mb-4 mr-5">Active Status</span>
                <ClickableTooltip content={<p><strong>Active States: </strong> A chart showing the ratio of users who are online, AFK (away from keyboard), in "Do Not Disturb" mode, and offline leaders over the last seven days.</p>}>
                  <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                </ClickableTooltip>
              </div>
              <CircleRoleChart data={statusBreakdown} />
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
          <Card className="flex-1 h-min p-6">
            <div className="flex h-min flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Peak Activity Hours</span>
              <span className="text-gray-500 text-sm mb-2">User activity distribution throughout the day</span>
              <HorizontalTopHoursChart data={peakHours} height={400} width={500} />
            </div>
          </Card>
          <Card className="flex-1 p-6">
            <div className="h-full flex flex-col">
              <div className="title">
                <span className="text-gray-500 text-lg font-bold mb-4 mr-5">Hourly Activity</span>
                <ClickableTooltip content={<p><strong>Hourly Activity:</strong> Displays the number of users at different hours of the day.</p>}>
                  <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                </ClickableTooltip>
              </div>
              <HorizontalBarChart data={hourlyActivity.hourlyDistribution} height={500} width={500} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PresenceAnalytics;