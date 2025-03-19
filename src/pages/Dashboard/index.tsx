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
import { useEffect, useRef, useState } from "react";
import ChartCard from "./components/ChartCard";
import StatCard from "./components/StatCard";
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
    totalGameTime,
    hourlyActivity,
    activeListeners,
    keywordsCount,
    keywordsList,
    isLoading,
    error
  } = useDashboardData();

  const [graphWidth, setGraphWidth] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const keywordStats = {
    total: keywordsCount?.count || 0,
    active: keywordsList?.length || 0
  };

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

  // Helper function to check for errors
  const hasError = (value) => !isLoading && (!value && value !== 0);

  const statsCards = [
    {
      title: "Total Users",
      value: totalUsers?.count,
      description: totalUsers?.label,
      tooltipContent: "Total number of users registered during this period",
    },
    {
      title: "Active Users",
      value: activeUsers?.count,
      description: activeUsers?.label,
      tooltipContent: "Users who are currently active in the platform",
    },
    {
      title: "Total Messages",
      value: totalMessages?.count,
      description: totalMessages?.label,
      tooltipContent: "Total number of messages sent during this period",
    },
    {
      title: "Total Reactions",
      value: totalReactions?.count,
      description: totalReactions?.label,
      tooltipContent: "Total number of reactions made during this period",
    },
  ];

  const bottomStatsCards = [
    {
      title: "Peak Activity Time",
      value: peakActivityTime?.time,
      description: `${peakActivityTime?.users || 0} active users`,
      trend: peakActivityTime?.percentChange,
      isTrendPositive: peakActivityTime?.percentChange > 0,
      trendUnit: "%",
      tooltipContent: "Time with the highest user activity",
      index: 1,
    },
    {
      title: "Total Game Time",
      value: `${totalGameTime?.hours || 0}h`,
      description: "hours played",
      trend: parseInt(totalGameTime?.hourChange || "0"),
      isTrendPositive: totalGameTime?.hourChange?.startsWith('+'),
      trendUnit: "h",
      tooltipContent: "Total time spent playing games",
      index: 2,
    },
    {
      title: "Active Listeners",
      value: activeListeners?.count || 0,
      description: "currently listening",
      trend: activeListeners?.percentChange,
      isTrendPositive: activeListeners?.percentChange > 0,
      trendUnit: "%",
      tooltipContent: "Listeners currently active on the platform",
      index: 3,
    },
    {
      title: "Keywords",
      value: keywordStats.total,
      description: `${keywordStats.active} active`,
      trend: keywordsCount?.percentChange,
      isTrendPositive: keywordsCount?.percentChange > 0,
      trendUnit: "%",
      tooltipContent: "Active keywords mentioned in the guild within the timerange",
      index: 4,
    },
  ];

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
            {statsCards.map((card, index) => (
              hasError(card.value) ? (
                <ErrorComponent key={card.title} />
              ) : (
                <StatCard key={card.title} {...card} value={card.value ?? 0} index={index} />
              )
            ))}
          </div>

          {/* Charts */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <ChartCard index={0} className="flex-1">
              {hasError(hourlyActivity) ? (
                <ErrorComponent />
              ) : (
                <UserActivityTimeline activityTimeline={hourlyActivity} width={graphWidth} />
              )}
            </ChartCard>
            <ChartCard index={1} className="flex-1">
              {hasError(hourlyActivity) ? (
                <ErrorComponent />
              ) : (
                <MessageFrequencyChart messageFrequency={} width={graphWidth} />
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
              {hasError(currentActivities) ? (
                <ErrorComponent />
              ) : (
                <>
                  <ListElement
                    logo={<Users className="w-8 h-8 text-gray-600" />}
                    title="Active Gamers"
                    description={`${currentActivities?.activeGamers?.count || 0} ${currentActivities?.activeGamers?.label || 'users'}`}
                  />
                </>
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
              {hasError(hourlyActivity?.length) ? (
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
              {bottomStatsCards.map((card) => (
                hasError(card.value) ? (
                  <ErrorComponent key={card.title} />
                ) : (
                  <StatCard key={card.title} {...card} />
                )
              ))}
            </div>
          </div>

        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};
export default Dashboard;
