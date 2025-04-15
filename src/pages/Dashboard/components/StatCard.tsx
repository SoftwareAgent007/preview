import { motion, AnimatePresence } from "framer-motion";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import TrendIndicator from "@/components/common/TrendIndicator";
import { DashboardContext } from "@/common/context/queryContext";
import { useContext, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExtraInfo {
  netChange?: number;
  newUsersCount?: number;
  departedUsersCount?: number;
  [key: string]: any;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  trend: number;
  isTrendPositive: boolean;
  tooltipContent: string;
  index?: number;
  isExtraData?: boolean;
  extraInfo?: ExtraInfo;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  trend, 
  isTrendPositive, 
  tooltipContent,
  index = 0,
  isExtraData = false,
  extraInfo
}: StatCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const showExpandButton = isExtraData && extraInfo && Object.keys(extraInfo).length > 0;

  const dashboardContext = useContext(DashboardContext);
  const periodDays = dashboardContext?.selectedPeriod?.from ? 
    Math.round((dashboardContext.selectedPeriod.to!.getTime() - dashboardContext.selectedPeriod.from.getTime()) / (1000 * 60 * 60 * 24)) : 30;
  
  const selectedPeriod = {
    type: periodDays <= 30 ? 'week' : periodDays <= 365 ? 'month' : 'year',
    count: Math.ceil(periodDays / (periodDays <= 30 ? 7 : periodDays <= 365 ? 30 : 365))
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: index * 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const numberAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  const tooltipAnimation = {
    hidden: { opacity: 0, scale: 0 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        delay: 0.3
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 30
        }
      }}
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <Card className="relative p-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-left justify-center"
        >
          <motion.span 
            variants={item}
            className="text-gray-500 text-sm font-medium"
          >
            {title}
          </motion.span>
          
          <motion.span 
            variants={numberAnimation}
            className="text-2xl font-bold"
          >
            {value.toLocaleString()}
          </motion.span>
          
          <motion.span 
            variants={item}
            className="text-xs text-gray-500"
          >
            {description}
          </motion.span>
        
          <motion.div 
            variants={item}
            className="text-sm text-gray-500 mt-2 flex justify-between items-center"
          >
            <span>{trend}% from last {selectedPeriod.count} {selectedPeriod.type}</span>
            <TrendIndicator 
              unit="%" 
              value={trend} 
              isPositive={isTrendPositive} 
            />
          </motion.div>

          <AnimatePresence>
            {isExpanded && extraInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                  {extraInfo.netChange !== undefined && (
                    <p className="text-sm text-gray-600">Net Change: <span className="font-medium">{extraInfo.netChange}</span></p>
                  )}
                  {extraInfo.newUsersCount !== undefined && (
                    <p className="text-sm text-gray-600">New Users: <span className="font-medium">{extraInfo.newUsersCount}</span></p>
                  )}
                  {extraInfo.departedUsersCount !== undefined && (
                    <p className="text-sm text-gray-600">Departed Users: <span className="font-medium">{extraInfo.departedUsersCount}</span></p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showExpandButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute bottom-2 right-2 mt-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          <motion.div 
            variants={tooltipAnimation}
            className="absolute top-2 right-2"
          >
            <ClickableTooltip content={<p>{tooltipContent}</p>}>
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
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default StatCard;