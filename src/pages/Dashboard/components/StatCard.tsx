import { motion } from "framer-motion";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  tooltipContent: string;
  index: number;
}

const StatCard = ({ title, value, description, tooltipContent, index }: StatCardProps) => {
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
        delay: index * 0.1 + 0.2
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
        delay: index * 0.1 + 0.3
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
      <Card className="relative p-6 h-30 overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow duration-200">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="h-full flex flex-col items-left justify-center"
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
            className="text-sm text-gray-500"
          >
            {description}
          </motion.span>

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