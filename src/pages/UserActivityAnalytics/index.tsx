import ActivityCharts from "@/components/charts/userActivityTimeline/expandedUserActivityCharts";
import RolesChart from "@/components/charts/userActivityTimeline/userRolesChart";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { ActivityData } from "@/components/common/types/userAnalytic.types";
import { Card } from "@/components/ui/card";
import { usePlayingStatisticData } from "@/hooks/analytics/usePlayingStatisticData";
import { useUsersActivityData } from "@/hooks/fetchData";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import TrendIndicator from "@/components/common/TrendIndicator"; 

const UserActivityAnalytics = () => {
  const data: ActivityData = useUsersActivityData();
  const { playingUserStats } = usePlayingStatisticData();

  
  const mockedJoins = 120; 
  const mockedLeaves = 80; 

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.USER_ACTIVITY]} />
        </div>

        <div className="flex flex-col items-center gap-6">
          <ActivityCharts data={playingUserStats} className="mb-6"/>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="grid grid-cols-2 gap-6 flex-1">
            <Card className="flex-1 p-6">
              <div className="h-full flex flex-col items-left justify-center">
                <span className="text-gray-500 text-xs font-medium text-[1rem] font-bold mb-2">Peak Activity Time</span>
                <span className="text-2xl font-bold">
                  {data.peakActivityTime 
                    ? `${new Date(data.peakActivityTime.peakTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'No data'}
                </span>
                <TrendIndicator unit={'%'} value={data.peakActivityTime.trend.toFixed(2)} isPositive={data.peakActivityTime.trend >= 0} />
              </div>
            </Card>
            <Card className="flex-1 p-6">
              <div className="h-full flex flex-col items-left justify-center">
                <span className="text-gray-500 text-xs font-medium text-[1rem] font-bold mb-2">Online users</span>
                <span className="text-2xl font-bold">{data.onlineUsers.count}</span>
                <TrendIndicator unit={'%'} value={data.onlineUsers.trend.toFixed(2)} isPositive={data.onlineUsers.trend >= 0} />
              </div>
            </Card>
            <Card className="flex-1 p-6">
              <div className="h-full flex flex-col items-left justify-center">
                <span className="text-gray-500 text-xs font-medium text-[1rem] font-bold mb-2">Avg Session Time</span>
                <span className="text-2xl font-bold">{data.avgSessionTime.count.toFixed(2)} minutes</span>
                <TrendIndicator unit={'%'} value={data.avgSessionTime.trend.toFixed(2)} isPositive={data.avgSessionTime.trend >= 0} />
              </div>
            </Card>
            <Card className="flex-1 p-6">
              <div className="h-full flex flex-col items-left justify-center">
                <span className="text-gray-500 text-xs font-medium text-[1rem] font-bold mb-2">Playing Now</span>
                <span className="text-2xl font-bold">{data.playingNow.count}</span>
                <TrendIndicator unit={'%'} value={data.playingNow.trend.toFixed(2)} isPositive={data.playingNow.trend >= 0} />
              </div>
            </Card>
            <Card className="flex-1 p-6">
              <div className="h-full flex flex-col items-left justify-center">
                <span className="text-gray-500 text-xs font-medium text-[1rem] font-bold mb-2">Joins</span>
                <span className="text-2xl font-bold">{mockedJoins}</span>
                <TrendIndicator unit={'%'} value={1.3} isPositive={true} />
              </div>
            </Card>
            <Card className="flex-1 p-6">
              <div className="h-full flex flex-col items-left justify-center">
                <span className="text-gray-500 text-xs font-medium text-[1rem] font-bold mb-2">Leaves</span>
                <span className="text-2xl font-bold">{mockedLeaves}</span>
                <TrendIndicator unit={'%'} value={12.1} isPositive={false} />
              </div>
            </Card>
          </div>
          <div className="flex-1">
            <RolesChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityAnalytics;
