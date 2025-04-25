import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import TrendIndicator from "@/components/common/TrendIndicator";
import { DashboardContext } from "@/common/context/queryContext";
import { useContext } from "react";

interface TrendIndicatorProps {
  trend: number;
  isTrendPositive: boolean;
  size?: "sm" | "md" | "lg";
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  isTrendPositive?: boolean;
  tooltip?: string;
  index: number;
  height?: string;
  unitParam?: string;
}

const StatCard = ({ title, value, subtitle, trend, isTrendPositive, tooltip, index, height = "140px", unitParam }: StatCardProps) => {
  const dashboardContext = useContext(DashboardContext);
  const periodDays = dashboardContext?.selectedPeriod?.from ? 
    Math.round((dashboardContext.selectedPeriod.to!.getTime() - dashboardContext.selectedPeriod.from.getTime()) / (1000 * 60 * 60 * 24)) : 30;
  
  const selectedPeriod = {
    type: periodDays <= 30 ? 'week' : periodDays <= 365 ? 'month' : 'year',
    count: Math.ceil(periodDays / (periodDays <= 30 ? 7 : periodDays <= 365 ? 30 : 365))
  };
  
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
      className="flex-1"
    >
      <Card 
        className={`p-6 hover:scale-[101%] transition-all duration-150 border-l-4 ${
          trend !== undefined && trend !== 0
            ? isTrendPositive
              ? "border-l-emerald-500"
              : "border-l-rose-500"
            : "border-l-gray-200"
        }`} 
        style={{ height }}
      >
        <motion.div 
          className="h-full flex flex-col items-left justify-between"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium">{title}</span>
            
            {tooltip && (
              <ClickableTooltip content={<p>{tooltip}</p>}>
                <motion.span
                  whileHover={{ 
                    scale: 1.15,
                    backgroundColor: "rgba(209, 213, 219, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }}
                  className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                >
                  ?
                </motion.span>
              </ClickableTooltip>
            )}
          </div>
          <div className="flex items-end gap-2">
            <motion.span 
              className="text-2xl font-bold"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.span>
            {trend !== undefined && (
              <TrendIndicator 
                value={trend.toLocaleString()} 
                unit={`${unitParam || "%"} from last ${selectedPeriod.count.toLocaleString()} ${selectedPeriod.type}`}
                isPositive={isTrendPositive ?? false} 
              />
            )}
          </div>
          <span className="text-sm text-gray-500">{subtitle}</span>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default StatCard;