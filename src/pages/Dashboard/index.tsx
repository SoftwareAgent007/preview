import HorizontalBarChart from "@/components/charts/hourActivity/HorizontalBarChart";
import MessageFrequencyChart from "@/components/charts/userActivityTimeline/messageFrequencyChart";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import ErrorComponent from "@/components/common/errorModel";
import { Button } from "@/components/ui/button";
import ListElement from "@/components/ui/list-element";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { LayoutGroup, motion } from "framer-motion";
import { Download, Users } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import ChartCard from "./components/ChartCard";
import StatCard from "./components/StatCard";
import ContentLoader from "react-content-loader";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const Dashboard = () => {
  const {
    totalUsers,
    activeUsers, 
    totalMessages,
    totalReactions,
    currentActivities,
    peakActivityTime,
    topKeywords,
    topUsers,
    usersDailyActivity,
    dailyMessageMetrics,
    totalGameTime,
    hourlyActivity,
    activeListeners,
    keywordsCount,
    isLoading,
    error
  } = useDashboardData();

  const [graphWidth, setGraphWidth] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const keywordStats = useMemo(() => ({
    total: keywordsCount?.count ?? 0,
    active: keywordsCount?.count ?? 0,
  }), [keywordsCount]);

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
    if (!isLoading && wrapperRef.current) {
      updateGraphWidth();
    }
  }, [isLoading, wrapperRef.current]);

  const hasError = (value: unknown): boolean => !isLoading && (!value && value !== 0);

  const statsCards = useMemo(() => [
    {
      title: "Total Users",
      value: totalUsers?.count ?? 0,
      description: totalUsers?.label ?? '',
      trend: totalUsers?.trend?.percentChange ?? 0,
      isTrendPositive: totalUsers?.trend?.isPositive ?? false,
      tooltipContent: "Total number of users registered during this period",
    },
    {
      title: "Active Users",
      value: activeUsers?.count ?? 0,
      description: activeUsers?.label ?? '',
      trend: activeUsers?.trend?.percentChange ?? 0,
      isTrendPositive: activeUsers?.trend?.isPositive ?? false,
      tooltipContent: "Users who are currently active in the platform",
    },
    {
      title: "Total Messages",
      value: totalMessages?.count ?? 0,
      description: totalMessages?.label ?? '',
      trend: totalMessages?.trend?.percentChange ?? 0,
      isTrendPositive: totalMessages?.trend?.isPositive ?? false,
      tooltipContent: "Total number of messages sent during this period",
    },
    {
      title: "Total Reactions",
      value: totalReactions?.count ?? 0,
      description: totalReactions?.label ?? '',
      trend: totalReactions?.trend?.percentChange ?? 0,
      isTrendPositive: totalReactions?.trend?.isPositive ?? false,
      tooltipContent: "Total number of reactions made during this period",
    },
  ], [totalUsers, activeUsers, totalMessages, totalReactions]);

  const bottomStatsCards = useMemo(() => [
    {
      title: "Peak Activity Time",
      value: peakActivityTime?.time ?? '00:00',
      description: `${peakActivityTime?.users ?? 0} active users`,
      trend: peakActivityTime?.percentChange ?? 0,
      isTrendPositive: (peakActivityTime?.percentChange ?? 0) > 0,
      trendUnit: "%",
      tooltipContent: "Time with the highest user activity",
      index: 1,
    },
    {
      title: "Total Game Time",
      value: totalGameTime?.hours ?? 0,
      description: "hours played",
      trend: parseInt(totalGameTime?.hourChange ?? "0"),
      isTrendPositive: (totalGameTime?.hourChange ?? "").startsWith('+'),
      trendUnit: "h",
      tooltipContent: "Total time spent playing games",
      index: 2,
    },
    {
      title: "Active Listeners",
      value: activeListeners?.count ?? 0,
      description: "currently listening",
      trend: activeListeners?.percentChange ?? 0,
      isTrendPositive: (activeListeners?.percentChange ?? 0) > 0,
      trendUnit: "%",
      tooltipContent: "Listeners currently active on the platform",
      index: 3,
    },
    {
      title: "Keywords",
      value: keywordStats.total,
      description: `${keywordStats.active} active`,
      trend: keywordsCount?.percentChange ?? 0,
      isTrendPositive: (keywordsCount?.percentChange ?? 0) > 0,
      trendUnit: "%",
      tooltipContent: "Active keywords mentioned in the guild within the timerange",
      index: 4,
    },
  ], [peakActivityTime, totalGameTime, activeListeners, keywordStats, keywordsCount]);

  return (
    <LayoutGroup> 
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full min-h-screen bg-gray-50 p-6"
      >
        <motion.div 
          layout 
          id="dashboard-wrapper" 
          ref={wrapperRef} 
          className="block mx-auto"
          style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.DASHBOARD]} />
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Full Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col md:flex-row justify-between w-full gap-6 mb-6 h-fit">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <ChartCard key={i} className="flex-1">
                  <CardSkeleton width="100%" height="120px" />
                </ChartCard>
              ))
            ) : (
              statsCards.map((card) => (
                hasError(card.value) ? (
                  <ErrorComponent key={card.title} />
                ) : (
                  <StatCard key={card.title} {...card} />
                )
              ))
            )}
          </div>

          {/* Charts */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <ChartCard index={0} className="flex-1">
              {isLoading ? (
                <CardSkeleton width="100%" height="300px" />
              ) : (
                <UserActivityTimeline activityTimeline={usersDailyActivity ?? []} width={graphWidth} />
              )}
            </ChartCard>
            <ChartCard index={1} className="flex-1">
              {isLoading ? (
                <CardSkeleton width="100%" height="300px" />
              ) : (
                <MessageFrequencyChart messageFrequency={dailyMessageMetrics ?? []} width={graphWidth} />
              )}
            </ChartCard>
          </div>

          {/* Activity Cards */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 md:h-[300px]">
            <ChartCard
              title="Current Activities"
              tooltipContent="Current activities of users on the platform"
              index={0}
              className="w-full md:w-[35%]"
            >
              {isLoading ? (
                <CardSkeleton width="100%" height="200px" />
              ) : hasError(currentActivities) ? (
                <ErrorComponent />
              ) : (
                <>
                  <ListElement
                    logo={<Users className="w-8 h-8 text-gray-600" />}
                    title="Active Gamers"
                    description={`${currentActivities?.activeGamers?.count ?? 0} ${currentActivities?.activeGamers?.label ?? 'users'}`}
                  />
                  <ListElement
                    logo={
                      <img
                        src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png"
                        alt="Spotify Logo"
                        className="w-8 h-8"
                      />
                    }
                    title="Spotify Listeners"
                    description={`${currentActivities?.spotifyListeners?.count ?? 0} ${currentActivities?.spotifyListeners?.label ?? 'users'}`}
                  />
                </>
              )}
            </ChartCard>
            <ChartCard
              title="Top Keywords"
              tooltipContent="Keywords that are frequently mentioned"
              index={1}
              className="w-full md:w-[35%]"
            >
            {isLoading ? (
              <div className="flex flex-col gap-4 p-4">
                <div className="h-12 bg-gray-100 rounded-md animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-md animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-md animate-pulse"></div>
              </div>
            ) : hasError(topKeywords) ? (
                <ErrorComponent />
              ) : topKeywords?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500">No keywords data available</p>
                </div>
              ) : (
                topKeywords?.map((keyword, index) => (
                  <ListElement
                    key={index}
                    logo={<span className="text-gray-600 text-3xl">#</span>}
                    title={keyword.keyword}
                    description={`${keyword.matches} matches`}
                  />
                ))
              )}
            </ChartCard>

            <ChartCard
              title="Top Users" 
              tooltipContent="Users with the highest message counts"
              index={2}
              className="w-full md:w-[35%]"
            >
              {isLoading ? (
                <div className="flex flex-col gap-4 p-4">
                  <div className="h-12 bg-gray-100 rounded-md animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded-md animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded-md animate-pulse"></div>
                </div>
              ) : hasError(topUsers) ? (
                <ErrorComponent />
              ) : topUsers?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500">No user data available</p>
                </div>
              ) : (
                topUsers?.map((user, index) => (
                  <ListElement
                    key={index}
                    logo={<Users className="w-8 h-8 text-gray-600" />}
                    title={user.username}
                    description={`${user.messages} messages`}
                  />
                ))
              )}
            </ChartCard>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <ChartCard
              title="Hourly Activity"
              tooltipContent="Displays the number of users at different hours of the day"
              index={0}
              className="flex-1"
            >
              {isLoading ? (
                <CardSkeleton width="100%" height="500px" />
              ) : hasError(hourlyActivity?.length) ? (
                <ErrorComponent />
              ) : (
                <HorizontalBarChart
                  data={hourlyActivity ?? []}
                  height={500}
                  width={600}
                />
              )}
            </ChartCard>
            <div className="flex-1 grid grid-cols-2 gap-6 h-fit">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <ChartCard key={i} className="flex-1">
                    <CardSkeleton width="100%" height="120px" />
                  </ChartCard>
                ))
              ) : (
                bottomStatsCards.map((card) => (
                  hasError(card.value) ? (
                    <ErrorComponent key={card.title} />
                  ) : (
                    <StatCard key={card.title} {...card} />
                  )
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};

export default Dashboard;
