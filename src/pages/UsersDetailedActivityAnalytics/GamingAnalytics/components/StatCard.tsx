import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  index: number;
  tooltip?: string;
  height?: string;
}

const StatCard = ({ title, value, subtitle, index, tooltip, height }: StatCardProps) => {
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
      <Card className={`p-6 hover:scale-[101%] transition-all duration-150`} style={{ height }}>
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
          <motion.span 
            className="text-2xl font-bold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.span>
          <span className="text-sm text-gray-500">{subtitle}</span>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default StatCard;