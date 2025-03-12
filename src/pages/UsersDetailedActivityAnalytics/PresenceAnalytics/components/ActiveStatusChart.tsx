import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import CircleRoleChart from "@/components/charts/circleChartOfRoles";

interface RolesData {
  role: string;
  count: number;
  percentage: number;
  color: string;
}

interface ActiveStatusChartProps {
  data: RolesData[];
}
const statusColors = [
  { label: "Online", color: "#33FF57" },
  { label: "Offline", color: "#FF5733" },
  { label: "Idle", color: "#FF33A8" },
  { label: "DND", color: "#3357FF" }
];

const ActiveStatusChart = ({ data }: ActiveStatusChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full"
    >
      <Card className="flex-1 p-6 hover:scale-[101%] transition-all duration-150 h-full">
        <motion.div className="flex flex-col">
          <motion.div 
            className="title flex items-center mb-4"
            whileHover={{ x: 5 }}
          >
            <span className="text-gray-500 text-lg font-bold mr-5">Active Status</span>
            <ClickableTooltip 
              content={
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <strong>Active States: </strong> 
                  A chart showing the ratio of users who are online, AFK (away from keyboard), 
                  in "Do Not Disturb" mode, and offline leaders over the last seven days.
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CircleRoleChart data={data} />
          </motion.div>

          <motion.div 
            className="legend flex flex-wrap justify-center gap-4 md:gap-8 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {statusColors.map((status, index) => (
              <motion.div 
                key={status.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div 
                  className="w-6 h-6 rounded-md" 
                  style={{ backgroundColor: status.color }} 
                />
                <span className="text-lg font-medium">{status.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ActiveStatusChart;