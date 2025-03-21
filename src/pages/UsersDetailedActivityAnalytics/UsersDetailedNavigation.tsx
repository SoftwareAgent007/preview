import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/routes.constant";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navigationVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.95 }
};

const UsersDetailedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path.toLowerCase());
  };

  const navigationItems = [
    { label: "Gaming", path: ROUTES.USER_ACTIVITY_DETAILED_GAMING },
    { label: "Presence", path: ROUTES.USER_ACTIVITY_DETAILED_PRESENCE },
  ];

  return (
    <motion.div 
      className="flex  gap-2 sm:gap-4 w-full sm:w-auto justify-center"
      variants={navigationVariants}
      initial="hidden"
      animate="visible"
    >
      {navigationItems.map((item, index) => (
        <motion.div
          key={item.label}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          custom={index}
        >
          <Button
            className={`
              transition-all duration-200 min-w-[100px] px-4 py-2
              ${isActive(item.label) 
                ? "bg-blue-500 text-white shadow-md" 
                : "bg-white text-gray-700 hover:bg-sky-300 hover:text-white"
              }
              text-sm sm:text-base font-medium
              rounded-md
              hover:shadow-lg
            `}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default UsersDetailedNavigation;