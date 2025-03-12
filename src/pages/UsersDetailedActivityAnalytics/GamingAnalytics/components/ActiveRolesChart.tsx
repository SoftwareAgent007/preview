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

interface ActiveRolesChartProps {
  data: RolesData[];
}

const ActiveRolesChart = ({ data }: ActiveRolesChartProps) => {
  // #region Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const tooltipVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };
  // #endregion

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6"
    >
      <Card className="p-6 h-full hover:scale-[101%] transition-all duration-150">
        <motion.div 
          className="title text-gray-500 text-lg font-bold mb-4 flex items-center"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="mr-5">Active Roles Playing Now</span>
          <ClickableTooltip 
            content={
              <motion.p
                variants={tooltipVariants}
                initial="hidden"
                animate="visible"
              >
                <strong>Active Roles Playing Now: </strong> 
                Active roles chart shows the percentage of people with different roles playing at the same time.
              </motion.p>
            }
          >
            <motion.span 
              className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: "rgba(209, 213, 219, 0.4)" 
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              ?
            </motion.span>
          </ClickableTooltip>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.2
          }}
        >
          <CircleRoleChart data={data} />
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ActiveRolesChart;