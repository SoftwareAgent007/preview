import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface PeakHour {
  hour: number;
  maxUsers: number;
  minUsers: number;
  avgUsers: number;
}

interface PeakActivityHoursProps {
  hourlyActivity: PeakHour[];
  width?: number;
}

const PeakActivityHours = ({ hourlyActivity, width = 500 }: PeakActivityHoursProps) => {
  const maxValue = Math.max(...hourlyActivity.map(hour => hour.maxUsers));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Peak Activity Hours</h3>
      <div className="space-y-4">
        {hourlyActivity.map((hour, index) => (
          <motion.div
            key={hour.hour}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {String(hour.hour).padStart(2, '0')}:00
              </span>
              <span className="text-sm text-gray-600">
                {hour.maxUsers} users
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(hour.maxUsers / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Min: {hour.minUsers}</span>
              <span>Avg: {Math.round(hour.avgUsers)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default PeakActivityHours;