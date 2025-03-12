import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import UsersDetailedNavigation from "./UsersDetailedNavigation";
import { Outlet, useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
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

const UsersDetailedActivityAnalytics = () => {
  const location = useLocation();
  
  const getBreadcrumbPath = () => {
    if (location.pathname.includes('gaming')) {
      return ROUTES.USER_ACTIVITY_DETAILED_GAMING;
    } else if (location.pathname.includes('status')) {
      return ROUTES.USER_ACTIVITY_DETAILED_STATUS;  
    } else if (location.pathname.includes('presence')) {
      return ROUTES.USER_ACTIVITY_DETAILED_PRESENCE;
    }
    return ROUTES.USER_ACTIVITY_DETAILED;
  };

  return (
    <motion.div 
      className="w-full min-h-screen bg-gray-50 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4"
          variants={itemVariants}
        >
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[getBreadcrumbPath()]} />
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Full Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex items-center justify-between mb-4 md:mb-6 px-2 md:px-6"
          variants={itemVariants}
        >
          <UsersDetailedNavigation />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-sm"
        >
          <Outlet />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UsersDetailedActivityAnalytics;