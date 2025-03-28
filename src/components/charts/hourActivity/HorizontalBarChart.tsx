import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays, isAfter, startOfToday } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ErrorComponent from '@/components/common/errorModel';
import ContentLoader from 'react-content-loader';

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

interface DataPoint {
  hour: number;
  count: number;
}

interface TooltipPosition {
  x: number;
  y: number;
}

interface HorizontalBarChartProps {
  data: number[];
  width?: number;
  height?: number;
  barColor?: string;
  darkMode?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onDateChange?: (date: Date) => void;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ 
  data, 
  width = 460, 
  height = 500,
  barColor = '#3B82F6',
  darkMode = false,
  isLoading = false,
  isError = false,
  onDateChange
}) => {
  
  const svgRef = useRef<SVGSVGElement>(null);
  const chartInitializedRef = useRef<boolean>(false);
  const [hoveredBar, setHoveredBar] = useState<DataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [animationComplete, setAnimationComplete] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [skipAnimation, setSkipAnimation] = useState(false);
  const today = startOfToday();

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate && !isAfter(newDate, today)) {
      setDate(newDate);
      onDateChange?.(newDate);
    }
  };

  const handlePrevDay = () => {
    setSkipAnimation(true);
    const newDate = subDays(date, 1);
    setDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNextDay = () => {
    setSkipAnimation(true);
    const newDate = addDays(date, 1);
    if (!isAfter(newDate, today)) {
      setDate(newDate);
      onDateChange?.(newDate);
    }
  };

  // Transform array data into DataPoint format
  const transformedData: DataPoint[] = data.map((count, index) => ({
    hour: index,
    count: count
  }));

  // Theme colors
  const textColor = darkMode ? '#e2e8f0' : '#64748b';
  const backgroundColor = darkMode ? '#1e293b' : '#f8fafc';
  const backgroundBarColor = darkMode ? '#334155' : '#f1f5f9';
  const tooltipBgColor = darkMode ? '#0f172a' : 'white';
  const tooltipTextColor = darkMode ? '#e2e8f0' : '#334155';
  const gridColor = darkMode ? '#475569' : '#e2e8f0';

  useEffect(() => {
    if (!svgRef.current || transformedData.length === 0 || !width || !height) return;
    
    // Prevent re-initialization if already rendered
    if (chartInitializedRef.current) return;
    chartInitializedRef.current = true;

    d3.select(svgRef.current).selectAll("*").remove();

    // Responsive margins
    const margin = {
      top: 0,
      right: Math.max(40, width * 0.01),
      bottom: 20,
      left: Math.max(40, width * 0.1)
    };

    const chartWidth = width * 0.9 - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom - 70;

    const fontSize = Math.max(12, Math.min(16, width * 0.03));

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", backgroundColor)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("opacity", 0.5);

    const maxCount = d3.max(transformedData, d => d.count) || 0;

    const x = d3.scaleLinear()
      .domain([0, maxCount === 0 ? 1 : maxCount * 1.1]) // Adjust domain if all values are 0
      .range([0, chartWidth]);

    const y = d3.scaleBand()
      .range([0, chartHeight])
      .domain(transformedData.map(d => `${d.hour}`))
      .padding(0.4);

    svg.selectAll("gridLines")
      .data(x.ticks(5))
      .join("line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", gridColor)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-dasharray", "3,3");

    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x)
        .ticks(5)
        .tickSize(0)
        .tickPadding(10))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text")
        .attr("fill", textColor)
        .attr("font-size", fontSize)
        .attr("font-weight", "500"));

    svg.append("g")
      .call(d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(d => {
          const hour = parseInt(d.toString());
          return `${hour}:00`;
        }))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text")
        .attr("fill", textColor)
        .attr("font-size", fontSize)
        .attr("font-weight", "500"));

    svg.selectAll("backgroundRect")
      .data(transformedData)
      .join("rect")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("width", maxCount === 0 ? 0 : chartWidth) // Don't show background if all values are 0
        .attr("height", y.bandwidth())
        .attr("fill", backgroundBarColor)
        .attr("rx", Math.min(5, y.bandwidth() / 2))
        .attr("ry", Math.min(5, y.bandwidth() / 2))
        .attr("opacity", 0.5);

    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", barColor)
      .attr("stop-opacity", 1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", barColor)
      .attr("stop-opacity", 0.7);

    const bars = svg.selectAll("dataRect")
      .data(transformedData)
      .join("rect")
        .attr("class", "data-bar")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("height", y.bandwidth())
        .attr("fill", "url(#bar-gradient)")
        .attr("rx", Math.min(5, y.bandwidth() / 2))
        .attr("ry", Math.min(5, y.bandwidth() / 2))
        .attr("width", 0)
        .attr("opacity", 0.9)
        .attr("cursor", "pointer")
        .on("mousemove", (event, d) => {
          setHoveredBar(d);
          setTooltipPosition({ x: event.pageX, y: event.pageY });
          d3.select(event.currentTarget)
            .attr("opacity", 1)
            .attr("stroke", barColor)
            .attr("stroke-width", 1);
        })
        .on("mouseout", (event) => {
          setHoveredBar(null);
          d3.select(event.currentTarget)
            .attr("opacity", 0.9)
            .attr("stroke", "none");
        });
    
    if (skipAnimation) {
      bars.attr("width", d => x(d.count));
      svg.selectAll("countLabels")
        .data(transformedData)
        .join("text")
          .attr("x", d => x(d.count) + 5)
          .attr("y", d => (y(`${d.hour}`) || 0) + y.bandwidth() / 2)
          .attr("dy", ".35em")
          .attr("fill", textColor)
          .attr("font-size", fontSize * 0.9)
          .attr("font-weight", "600")
          .attr("opacity", 1)
          .text(d => d.count.toLocaleString());
      setSkipAnimation(false);
    } else {
      bars.transition()
        .duration(300)
        .delay((_, i) => i * 50)
        .attr("width", d => x(d.count))
        .on("end", (_, i, nodes) => {
          if (i === nodes.length - 1) {
            setAnimationComplete(true);
            
            svg.selectAll("countLabels")
              .data(transformedData)
              .join("text")
                .attr("x", d => x(d.count) + 5)
                .attr("y", d => (y(`${d.hour}`) || 0) + y.bandwidth() / 2)
                .attr("dy", ".35em")
                .attr("fill", textColor)
                .attr("font-size", fontSize * 0.9)
                .attr("font-weight", "600")
                .attr("opacity", 0)
                .text(d => d.count.toLocaleString())
                .transition()
                .duration(400)
                .attr("opacity", 1);
          }
        });
    }

  }, [transformedData, width, height, barColor, darkMode, skipAnimation]);

  useEffect(() => {
    return () => {
      chartInitializedRef.current = false;
    };
  }, [data, width, height, darkMode]);
  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={handlePrevDay}>Previous</Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[240px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              disabled={(date) => isAfter(date, today)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button 
          variant="outline" 
          onClick={handleNextDay}
          disabled={isAfter(addDays(date, 1), today)}
        >
          Next
        </Button>
      </div>
      <div className="relative w-full h-[440px] flex items-center justify-center">
        {isLoading ? (
          skipAnimation ? (
            <div className="flex items-center justify-center h-full">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <CardSkeleton width="100%" height="433px" />
          )
        ) : isError ? (
          <ErrorComponent />
        ) : (
          <>
            <motion.svg 
              ref={svgRef} 
              className="w-full h-full" 
              preserveAspectRatio="xMidYMid meet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            />
            
            <AnimatePresence>
              {hoveredBar && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute pointer-events-none shadow-lg rounded-lg p-3 z-10"
                  style={{
                    backgroundColor: tooltipBgColor,
                    color: tooltipTextColor,
                    border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                    top: `${tooltipPosition.y - 450}px`,
                    right: "20px",
                    minWidth: "120px"
                  }}
                >
                  <div className="font-medium mb-1">{hoveredBar.hour}:00 - {(hoveredBar.hour + 1) % 24}:00</div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Activity:</span>
                    <span className="font-bold" style={{ color: barColor }}>
                      {hoveredBar.count.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default HorizontalBarChart;