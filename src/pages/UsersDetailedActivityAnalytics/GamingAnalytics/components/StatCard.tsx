import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  index: number;
}

const StatCard = ({ title, value, subtitle, index }: StatCardProps) => {
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
      <Card className="p-6 h-30 hover:scale-[101%] transition-all duration-150">
        <motion.div 
          className="h-full flex flex-col items-left justify-center"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="text-gray-500 text-sm font-medium">{title}</span>
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