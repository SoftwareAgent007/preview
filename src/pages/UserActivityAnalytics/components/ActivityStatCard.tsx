import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import TrendIndicator from "@/components/common/TrendIndicator";

interface ActivityStatCardProps {
  title: string;
  value: string | number;
  trend: number;
  isPositive: boolean;
  unit?: string;
  index: number;
}

const ActivityStatCard = ({ title, value, trend, isPositive, unit = '%', index }: ActivityStatCardProps) => {
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
      className="w-full h-full"
    >
      <Card className="p-6 h-[160px] hover:scale-[101%] transition-all duration-150">
        <div className="h-full flex flex-col gap-3">
          <span className="text-gray-500 text-sm md:text-base font-medium">{title}</span>
          <div className="flex flex-col gap-1">
            <motion.span 
              className="text-xl md:text-2xl lg:text-3xl font-bold"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {value}
              {unit === 'minutes' && ' minutes'}
            </motion.span>
            <TrendIndicator 
              unit={unit} 
              value={typeof trend === 'number' ? trend : parseFloat(trend)} 
              isPositive={isPositive} 
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ActivityStatCard;