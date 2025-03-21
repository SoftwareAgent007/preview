import { motion } from "framer-motion";
import { useState } from "react";
import StatusActivityChart from "@/components/charts/status/userStatusActivityChart";
import DataTableSection from "./components/DataTableSection";
import HeatmapSection from "./components/HeatmapSection";
import StatusStatCard from "./components/StatusStatCard";
import TopGamingStatuses from "./components/TopGamingStatuses";
import { useStatusAnalytics } from "@/hooks/analytics/useStatusAnalytics";

const StatusPageComponent = () => {
  // #region Hooks and State
  const [selectedStatus, setStatus] = useState('Studying');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  const guildId = "123456789"; // Replace with actual guild ID or from props/context
  
  const { 
    statusAnalytics, 
    activityHeatmap, 
    statusList, 
    isLoading, 
    error 
  } = useStatusAnalytics(guildId, period, page, pageSize);
  // #endregion

  // #region Constants
  // Generate status options from actual data
  const statusOptions = statusList.statuses.map(status => ({
    value: status.status,
    label: status.status
  }));

  const statsData = [
    {
      title: "Total Unique Statuses",
      value: statusAnalytics.totalUniqueStatuses,
      trend: 5, // Consider calculating this from the data
      isPositive: true
    },
    {
      title: "Avg Status Duration",
      value: statusAnalytics.avgStatusDuration,
      trend: -3, // Consider calculating this from the data
      isPositive: false
    },
    {
      title: "Peak Activity Time",
      value: statusAnalytics.peakActivityTime,
      showTrend: false
    },
    {
      title: "Update Frequency",
      value: statusAnalytics.updateFrequency,
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

  // #region Handlers
  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month' | 'year') => {
    setPeriod(newPeriod);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };
  // #endregion

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading status analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading status data</div>;
  }

  return (
    <motion.div 
      className="w-full bg-gray-50 p-4 md:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* #region Period Selector */}
      <motion.div variants={itemVariants} className="flex justify-end space-x-2">
        <button 
          onClick={() => handlePeriodChange('day')} 
          className={`px-3 py-1 rounded ${period === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Day
        </button>
        <button 
          onClick={() => handlePeriodChange('week')} 
          className={`px-3 py-1 rounded ${period === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Week
        </button>
        <button 
          onClick={() => handlePeriodChange('month')} 
          className={`px-3 py-1 rounded ${period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Month
        </button>
        <button 
          onClick={() => handlePeriodChange('year')} 
          className={`px-3 py-1 rounded ${period === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Year
        </button>
      </motion.div>
      {/* #endregion */}

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
        <StatusActivityChart 
          data={statusAnalytics.statusDurationTimeline}
        />
        <TopGamingStatuses 
          topStatusMessages={statusAnalytics.topStatusMessages}
        />
      </motion.div>
      {/* #endregion */}

      {/* #region Heatmap Section */}
      <HeatmapSection
        selectedStatus={selectedStatus}
        setStatus={setStatus}
        activityData={activityHeatmap.heatmap}
        statusOptions={statusOptions.length > 0 ? statusOptions : [{ value: "Studying", label: "Studying" }]}
      />
      {/* #endregion */}

      {/* #region Data Table Section */}
      <DataTableSection 
        data={statusList.statuses} 
        total={statusList.total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      {/* #endregion */}
    </motion.div>
  );
};

export default StatusPageComponent;