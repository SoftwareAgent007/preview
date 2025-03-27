import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import HorizontalBarChart from "@/components/charts/hourActivity/horizontalBarChart";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HourlyActivityProps {
  hourlyActivity: Array<{ hour: number; count: number }>;
  onDateChange: (date: Date) => void;
}

const HourlyActivity = ({ hourlyActivity, onDateChange }: HourlyActivityProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const [date, setDate] = useState<Date>(new Date());

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

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onDateChange(newDate);
    }
  };

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
          <div className="title flex items-center justify-between mb-2 md:mb-4">
            <div className="flex items-center">
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
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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