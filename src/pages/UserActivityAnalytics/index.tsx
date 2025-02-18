import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { useUserActivityAnalytics } from "@/hooks/analytics/useUserActivityAnalytics";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import ActivityCharts from "@/components/charts/userActivityTimeline/expandedUserActivityCharts";
import { usePlayingStatisticData } from "@/hooks/analytics/usePlayingStatisticData";
import RolesChart from "@/components/charts/userActivityTimeline/userRolesChart";

const UserActivityAnalytics = () => {
  const { activityStats } = useUserActivityAnalytics();
  const { playingUserStats } = usePlayingStatisticData();

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.USER_ACTIVITY]} />
        </div>

        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Peak Activity Time</span>
              <span className="text-2xl font-bold">{activityStats.peakActivityTime ? activityStats.peakActivityTime : 'No data'}</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Online Users</span>
              <span className="text-2xl font-bold">{activityStats.onlineUsers}</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Avg Session Time</span>
              <span className="text-2xl font-bold">{activityStats.avgSessionTime.toFixed(2)} minutes</span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-left justify-center">
              <span className="text-gray-500 text-sm font-medium">Playing Now</span>
              <span className="text-2xl font-bold">{activityStats.playingNow}</span>
            </div>
          </Card>
        </div>

        <div className="flex-row gap-6">
          <div className="mb-6">
            <ActivityCharts data={playingUserStats}/>
          </div>
          <RolesChart/>
        </div>
      </div>
    </div>
  );
};

export default UserActivityAnalytics;
