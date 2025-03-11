import { motion } from "framer-motion";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import TrendIndicator from "@/components/common/TrendIndicator";

interface MusicStatCardProps {
  label: string;
  value: number;
  change: number;
  isPositive: boolean;
  tooltipContent?: string;
  index: number;
}

const MusicStatCard = ({ 
  label, 
  value, 
  change, 
  isPositive, 
  tooltipContent,
  index 
}: MusicStatCardProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 30 }
      }}
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <Card className="p-6 h-30">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="h-full flex flex-col justify-between"
        >
          <motion.div className="flex justify-between items-start">
            <motion.span 
              variants={item}
              className="text-gray-500 text-sm font-medium"
            >
              {label}
            </motion.span>
            {tooltipContent && (
              <ClickableTooltip content={<p>{tooltipContent}</p>}>
                <motion.span
                  whileHover={{ 
                    scale: 1.15,
                    backgroundColor: "rgba(209, 213, 219, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                >
                  ?
                </motion.span>
              </ClickableTooltip>
            )}
          </motion.div>

          <motion.div 
            variants={item}
            className="flex-1 flex items-center"
          >
            <motion.span 
              className="text-2xl font-bold"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {value.toLocaleString()}
            </motion.span>
          </motion.div>

          <motion.div 
            variants={item}
            className="text-sm text-gray-500 flex justify-between"
          >
            <span>{change}% from last month</span>
            <TrendIndicator 
              unit="%" 
              value={change} 
              isPositive={isPositive} 
            />
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default MusicStatCard;