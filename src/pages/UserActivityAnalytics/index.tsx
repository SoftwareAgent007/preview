import { motion } from "framer-motion";
import { ActivityData } from "@/components/common/types/userAnalytic.types";
import { usePlayingStatisticData } from "@/hooks/analytics/usePlayingStatisticData";
import { useUsersActivityData } from "@/hooks/fetchData";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import ActivityStatCard from "./components/ActivityStatCard";
import ActivityChartsSection from "./components/ActivityChartsSection";
import RolesSection from "./components/RolesSection";

const UserActivityAnalytics = () => {
  // #region Data Fetching
  const data: ActivityData = useUsersActivityData();
  const { playingUserStats } = usePlayingStatisticData();
  // #endregion

  // #region Constants
  const mockedJoins = 120;
  const mockedLeaves = 80;
  // #endregion

  // #region Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  // #endregion

  // #region Stats Data
  const statsData = [
    {
      title: "Peak Activity Time",
      value: data.peakActivityTime
        ? new Date(data.peakActivityTime.peakTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "No data",
      trend: data.peakActivityTime.trend,
      isPositive: data.peakActivityTime.trend >= 0,
    },
    {
      title: "Online users",
      value: data.onlineUsers.count,
      trend: data.onlineUsers.trend,
      isPositive: data.onlineUsers.trend >= 0,
    },
    {
      title: "Avg Session Time",
      value: data.avgSessionTime.count.toFixed(2),
      trend: data.avgSessionTime.trend,
      isPositive: data.avgSessionTime.trend >= 0,
      unit: "minutes",
    },
    {
      title: "Playing Now",
      value: data.playingNow.count,
      trend: data.playingNow.trend,
      isPositive: data.playingNow.trend >= 0,
    },
    {
      title: "Joins",
      value: mockedJoins,
      trend: 1.3,
      isPositive: true,
    },
    {
      title: "Leaves",
      value: mockedLeaves,
      trend: 12.1,
      isPositive: false,
    },
  ];
  // #endregion

  return (
    <motion.div
      className="w-full min-h-screen bg-gray-50 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div
        className="mx-auto"
        style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}
      >
        {/* #region Header */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BreadcrumbsNavigation
            items={BREADCRUMB_PATHS[ROUTES.USER_ACTIVITY]}
          />
        </motion.div>
        {/* #endregion */}

        {/* #region Activity Charts */}
        <ActivityChartsSection data={playingUserStats} className="mb-6" />
        {/* #endregion */}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* #region Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {statsData.map((stat, index) => (
              <ActivityStatCard
                key={index}
                index={index}
                title={stat.title}
                value={stat.value}
                trend={stat.trend}
                isPositive={stat.isPositive}
                unit={stat.unit}
              />
            ))}
          </div>
          {/* #endregion */}

          {/* #region Roles Chart */}
          <RolesSection />
          {/* #endregion */}
        </div>
      </div>
    </motion.div>
  );
};

export default UserActivityAnalytics;
