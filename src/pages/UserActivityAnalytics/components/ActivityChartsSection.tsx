import { motion } from "framer-motion";
import ActivityCharts from "@/components/charts/userActivityTimeline/expandedUserActivityCharts";
import { DataSet } from "@/components/common/types/userAnalytic.types";

interface ActivityChartsSectionProps {
  data: DataSet;
  className?: string;
}

const ActivityChartsSection = ({ data, className = "" }: ActivityChartsSectionProps) => {
  return (
    <motion.div 
      className={`flex flex-col items-center gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.3
      }}
    >
      <ActivityCharts data={data} className="mb-6"/>
    </motion.div>
  );
};

export default ActivityChartsSection;