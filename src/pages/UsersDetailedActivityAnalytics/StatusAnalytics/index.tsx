import StatusActivityChart from "@/components/charts/status/userStatusActivityChart";
import { motion } from "framer-motion";
import { useState } from "react";
import DataTableSection from "./components/DataTableSection";
import HeatmapSection from "./components/HeatmapSection";
import StatusStatCard from "./components/StatusStatCard";
import TopGamingStatuses from "./components/TopGamingStatuses";
import { useMockActivityData, useStatusData, useStatusPageAnalyticsResponse } from "@/hooks/mockedApiService";

const StatusPageComponent = () => {
  // #region Hooks and State
  const presenceAnalyticsResponse = useStatusPageAnalyticsResponse();
  const activityData = useMockActivityData(15);
  const statusData = useStatusData();
  const [selectedStatus, setStatus] = useState('Studying');
  // #endregion

  // #region Constants
  const mockerStatuses = [
    { value: "Gaming Time", label: "Gaming Time" },
    { value: "AFK", label: "AFK" },
    { value: "Voice", label: "Voice" },
    { value: "Studying", label: "Studying" },
    { value: "Chatting", label: "Chatting" },
  ];

  const statsData = [
    {
      title: "Total Unique Statuses",
      value: presenceAnalyticsResponse.totalUniqueStatuses,
      trend: 5,
      isPositive: true
    },
    {
      title: "Avg Status Duration",
      value: presenceAnalyticsResponse.avgStatusDuration,
      trend: -3,
      isPositive: false
    },
    {
      title: "Peak Activity Time",
      value: presenceAnalyticsResponse.peakActivityTime,
      showTrend: false
    },
    {
      title: "Update Frequency",
      value: presenceAnalyticsResponse.updateFrequency,
      showTrend: false
    }
  ];
  // #endregion

  // #region Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };
  // #endregion

  return (
    <motion.div 
      className="w-full bg-gray-50 p-4 md:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* #region Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        variants={itemVariants}
      >
        {statsData.map((stat, index) => (
          <StatusStatCard
            key={stat.title}
            index={index}
            {...stat}
          />
        ))}
      </motion.div>
      {/* #endregion */}

      {/* #region Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
        variants={itemVariants}
      >
        <StatusActivityChart />
        <TopGamingStatuses topStatusMessages={presenceAnalyticsResponse.topStatusMessages}/>
      </motion.div>
      {/* #endregion */}

      {/* #region Heatmap Section */}
      <HeatmapSection
        selectedStatus={selectedStatus}
        setStatus={setStatus}
        activityData={activityData}
        mockerStatuses={mockerStatuses}
      />
      {/* #endregion */}

      {/* #region Data Table Section */}
      <DataTableSection data={statusData} />
      {/* #endregion */}
    </motion.div>
  );
};

export default StatusPageComponent;
