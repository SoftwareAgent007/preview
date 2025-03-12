import ActivityCharts from "@/components/charts/userActivityTimeline/expandedUserActivityCharts";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import TrendIndicator from "@/components/common/TrendIndicator"; 
import { usePeakHours } from "@/hooks/analytics/useGamingPeakHours";
import { useUserActivityAnalytics } from "@/hooks/analytics/useUserActivityAnalytics";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import ContentLoader from "react-content-loader";
import ErrorComponent from "@/components/common/errorModel";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const UserActivityAnalytics = () => {
  const { activeRoles, avgSessionTime, joins, leaves, isLoading: activityLoading, error: activityError } = useUserActivityAnalytics("");
  const { peakHours, isLoading: peakLoading, error: peakError } = usePeakHours("");
  const { totalUsers, activeUsers, isLoading: dashboardLoading, error: dashboardError } = useDashboardData("year");

  const isLoading = activityLoading || peakLoading || dashboardLoading;
  const hasError = activityError || peakError || dashboardError;

  // Проверка наличия данных
  const hasValidData = totalUsers || activeUsers || avgSessionTime || joins || leaves;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.USER_ACTIVITY]} />
        </div>

        <div className="flex flex-col items-center gap-6">
          {isLoading ? (
            <Card className="p-6 w-full h-[300px]">
              <CardSkeleton width="100%" height="100%" />
            </Card>
          ) : hasValidData ? (
            <ActivityCharts data={{}} className="mb-6" />
          ) : (
            <ErrorComponent />
          )}
        </div>

        {/* Статистика активности */}
        <div className="flex gap-6 mb-6">
          <div className="grid grid-cols-2 gap-6 flex-1">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="flex-1 p-6">
                  <CardSkeleton width="100%" height="100px" />
                </Card>
              ))
            ) : hasValidData ? (
              <>
                {[ 
                  { label: "Peak Activity Time", value: peakHours?.[0]?.hour || "No data" },
                  { label: "Online Users", value: totalUsers?.count || "No data" },
                  { label: "Avg Session Time", value: avgSessionTime?.count?.toFixed(2) + " minutes" || "No data" },
                  { label: "Playing Now", value: activeUsers?.count || "No data" },
                  { label: "Joins", value: joins || "No data", trend: 1.3, isPositive: true },
                  { label: "Leaves", value: leaves || "No data", trend: 12.1, isPositive: false },
                ].map((stat, index) => (
                  <Card key={index} className="flex-1 p-6">
                    <div className="h-full flex flex-col items-left justify-center">
                      <span className="text-gray-500 text-xs font-medium text-[1rem] font-bold mb-2">{stat.label}</span>
                      <span className="text-2xl font-bold">{stat.value}</span>
                      {stat.trend !== undefined && (
                        <TrendIndicator unit="%" value={stat.trend} isPositive={stat.isPositive} />
                      )}
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <ErrorComponent />
            )}
          </div>
          <div className="flex-1">
            {isLoading ? (
              <Card className="p-6 h-[300px]">
                <CardSkeleton width="100%" height="100%" />
              </Card>
            ) : activeRoles?.length > 0 ? (
              <p> {/* Здесь можно добавить визуализацию ролей, например, Pie Chart */}</p>
            ) : (
              <ErrorComponent />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityAnalytics;
