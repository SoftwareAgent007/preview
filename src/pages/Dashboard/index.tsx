import { motion, LayoutGroup } from "framer-motion";
import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import StatCard from "./components/StatCard";
import ChartCard from "./components/ChartCard";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";
import MessageFrequencyChart from "@/components/charts/userActivityTimeline/messageFrequencyChart";
import HorizontalBarChart from "@/components/charts/hourActivity/horizontalBarChart";
import ListElement from "@/components/ui/list-element";
import { useRef, useEffect, useState } from "react";
import LoadingState from "@/components/states/LoadingState";

const Dashboard = () => {
  const {
    totalUsers,
    activeUsers,
    totalMessages,
    totalReactions,
    topKeywords,
    topUsers,
    currentActivities,
    peakActivityTime,
    totalGameTime,
    hourlyActivity,
    activeListeners,
    keywordStats,
    isLoading,
  } = useDashboardData("month");

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
      value: totalUsers,
      description: "New users this period",
      tooltipContent: "Total number of users registered during this period",
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: "Currently active users",
      tooltipContent: "Users who are currently active in the platform",
    },
    {
      title: "Total Messages",
      value: totalMessages,
      description: "Messages this period",
      tooltipContent: "Total number of messages sent during this period",
    },
    {
      title: "Total Reactions",
      value: totalReactions,
      description: "Reactions this period",
      tooltipContent: "Total number of reactions made during this period",
    },
  ];
  // #endregion

  // #region Bottom Stats Cards Data
  const bottomStatsCards = [
    {
      title: "Peak Activity Time",
      value: peakActivityTime?.hour || 0,
      description: `${peakActivityTime?.count} active users`,
      tooltipContent: "Time with the highest user activity",
      index: 1,
    },
    {
      title: "Total Game Time",
      value: totalGameTime,
      description: "hours played",
      tooltipContent: "Total time spent playing games",
      index: 2,
    },
    {
      title: "Active Listeners",
      value: activeListeners,
      description: "currently listening",
      tooltipContent: "Listeners currently active on the platform",
      index: 3,
    },
    {
      title: "Keywords",
      value: keywordStats.total,
      description: `${keywordStats.active} active`,
      tooltipContent: "Active keywords are keywords that have been mentioned in the discord guild within the timerange selected",
      index: 4,
    },
  ];
  // #endregion

  if (isLoading) {
    return <LoadingState text="Loading dashboard data..." />;
  }

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
            <StatCard key={card.title} {...card} index={index} />
          ))}
        </div>
        {/* #endregion */}

         {/* //TODO: fix chart responsiveness on mobile  */}
        {/* #region Charts */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <ChartCard index={0} className="flex-1">
            <UserActivityTimeline width={graphWidth} />
          </ChartCard>
          <ChartCard index={1} className="flex-1">
            <MessageFrequencyChart width={graphWidth} />
          </ChartCard>
        </div>
        {/* #endregion */}

        {/* #region Activity Cards */}
        <div className="flex flex-col  md:flex-row justify-between gap-6 mb-6  md:h-[300px]">
          <ChartCard
            title="Current Activities"
            tooltipContent="Current activities of users on the platform"
            index={0}
            className="w-full md:w-[35%]"
          >
              <ListElement
                logo={<Users className="w-8 h-8 text-gray-600" />}
                title="Active Gamers"
                description={`${currentActivities.gamers} users`}
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
                description={`${currentActivities.spotifyListeners} users`}
              />
          </ChartCard>

          <ChartCard
            title="Top Keywords"
            tooltipContent="Keywords that are frequently mentioned"
            index={1}
           className="w-full md:w-[35%]"
          >
            {topKeywords.map((keyword, index) => (
              <ListElement
                key={index}
                logo={<span className="text-gray-600 text-3xl">#</span>}
                title={keyword.keyword}
                description={`${keyword.count} matches`}
              />
            ))}
          </ChartCard>

          <ChartCard
            title="Top Users"
            tooltipContent="Users with the highest message counts"
            index={2}
           className="w-full md:w-[35%]"
          >
            {topUsers.map((user, index) => (
              <ListElement
                key={index}
                logo={<Users className="w-8 h-8 text-gray-600" />}
                title={user.user}
                description={`${user.messageCount} messages`}
                backgroundColor=""
              />
            ))}
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
            {/* //TODO: fix chart responsiveness on mobile  */}
            <HorizontalBarChart
              data={hourlyActivity}
              height={500}
              width={600}
            />
          </ChartCard>

          <div className="flex-1 grid grid-cols-2 gap-6 h-fit">
            {bottomStatsCards.map((card) => (
              <StatCard key={card.title} {...card} />
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
