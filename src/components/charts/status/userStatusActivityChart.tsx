import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import { Expand, Minimize, Info, ChevronDown } from 'lucide-react';
import { ClickableTooltip } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define proper types for the data
interface StatusCount {
  [key: string]: number;
}

interface DataPoint {
  day: number;
  statusCounts: StatusCount;
}

interface StatusActivityChartProps {
  data: DataPoint[];
  darkMode?: boolean;
}

interface ModalProps {
  closeModal: () => void;
  data: DataPoint[];
  darkMode?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const chartVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.2
    }
  }
};

// Color palette for status lines
const statusColors: { [key: string]: string } = {
  "Gaming Time": "#3B82F6", // Blue
  "AFK": "#8B5CF6",         // Purple
  "Voice": "#F59E0B",       // Amber
  "Studying": "#10B981",    // Emerald
  "Chatting": "#EF4444"     // Red
};

const StatusActivityChart: React.FC<StatusActivityChartProps> = ({ data, darkMode = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartRef = useRef<HTMLDivElement>(null); 
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [hoveredPoint, setHoveredPoint] = useState<{day: number, status: string, value: number} | null>(null);
  
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(500);
  
  // Theme colors
  const textColor = darkMode ? '#e2e8f0' : '#64748b';
  const backgroundColor = darkMode ? '#1e293b' : '#ffffff';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const tooltipBgColor = darkMode ? '#0f172a' : 'white';
  const tooltipTextColor = darkMode ? '#e2e8f0' : '#334155';
  const tooltipBorderColor = darkMode ? '#475569' : '#e2e8f0';
  
  const updateChartDimensions = () => {
    if (chartRef.current) {
      setChartWidth(chartRef.current.offsetWidth * 1.01); 
      setChartHeight(chartRef.current.offsetHeight); 
    }
  };

  useEffect(() => {
    updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);
    return () => window.removeEventListener("resize", updateChartDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 80, bottom: 50, left: 60 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add chart background
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", backgroundColor)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("opacity", 0.3);

    const x = d3.scaleBand()
      .domain(data.map(d => d.day.toString()))
      .range([0, width])
      .padding(0.2);

    // Find the maximum value across all status counts
    const maxValue = d3.max(data, d => 
      d3.max(Object.values(d.statusCounts) as number[]) || 0
    ) || 0;

    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding
      .range([height, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.3)
      .call(
        d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke", gridColor)
        .attr("stroke-dasharray", "3,3")
      );

    // Add x-axis with styled ticks
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(x)
        .tickFormat(d => (chartWidth < 768 && +d % 2 !== 0 ? "" : d))
      )
      .call(g => g.select(".domain").attr("stroke", gridColor))
      .call(g => g.selectAll(".tick line").attr("stroke", gridColor))
      .call(g => g.selectAll(".tick text")
        .attr("fill", textColor)
        .attr("font-size", "12px")
        .attr("font-weight", "500")
      );

    // Add x-axis label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("fill", textColor)
      .attr("font-size", "14px")
      .text("Day");

    // Add y-axis with styled ticks
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(5))
      .call(g => g.select(".domain").attr("stroke", gridColor))
      .call(g => g.selectAll(".tick line").attr("stroke", gridColor))
      .call(g => g.selectAll(".tick text")
        .attr("fill", textColor)
        .attr("font-size", "12px")
        .attr("font-weight", "500")
      );

    // Add y-axis label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("fill", textColor)
      .attr("font-size", "14px")
      .text("Count");

    const line = d3.line<{day: number, value: number}>()
      .curve(d3.curveCatmullRom)
      .x(d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
      .y(d => y(d.value));
    
    // Create a transparent overlay for better hover detection
    const overlay = g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    // Create tooltip
    const tooltip = g.append("g")
      .attr("class", "tooltip")
      .style("display", "none")
      .style("pointer-events", "none");
    
    tooltip.append("rect")
      .attr("fill", tooltipBgColor)
      .attr("stroke", tooltipBorderColor)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", 120)
      .attr("height", 50)
      .attr("opacity", 0.9);
    
    tooltip.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", tooltipTextColor)
      .attr("font-size", "12px")
      .attr("font-weight", "bold");
    
    tooltip.append("text")
      .attr("x", 10)
      .attr("y", 40)
      .attr("fill", tooltipTextColor)
      .attr("font-size", "12px");

    // Create legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 20}, 0)`);

    const statusKeys = Object.keys(data[0].statusCounts);
    
    statusKeys.forEach((key, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`)
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedStatus(selectedStatus === key ? "all" : key);
        });
      
      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 3)
        .attr("y", 10)
        .attr("rx", 1.5)
        .attr("ry", 1.5)
        .attr("fill", statusColors[key] || d3.schemeCategory10[i % 10]);
      
      legendItem.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .attr("dy", ".35em")
        .attr("fill", textColor)
        .attr("font-size", "12px")
        .text(key);
    });

    // Add hover effects and lines for each status
    statusKeys.forEach((key, i) => {
      const color = statusColors[key] || d3.schemeCategory10[i % 10];
      const isSelected = selectedStatus === "all" || selectedStatus === key;
      const lineOpacity = isSelected ? 1 : 0.2;
      const lineWidth = isSelected ? 3 : 1.5;
      
      // Create line path
      const path = g.append("path")
        .datum(data.map(d => ({ day: d.day, value: d.statusCounts[key] || 0 })))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", lineWidth)
        .attr("opacity", lineOpacity)
        .attr("d", line);
      
      // Add animation
      const pathLength = path.node()?.getTotalLength() || 0;
      path.attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
      
      // Add data points
      g.selectAll(`circle-${key}`)
        .data(data)
        .join("circle")
        .attr("cx", d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
        .attr("cy", d => y(d.statusCounts[key] || 0))
        .attr("r", isSelected ? 4 : 3)
        .attr("fill", backgroundColor)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("opacity", lineOpacity)
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          setHoveredPoint({
            day: d.day,
            status: key,
            value: d.statusCounts[key] || 0
          });
          
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr("r", 6);
          
          tooltip.style("display", "block")
            .attr("transform", `translate(${(x(d.day.toString()) || 0) + (x.bandwidth() / 2) - 60},${y(d.statusCounts[key] || 0) - 60})`);
          
          tooltip.select("rect")
            .transition()
            .duration(200)
            .attr("width", key.length > 10 ? 140 : 120);
          
          tooltip.select("text:first-of-type")
            .text(`Day ${d.day}`);
          
          tooltip.select("text:last-of-type")
            .text(`${key}: ${d.statusCounts[key]}`);
        })
        .on("mouseout", (event) => {
          setHoveredPoint(null);
          
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr("r", isSelected ? 4 : 3);
          
          tooltip.style("display", "none");
        });
    });

    // Add hover line for x-axis
    overlay.on("mousemove", (event) => {
      const [xPos] = d3.pointer(event);
      const dayIndex = Math.floor(xPos / (width / data.length));
      
      if (dayIndex < 0 || dayIndex >= data.length) return;
      
      const closestData = data[dayIndex];
      if (!closestData) return;
      
      const hoverLine = g.selectAll(".hover-line").data([null]);
      
      hoverLine.enter()
        .append("line")
        .attr("class", "hover-line")
        .merge(hoverLine as any)
        .attr("x1", (x(closestData.day.toString()) || 0) + (x.bandwidth() / 2))
        .attr("x2", (x(closestData.day.toString()) || 0) + (x.bandwidth() / 2))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", gridColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.7);
    });
    
    overlay.on("mouseleave", () => {
      g.selectAll(".hover-line").remove();
    });

  }, [data, selectedStatus, chartWidth, chartHeight, darkMode]);

  return (
    <div ref={chartRef} className="w-full h-[600px] flex flex-col items-left">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-4"
        >
          <Select 
            value={selectedStatus} 
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <SelectValue placeholder="Select Status" />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
            </motion.div>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {data[0] && Object.keys(data[0].statusCounts).map((key) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: statusColors[key] || '#888' }}
                    />
                    <span>{key}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="ml-4 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: statusColors[hoveredPoint.status] || '#888' }}
                />
                <span className="text-sm font-medium">
                  Day {hoveredPoint.day}: <span className="font-semibold">{hoveredPoint.value}</span> {hoveredPoint.status}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          variants={chartVariants}
          className="relative w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4"
        >
          <svg className="w-full h-full" ref={svgRef}></svg>
        </motion.div>
      </motion.div>
    </div>
  );
};
export interface DayData {
  day: number
  statusCounts: { [key: string]: number }
}
export interface ExpandablePresenceChartProps {
  data: DayData[];
  darkMode?: boolean;
}

const ExpandablePresenceChart = ({ data, darkMode = false }: ExpandablePresenceChartProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Card className="flex-1 p-6 hover:shadow-md transition-all duration-150 h-[724px] dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="flex justify-between items-center mb-4"
          variants={itemVariants}
        >
          <div className="title flex items-center gap-3">
            <motion.span 
              className="text-gray-700 dark:text-gray-200 text-lg font-bold"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Status Duration Timeline
            </motion.span>
            <ClickableTooltip content={
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-xs p-2"
              >
                <p className="text-sm">
                  <strong>User Status Duration Timeline:</strong> Shows the popularity levels of different user statuses over time.
                </p>
                <ul className="mt-2 text-xs space-y-1">
                  {Object.entries(statusColors).map(([status, color]) => (
                    <li key={status} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span>{status}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            }>
              <motion.div 
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1 rounded-full cursor-help"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: darkMode ? "rgba(55, 65, 81, 1)" : "rgba(243, 244, 246, 1)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Info className="w-4 h-4" />
              </motion.div>
            </ClickableTooltip>
          </div>
          <motion.button
            onClick={openModal}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            whileHover={{ 
              scale: 1.1,
              backgroundColor: darkMode ? "rgba(55, 65, 81, 1)" : "rgba(243, 244, 246, 1)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Expand className="w-4 h-4" />
          </motion.button>
        </motion.div>
        <StatusActivityChart data={data} darkMode={darkMode} />
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <Modal 
            closeModal={closeModal} 
            data={data}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </Card>
  );
};

const Modal: React.FC<ModalProps> = ({ closeModal, data, darkMode = false }) => {
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={handleOutsideClick}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl relative modal-content max-w-5xl w-full`}
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-6"
        >
          <motion.h2 
            className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-xl font-bold`}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Status Duration Timeline
          </motion.h2>
          <motion.button
            whileHover={{ 
              scale: 1.1,
              backgroundColor: darkMode ? "rgba(55, 65, 81, 1)" : "rgba(243, 244, 246, 1)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={closeModal}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
          >
            <Minimize className="w-5 h-5" />
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center h-[70vh]"
        >
          <StatusActivityChart data={data} darkMode={darkMode} />
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ExpandablePresenceChart;
