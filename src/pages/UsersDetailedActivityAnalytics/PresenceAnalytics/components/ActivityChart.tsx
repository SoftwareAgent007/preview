import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import HorizontalTopHoursChart from "@/components/charts/hourActivity/HorisontalTopHoursChart";
import HorizontalBarChart from "@/components/charts/hourActivity/horizontalBarChart";

interface ActivityChartsProps {
  hourlyActivity: any[]; // TODO: Replace with proper type
}

const ActivityCharts = ({ hourlyActivity }: ActivityChartsProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full"
      >
        <Card className="flex-1 p-6 hover:scale-[101%] transition-all duration-150 h-full">
          <motion.div 
            className="flex h-min flex-col"
            whileHover={{ x: 5 }}
          >
            <span className="text-gray-500 text-lg font-bold mb-4">Peak Activity Hours</span>
            <span className="text-gray-500 text-sm mb-2">User activity distribution throughout the day</span>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <HorizontalTopHoursChart data={hourlyActivity} height={400} width={500} />
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className="h-full"
      >
        <Card className="flex-1 p-6 hover:scale-[101%] transition-all duration-150 h-full">
          <motion.div 
            className="h-full flex flex-col"
            whileHover={{ x: 5 }}
          >
            <div className="title flex items-center mb-4">
              <span className="text-gray-500 text-lg font-bold mr-5">Hourly Activity</span>
              <ClickableTooltip 
                content={
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <strong>Hourly Activity:</strong> Displays the number of users at different hours of the day.
                  </motion.p>
                }
              >
                <motion.span 
                  className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(209, 213, 219, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  ?
                </motion.span>
              </ClickableTooltip>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <HorizontalBarChart data={hourlyActivity} height={500} width={500} />
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>
    </>
  );
};

export default ActivityCharts;