import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import TrendIndicator from "@/components/common/TrendIndicator";
import { ClickableTooltip } from "@/components/ui/tooltip";

interface ActivityStatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  isPositive?: boolean;
  unit?: string;
  index: number;
  tooltip: string;
}

const ActivityStatCard = ({ title, value, trend, isPositive, unit = '%', index, tooltip, icon }: ActivityStatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.1
      }}
      className="w-full"
    >
      <Card className="p-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between pr-4 pl-2">
          <div className="flex items-center gap-6">
            <motion.div className="flex items-center gap-2">
              <ClickableTooltip
                content={
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tooltip}
                  </motion.p>
                }
              >
                
                <motion.span
                  className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(209, 213, 219, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  ?
                </motion.span>
              </ClickableTooltip>
              {icon}
            </motion.div>
            <span className="text-gray-500 text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-lg font-bold"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {value}
              {unit === 'minutes' && ' minutes'}
            </motion.span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ActivityStatCard;