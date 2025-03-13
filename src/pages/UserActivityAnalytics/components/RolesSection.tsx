import { motion } from "framer-motion";
import RolesChart from "@/components/charts/userActivityTimeline/userRolesChart";

const RolesSection = () => {
  return (
    <motion.div 
      className="flex-1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.4
      }}
    >
      <RolesChart />
    </motion.div>
  );
};

export default RolesSection;