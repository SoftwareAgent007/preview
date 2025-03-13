import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import HorizontalTopHoursChart from "@/components/charts/hourActivity/HorisontalTopHoursChart";
import { useEffect, useRef, useState } from "react";
import { PeakHour } from "../interfaces/presence-activirt.interfaces";

interface PeakActivityHoursProps {
  hourlyActivity: PeakHour[];
}

const PeakActivityHours = ({ hourlyActivity }: PeakActivityHoursProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const width = chartRef.current.offsetWidth - 48;
        const height = Math.min(400, window.innerHeight * 0.5);
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full h-full"
    >
      <Card className="p-4 md:p-6 hover:scale-[101%] transition-all duration-150 h-full">
        <motion.div 
          className="flex flex-col"
          whileHover={{ x: 5 }}
          ref={chartRef}
        >
          <span className="text-gray-500 text-base md:text-lg font-bold mb-2 md:mb-4">Peak Activity Hours</span>
          <span className="text-gray-500 text-xs md:text-sm mb-2">User activity distribution throughout the day</span>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full overflow-hidden"
          >
            <HorizontalTopHoursChart 
              data={hourlyActivity} 
              width={chartDimensions.width} 
              height={chartDimensions.height}
            />
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default PeakActivityHours;