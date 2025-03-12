import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import HorizontalBarChart from "@/components/charts/hourActivity/horizontalBarChart";
import { useEffect, useRef, useState } from "react";

interface HourlyActivityProps {
  hourlyActivity: Array<{ hour: number; count: number }>;
}

const HourlyActivity = ({ hourlyActivity }: HourlyActivityProps) => {
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
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className="w-full h-full"
    >
      <Card className="p-4 md:p-6 hover:scale-[101%] transition-all duration-150 h-full">
        <motion.div 
          className="flex flex-col"
          whileHover={{ x: 5 }}
          ref={chartRef}
        >
          <div className="title flex items-center mb-2 md:mb-4">
            <span className="text-gray-500 text-base md:text-lg font-bold mr-3 md:mr-5">Hourly Activity</span>
            <ClickableTooltip 
              content={
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm md:text-base"
                >
                  <strong>Hourly Activity:</strong> Displays the number of users at different hours of the day.
                </motion.p>
              }
            >
              <motion.span 
                className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(209, 213, 219, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                ?
              </motion.span>
            </ClickableTooltip>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full overflow-hidden"
          >
            <HorizontalBarChart 
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

export default HourlyActivity;