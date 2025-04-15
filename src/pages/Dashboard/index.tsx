import HorizontalBarChart from "@/components/charts/hourActivity/HorizontalBarChart";
import MessageFrequencyChart from "@/components/charts/userActivityTimeline/messageFrequencyChart";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChartWrapper";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import ErrorComponent from "@/components/common/errorModel";
import { Button } from "@/components/ui/button";
import ListElement from "@/components/ui/list-element";
import { TimeViewType, useActivityData, useActivityTrend, useDashboardData, useMessageMetrics, useMessageTrend } from "@/hooks/analytics/useDashboardData";
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
    topKeywords,
    topUsers,
    totalGameTime,
    activeListeners,
    activeGamers,
    isLoading,
    error
  } = useDashboardData();

  const [userActivityViewType, setUserActivityViewType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [messageViewType, setMessageViewType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const { data: activeUsersTrend, isLoading: isActiveUsersTrendLoading } = useActivityTrend('user', userActivityViewType);
  const { trend: dailyMessageMetrics, isLoading: isMessageTrendLoading } = useMessageTrend(messageViewType === 'daily' ? TimeViewType.DAY : messageViewType === 'weekly' ? TimeViewType.WEEK : messageViewType === 'monthly' ? TimeViewType.MONTH : TimeViewType.YEAR);

  const [graphWidth, setGraphWidth] = useState(0);
  const [horizontalChartWidth, setHorizontalChartWidth] = useState(0);
  const [activityDate, setActivityDate] = useState(new Date());
  const [activityHourlyDate, setActivityHourlyDate] = useState(new Date());
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const horizontalChartRef = useRef<HTMLDivElement | null>(null);

  const {
    currentActivities,
    isLoading: isCurrentActivitiesLoading,
    error: isCurrentActivitiesError,
  } = useActivityData(activityDate);

  const {
    hourlyActivity,
    isLoading: isHourlyLoading,
    error: isHourlyError,
  } = useActivityData(activityHourlyDate);

  const updateGraphWidth = () => {
    if (wrapperRef.current) {
      setGraphWidth(wrapperRef.current.offsetWidth / 2.3);
    }
    if (horizontalChartRef.current) {
      setHorizontalChartWidth(horizontalChartRef.current.offsetWidth); // Subtract padding
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateGraphWidth();
    });
    
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [wrapperRef.current]);

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
      trend: totalUsers?.percentChange ?? 0,
      isTrendPositive: (totalUsers?.percentChange ?? 0) > 0,
      tooltipContent: "Total number of users registered during this period",
      isExtraData: true,
      extraInfo: {
        netChange: totalUsers?.netChange,
        newUsersCount: totalUsers?.newUsersCount,
        departedUsersCount: totalUsers?.departedUsersCount,
      },
      index: 0
    },
    {
      title: "Active Users", 
      value: activeUsers?.today?.count ?? 0,
      description: "Active Today",
      trend: activeUsers?.today?.percentChange ?? 0,
      isTrendPositive: (activeUsers?.today?.percentChange ?? 0) > 0,
      tooltipContent: "Users who are currently active in the platform",
      index: 1
    },
    {
      title: "Total Messages",
      value: totalMessages?.count ?? 0,
      description: totalMessages?.label ?? '',
      trend: totalMessages?.percentChange ?? 0,
      isTrendPositive: (totalMessages?.percentChange ?? 0) > 0,
      tooltipContent: "Total number of messages sent during this period",
      index: 2
    },
    {
      title: "Total Reactions",
      value: totalReactions?.count ?? 0,
      description: `${totalReactions?.count ?? 0} Reactions`,
      trend: totalReactions?.percentChange ?? 0,
      isTrendPositive: (totalReactions?.percentChange ?? 0) > 0,
      tooltipContent: "Total number of reactions made during this period",
      index: 3
    },
  ], [totalUsers, activeUsers, totalMessages, totalReactions]);

  const peakHour = hourlyActivity?.peakHour ?? 0;
  const peakHourIndex = hourlyActivity?.peakHour ? hourlyActivity.peakHour - 1 : 0;
  const activeUserCount = hourlyActivity?.hourlyDistribution?.[peakHourIndex] ?? 0;
  const trendChange = hourlyActivity?.peakHourChange?.change ?? 0;
  
  const bottomStatsCards = useMemo(() => [{
      title: "Peak Activity Time", 
      value: Number(peakHour),
      description: `${activeUserCount.toLocaleString()} Active Users`,
      trend: trendChange,
      isTrendPositive: trendChange > 0,
      tooltipContent: "Time with the highest user activity",
      index: 1,
    },
    {
      title: "Total Game Time",
      value: Math.floor(totalGameTime?.hours ?? 0),
      description: "Hours Played", 
      trend: parseInt(totalGameTime?.hourChange ?? "0"),
      isTrendPositive: totalGameTime?.hourChange?.startsWith('+') ?? false,
      tooltipContent: "Total time spent playing games",
      index: 2,
    },
    {
      title: "Active Listeners",
      value: Number(activeListeners?.count ?? 0),
      description: "during selected period",
      trend: activeListeners?.percentChange ?? 0,
      isTrendPositive: (activeListeners?.percentChange ?? 0) > 0,
      tooltipContent: "Count of users listening during selected period",
      index: 3,
    },
    {
      title: "Active Gamers",
      value: Number(activeGamers?.count ?? 0),
      description: "during selected period",
      trend: activeGamers?.percentChange ?? 0,
      isTrendPositive: (activeGamers?.percentChange ?? 0) > 0,
      tooltipContent: "Count of users playing games during selected period",
      index: 4,
    },
    {
      title: "Keywords",
      value: Number(topKeywords?.length ?? 0),
      description: `${topKeywords?.length ?? 0} Active`,
      trend: 0,
      isTrendPositive: true,
      tooltipContent: "Total number of keywords in the system",
      index: 5,
    },
  ], [hourlyActivity, totalGameTime, activeListeners, activeGamers, topKeywords]);

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
                <ChartCard key={i} className="flex-1" index={i}>
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
                <UserActivityTimeline 
                  activityTimeline={activeUsersTrend?.data ?? []} 
                  width={graphWidth}
                  isLoading={isActiveUsersTrendLoading}
                  tooltipContent="Displays the number of users over different time periods."
                  onViewTypeChange={setUserActivityViewType}
                />
              )}
            </ChartCard>
            <ChartCard index={1} className="flex-1">
              {isLoading ? (
                <CardSkeleton width="100%" height="300px" />
              ) : (
                <MessageFrequencyChart 
                  messageFrequency={dailyMessageMetrics ?? []} 
                  width={graphWidth} 
                  isLoading={isMessageTrendLoading}
                  onViewTypeChange={setMessageViewType}
                />
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
              {isCurrentActivitiesLoading ? (
                <CardSkeleton width="100%" height="200px" />
              ) : isCurrentActivitiesError ? (
                <ErrorComponent />
              ) : (
                <>
                  <ListElement
                    logo={<Users className="w-8 h-8 text-gray-600" />}
                    title="Active Gamers"
                    description={`${currentActivities?.activeGamers?.count.toLocaleString() ?? 0} ${currentActivities?.activeGamers?.label ?? 'Users'}`}
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
                    description={`${currentActivities?.spotifyListeners?.count.toLocaleString() ?? 0} ${currentActivities?.spotifyListeners?.label ?? 'Users'}`}
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
                    description={`${keyword.matches.count} Matches`}
                  />
                ))
              )}
            </ChartCard>

            <ChartCard
              title="Top Users" 
              tooltipContent="Users with the highest message count"
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
                    description={`${user.messages.toLocaleString()} Messages`}
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
              setRef={(ref) => horizontalChartRef.current = ref}
            >
              <HorizontalBarChart
                data={hourlyActivity?.hourlyDistribution ?? []}
                height={500}
                width={horizontalChartWidth}
                isLoading={isHourlyLoading}
                isError={!!isHourlyError}
                onDateChange={setActivityHourlyDate}
              />
            </ChartCard>
            <div className={`flex-1 ${horizontalChartWidth < 500 ? 'flex flex-col gap-6' : 'grid grid-cols-2 gap-6'} h-fit`}>
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <ChartCard key={i} className="flex-1" index={i}>
                    <CardSkeleton width="100%" height={horizontalChartWidth > 600 ? "80px" : "120px"} />
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
