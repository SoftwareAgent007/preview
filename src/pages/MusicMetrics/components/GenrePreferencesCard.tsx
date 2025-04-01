import { motion } from "framer-motion";
import HorizontalBarChartRelatedGenres from "@/components/charts/music/musicActivityChart";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useRef, useEffect, useState } from "react";
import BaseCard from "./BaseCard";

interface GenreData {
  genre: string;
  percentage: number;
  playCount: number;
}

interface GenrePreferencesCardProps {
  data: GenreData[];
}

const GenrePreferencesCard = ({ data }: GenrePreferencesCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setWidth(containerRef.current?.offsetWidth || 0);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef.current]);

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0 
    }
  };

  const filteredData = data.filter(item => 
    item.genre && 
    item.genre !== "Unknown" && 
    item.genre !== "unknown" &&
    item.genre !== "" &&
    item.genre !== "undefined" &&
    item.genre !== null
  );

  return (
    <BaseCard>
      <motion.div
        className="flex items-center gap-2 mb-2"
        variants={item}
      >
        <h3 className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <span className="text-gray-500 text-lg font-bold mb-4">Genre Preferences</span>
        </h3>
        <ClickableTooltip content="Shows user genre preferences based on listening history">
          <span className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} text-gray-600 px-[7px] rounded-full cursor-help transition-colors`}>?</span>
        </ClickableTooltip>
      </motion.div>
      
      <motion.div 
        ref={containerRef}
        variants={item}
        className="h-[350px] w-full"
      >
        <HorizontalBarChartRelatedGenres
          data={filteredData.slice(0, 7)}
          darkMode={isDarkMode}
          width={width * 0.9}
        />
      </motion.div>
    </BaseCard>
  );
};

export default GenrePreferencesCard;