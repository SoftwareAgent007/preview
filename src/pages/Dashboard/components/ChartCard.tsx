import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";

interface ChartCardProps {
  title?: string;
  tooltipContent?: string;
  children: React.ReactNode;
  className?: string;
  index: number;
}

const ChartCard = ({ title, tooltipContent, children, className = "", index }: ChartCardProps) => {
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

  const headerAnimation = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const contentAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.1 + 0.2
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.01,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      }}
      transition={{ duration: 0.3 }}
      className={`h-full ${className}`}
    >
      <Card className="relative p-6 h-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col h-full"
        >
          {title && (
            <motion.div 
              variants={headerAnimation}
              className="flex justify-between items-center mb-4"
            >
              <span className="text-gray-500 text-md font-bold">{title}</span>
              {tooltipContent && (
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
              )}
            </motion.div>
          )}
          
          <motion.div 
            variants={contentAnimation}
            className="flex-1"
          >
            {children}
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ChartCard;