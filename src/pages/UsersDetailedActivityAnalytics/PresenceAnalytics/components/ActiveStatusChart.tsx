import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import CircleRoleChart from "@/components/charts/circleChartOfRoles";
import { useEffect, useRef, useState } from "react";
import { StatusBreakdown } from "../interfaces/presence-activirt.interfaces";

interface ActiveStatusChartProps {
  data: StatusBreakdown[];
}

const statusColors = [
  { label: "Online", color: "#33FF57" },
  { label: "Offline", color: "#FF5733" },
  { label: "Idle", color: "#FF33A8" },
  { label: "DND", color: "#3357FF" }
];


const ActiveStatusChart = ({ data }: ActiveStatusChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const parentElement = chartRef.current.parentElement;
        const parentHeight = parentElement ? parentElement.offsetHeight : 0;
        
        // Get the width of the container
        const width = chartRef.current.offsetWidth;
        
        // Calculate height based on available space in the parent
        // Subtract any padding/margins if needed
        const availableHeight = parentHeight - 80; // Subtract space for title and padding
        
        // Use the available height, but ensure it's not too small
        const height = Math.max(availableHeight, width * 0.7);
        
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    
    // Create a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }
    
    // Also listen for window resize events
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full h-full flex flex-col"
    >
      <Card className="flex-1 p-4 md:p-6 hover:scale-[101%] transition-all duration-150 h-full flex flex-col">
        <motion.div className="flex flex-col h-full">
          <motion.div 
            className="title flex items-center mb-4"
            whileHover={{ x: 5 }}
          >
            <span className="text-gray-500 text-base md:text-lg font-bold mr-3 md:mr-5">Active Status</span>
            <ClickableTooltip 
              content={
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm md:text-base"
                >
                  <strong>Active States: </strong> 
                  A chart showing the ratio of users who are online, AFK (away from keyboard), 
                  in "Do Not Disturb" mode, and offline leaders over the last seven days.
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
          </motion.div>
          
          <motion.div
            ref={chartRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full flex-1 flex"
          >
            <CircleRoleChart 
              data={data} 
              width={chartDimensions.width} 
              height={chartDimensions.height}
            />
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ActiveStatusChart;