import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import TrendIndicator from "@/components/common/TrendIndicator";

interface StatusStatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  isPositive?: boolean;
  index: number;
  showTrend?: boolean;
}

const StatusStatCard = ({ title, value, trend, isPositive, index, showTrend = true }: StatusStatCardProps) => {
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
      <Card className="p-6 h-full hover:scale-[101%] transition-all duration-150">
        <div className="h-full flex flex-col items-left justify-start">
          <span className="text-gray-500 text-sm md:text-base font-medium">{title}</span>
          <motion.span 
            className="text-xl md:text-2xl lg:text-3xl font-bold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            {value}
          </motion.span>
          {showTrend && trend !== undefined && (
            <TrendIndicator unit="%" value={trend} isPositive={isPositive || false} />
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatusStatCard;