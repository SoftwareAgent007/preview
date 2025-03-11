import { motion } from "framer-motion";
import BaseCard from "./BaseCard";
import TrendIndicator from "@/components/common/TrendIndicator";

interface SessionStats {
  current: number;
  previous: number;
  change: number;
  isPositive: boolean;
}

interface SessionStatsCardProps {
  stats: SessionStats;
}

const SessionStatsCard = ({ stats }: SessionStatsCardProps) => {
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <BaseCard>
      <motion.div
        className="flex flex-col justify-center items-center w-full h-full"
        variants={item}
      >
        <motion.div
          className="text-blue-600 text-5xl font-bold"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.floor(stats.current / 60)}h {stats.current % 60}m
        </motion.div>
        <motion.span className="text-gray-500 text-sm" variants={item}>
          Per session
        </motion.span>
        <motion.div
          className="border-t border-gray-300 my-4 w-3/4"
          variants={item}
        />
        <motion.div
          className="flex justify-between items-center w-3/4"
          variants={item}
        >
          <span className="text-gray-500 text-sm">
            {`Previous: ${Math.floor(stats.previous / 60)}h ${
              stats.previous % 60
            }m`}
          </span>
          <TrendIndicator
            unit="%"
            value={Number(stats.change.toFixed(1))}
            isPositive={stats.isPositive}
          />
        </motion.div>
      </motion.div>
    </BaseCard>
  );
};

export default SessionStatsCard;