import { motion, LayoutGroup } from "framer-motion";
import { Download, Users } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import ErrorComponent from "@/components/common/errorModel";
import TrendIndicator from "@/components/common/TrendIndicator";
import { ClickableTooltip } from "@/components/ui/tooltip";
import HorizontalBarChart from "@/components/charts/hourActivity/HorizontalBarChart";
import MessageFrequencyChart from "@/components/charts/userActivityTimeline/messageFrequencyChart";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";
import ListElement from "@/components/ui/list-element";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import StatCard from "./components/StatCard";
import ChartCard from "./components/ChartCard";
import LoadingState from "@/components/states/LoadingState";

const Dashboard = () => {
  console.log('INITED')
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
    isLoading
  } = useDashboardData('month');

  // TODO: These features are currently being refactored:
  // - User Activity Timeline
  // - Message Frequency Chart  
  // - Keywords Analytics
  // - Users Statistics

  const keywordStats = {
    total: keywordsCount?.count || 0,
    active: keywordsList?.length || 0
  };

  const fontSize = {
    amountTitle: 'text-2xl font-bold',
    cardTitle: 'text-sm font-medium',
    defaultInfo: 'text-sm text-gray-500',
  };

  // #region Graph Width Calculation
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
    if (!isLoading && wrapperRef.current) {
      updateGraphWidth();
    }
  }, [isLoading, wrapperRef.current]);
  // #endregion

  // #region Stats Cards Data
  const statsCards = [
    {
      title: "Total Users",
      value: totalUsers.count,
      description: totalUsers.label,
      tooltipContent: "Total number of users registered during this period",
    },
    {
      title: "Active Users",
      value: activeUsers.count,
      description: activeUsers.label,
      tooltipContent: "Users who are currently active in the platform",
    },
    {
      title: "Total Messages",
      value: totalMessages.count,
      description: totalMessages.label,
      tooltipContent: "Total number of messages sent during this period",
    },
    {
      title: "Total Reactions",
      value: totalReactions.count,
      description: totalReactions.label,
      tooltipContent: "Total number of reactions made during this period",
    },
  ];
  // #endregion

  // #region Bottom Stats Cards Data
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
      tooltipContent: "Active keywords are keywords that have been mentioned in the discord guild within the timerange selected",
      index: 4,
    },
  ];
  // #endregion

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
        {/* #region Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.DASHBOARD]} />
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Full Report
          </Button>
        </div>
        {/* #endregion */}

        {/* #region Stats Cards */}
        <div className="flex flex-col md:flex-row justify-between w-full gap-6 mb-6 h-fit">
          {statsCards.map((card, index) => (
            card.value ? (
              <StatCard key={card.title} {...card} index={index} />
            ) : (
              <ErrorComponent key={card.title} />
            )
          ))}
        </div>
        {/* #endregion */}

        {/* #region Charts */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <ChartCard index={0} className="flex-1">
            {hourlyActivity ? (
              <UserActivityTimeline activityTimeline={hourlyActivity} width={graphWidth} />
            ) : (
              <ErrorComponent />
            )}
          </ChartCard>
          <ChartCard index={1} className="flex-1">
            {hourlyActivity ? (
              <MessageFrequencyChart width={graphWidth} />
            ) : (
              <ErrorComponent />
            )}
          </ChartCard>
        </div>
        {/* #endregion */}

        {/* #region Activity Cards */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 md:h-[300px]">
          <ChartCard
            title="Current Activities"
            tooltipContent="Current activities of users on the platform"
            index={0}
            className="w-full md:w-[35%]"
          >
            {currentActivities ? (
              <>
                <ListElement
                  logo={<Users className="w-8 h-8 text-gray-600" />}
                  title="Active Gamers"
                  description={`${currentActivities.activeGamers?.count || 0} ${currentActivities.activeGamers?.label || 'users'}`}
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
                  description={`${currentActivities.spotifyListeners?.count || 0} ${currentActivities.spotifyListeners?.label || 'users'}`}
                />
              </>
            ) : (
              <ErrorComponent />
            )}
          </ChartCard>

          <ChartCard
            title="Top Keywords"
            tooltipContent="Keywords that are frequently mentioned"
            index={1}
            className="w-full md:w-[35%]"
          >
            {topKeywords?.length ? (
              topKeywords.map((keyword, index) => (
                <ListElement
                  key={index}
                  logo={<span className="text-gray-600 text-3xl">#</span>}
                  title={keyword.keyword}
                  description={`${keyword.count} matches`}
                />
              ))
            ) : (
              <ErrorComponent />
            )}
          </ChartCard>

          <ChartCard
            title="Top Users"
            tooltipContent="Users with the highest message counts"
            index={2}
            className="w-full md:w-[35%]"
          >
            {topUsers?.length ? (
              topUsers.map((user, index) => (
                <ListElement
                  key={index}
                  logo={<Users className="w-8 h-8 text-gray-600" />}
                  title={user.user}
                  description={`${user.messageCount} messages`}
                  backgroundColor=""
                />
              ))
            ) : (
              <ErrorComponent />
            )}
          </ChartCard>
        </div>
        {/* #endregion */}

        {/* #region Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <ChartCard
            title="Hourly Activity"
            tooltipContent="Displays the number of users at different hours of the day"
            index={0}
            className="flex-1"
          >
            {hourlyActivity?.length ? (
              <HorizontalBarChart
                data={hourlyActivity}
                height={500}
                width={600}
              />
            ) : (
              <ErrorComponent />
            )}
          </ChartCard>

          <div className="flex-1 grid grid-cols-2 gap-6 h-fit">
            {bottomStatsCards.map((card) => (
              card.value ? (
                <StatCard key={card.title} {...card} />
              ) : (
                <ErrorComponent key={card.title} />
              )
            ))}
          </div>
        </div>
        {/* #endregion */}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};

export default Dashboard;