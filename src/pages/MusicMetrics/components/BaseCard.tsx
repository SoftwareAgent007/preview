import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
}

const BaseCard = ({ children, className = "" }: BaseCardProps) => {
  return (
    <Card className={`flex-1 p-6 h-100 ${className} hover:scale-[101%] transition-all duration-150`}>
      <motion.div 
        className="h-full flex flex-col"
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 24
            }
          }
        }}
      >
        {children}
      </motion.div>
    </Card>
  );
};

export default BaseCard;