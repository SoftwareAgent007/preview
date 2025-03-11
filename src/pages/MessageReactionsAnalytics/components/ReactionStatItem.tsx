import { motion } from "framer-motion";

interface ReactionStatItemProps {
  percentage: string;
  label: string;
  color: string;
  index: number;
}

const ReactionStatItem = ({ percentage, label, color, index }: ReactionStatItemProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ 
        opacity: 0, 
        scale: 0,
        y: 20 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: 0 
      }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <motion.span 
        className={`text-3xl font-semibold text-${color}-500`}
      >
        {percentage}%
      </motion.span>
      <span className="text-gray-700 text-sm">{label}</span>
    </motion.div>
  );
};

export default ReactionStatItem;