import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { Expand, Minimize, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { StatusDistribution } from "@/pages/UsersDetailedActivityAnalytics/PresenceAnalytics/interfaces/presence-activirt.interfaces";

// Define proper interfaces for type safety
interface StatusCounts {
  [key: string]: number;
}

interface DataPoint {
  hour: number;
  statusCounts: StatusCounts;
}

interface LineDataPoint {
  hour: number;
  value: number;
}

interface PresenceWeekActivityChartProps {
  data: StatusDistribution;
  pageWrapperWidth: number;
  chartWrapperWidth: number;
  darkMode?: boolean;
}

interface ModalProps {
  closeModal: () => void;
  data: StatusDistribution;
  darkMode?: boolean;
}

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
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
      stiffness: 400,
      damping: 30
    }
  }
};

const chartVariants = {
  hidden: {
    opacity: 0,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay: 0.1
    }
  }
};

// Status colors with semantic meaning
const statusColors: Record<string, string> = {
  online: "#10b981", // Green
  offline: "#6b7280", // Gray
  idle: "#f59e0b", // Amber
  dnd: "#ef4444", // Red
};

const PresenceWeekActivityChart: React.FC<PresenceWeekActivityChartProps> = ({ 
  data,
  chartWrapperWidth,
  pageWrapperWidth,
  darkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [hoveredPoint, setHoveredPoint] = useState<{hour: number, status: string, value: number} | null>(null);

  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight] = useState(400);
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth);
      }
    });
    
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [chartRef.current]);

  useEffect(() => {
    if (!svgRef.current || !data) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get the maximum length of any status array to determine the number of hours
    const maxHours = Math.max(
      data.online.length,
      data.idle.length,
      data.dnd.length,
      data.offline.length
    );

    // Create an array of hour numbers (1 to maxHours)
    const hours = Array.from({ length: maxHours }, (_, i) => i + 1);

    // Create the x scale
    const x = d3.scaleBand()
      .domain(hours.map(d => d.toString()))
      .range([0, width])
      .padding(0.2);

    // Find the maximum value across all status arrays
    const maxValue = Math.max(
      ...data.online,
      ...data.idle,
      ...data.dnd,
      ...data.offline
    );

    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .attr("color", darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
      .attr("stroke-dasharray", "5,5");

    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .attr("color", darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
      .attr("stroke-dasharray", "5,5");

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "axis")
      .call(d3.axisBottom(x).tickFormat(d => {
        const hourNum = parseInt(d.toString());
        return (chartWidth < 768 && hourNum % 2 !== 0) ? "" : `${hourNum}`;
      }))
      .attr("color", darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .attr("color", darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)");

    // Create line generator
    const line = d3.line<[number, number]>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d[0].toString())! + x.bandwidth() / 2)
      .y(d => y(d[1]));

    // Add tooltip
    const tooltip = g.append("g")
      .attr("class", "tooltip")
      .style("display", "none")
      .style("pointer-events", "none");
    
    tooltip.append("rect")
      .attr("fill", darkMode ? "#374151" : "white")
      .attr("stroke", darkMode ? "#4B5563" : "#E5E7EB")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", 120)
      .attr("height", 50);
    
    tooltip.append("text")
      .attr("x", 60)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", darkMode ? "white" : "black")
      .attr("font-size", "12px");
    
    tooltip.append("text")
      .attr("x", 60)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("fill", darkMode ? "white" : "black")
      .attr("font-size", "14px")
      .attr("font-weight", "bold");

    // Add vertical line for hover
    const verticalLine = g.append("line")
      .attr("class", "vertical-line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .style("display", "none");

    // Handle mouse events
    svg.on("mousemove", (event) => {
      const [xPos] = d3.pointer(event, g.node());
      const hourIndex = Math.floor(xPos / (width / hours.length));
      const hour = hours[hourIndex];
      
      if (hourIndex < 0 || hourIndex >= hours.length) return;

      let statusKey = selectedStatus;
      let statusValue = 0;

      if (selectedStatus === "all") {
        statusKey = "online";
      }

      switch (statusKey) {
        case "online":
          statusValue = data.online[hour - 1] || 0;
          break;
        case "idle":
          statusValue = data.idle[hour - 1] || 0;
          break;
        case "dnd":
          statusValue = data.dnd[hour - 1] || 0;
          break;
        case "offline":
          statusValue = data.offline[hour - 1] || 0;
          break;
      }

      // Position vertical line
      verticalLine
        .attr("x1", x(hour.toString())! + x.bandwidth() / 2)
        .attr("x2", x(hour.toString())! + x.bandwidth() / 2)
        .style("display", "block");
      
      // Update tooltip
      tooltip.style("display", "block")
        .attr("transform", `translate(${x(hour.toString())! + x.bandwidth() / 2 - 60},${y(statusValue) - 60})`);
      
      tooltip.select("text:nth-child(2)")
        .text(`${hour > 12 ? hour - 12 : hour}${hour === 12 ? 'pm' : hour > 12 ? 'pm' : 'am'}`);

      tooltip.select("text:nth-child(3)")
        .text(`${statusKey}: ${statusValue.toLocaleString()}`)
        .attr("fill", statusColors[statusKey] || (darkMode ? "white" : "black"));
      
      // Update hovered point state
      setHoveredPoint({
        hour,
        status: statusKey,
        value: statusValue
      });
    });
    
    svg.on("mouseleave", () => {
      tooltip.style("display", "none");
      verticalLine.style("display", "none");
      setHoveredPoint(null);
    });

    // Draw lines for each status
    const statusKeys = Object.keys(data) as Array<keyof StatusDistribution>;
    
    statusKeys.forEach((key, statusIndex) => {
      if (selectedStatus !== "all" && selectedStatus !== key) return;

      // Create points array for this status
      const points: [number, number][] = data[key].map((value, index) => [index + 1, value]);

      // Create gradient for area
      const gradientId = `gradient-${key}`;
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
        
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", statusColors[key])
        .attr("stop-opacity", 0.3);
        
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", statusColors[key])
        .attr("stop-opacity", 0.05);

      // Add area with gradient
      const area = d3.area<[number, number]>()
        .x(d => x(d[0].toString())! + x.bandwidth() / 2)
        .y0(height)
        .y1(d => y(d[1]));

      const areaPath = g.append("path")
        .datum(points)
        .attr("fill", `url(#${gradientId})`)
        .attr("d", area)
        .attr("opacity", 0);

      // Add line with animation
      const path = g.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", statusColors[key])
        .attr("stroke-width", selectedStatus === key ? 3 : 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

      // Animate path drawing
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1800)
        .delay(statusIndex * 200)
        .ease(d3.easeQuadInOut)
        .attr("stroke-dashoffset", 0)
        .on("start", function() {
          areaPath
            .transition()
            .duration(1800)
            .delay(statusIndex * 200)
            .ease(d3.easeQuadInOut)
            .attr("opacity", 0.7);
        });

      // Add points
      const circles = g.selectAll(null)
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[0].toString())! + x.bandwidth() / 2)
        .attr("cy", d => y(d[1]))
        .attr("r", 0)
        .attr("fill", statusColors[key])
        .attr("stroke", darkMode ? "#1F2937" : "white")
        .attr("stroke-width", 2);

      // Animate points
      points.forEach((_, i) => {
        const pointDelay = statusIndex * 200 + (i / (points.length - 1)) * 1800;
        circles.filter((_, j) => j === i)
          .transition()
          .duration(400)
          .delay(pointDelay)
          .ease(d3.easeElasticOut.amplitude(1).period(0.3))
          .attr("r", selectedStatus === key ? 6 : 4);
      });
    });

  }, [data, selectedStatus, chartWidth, chartHeight, darkMode]);

  return (
    <div className={`w-full h-full flex flex-col ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center my-4">
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
          <SelectTrigger className={`w-40 h-8 text-xs ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(data).map((key) => (
              <SelectItem key={key} value={key} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full inline-block mr-2" 
                  style={{ backgroundColor: statusColors[key] || '#888' }}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative flex-1" ref={chartRef}>
        <svg 
          ref={svgRef} 
          className="w-full h-full"
          style={{ overflow: "visible" }}
        ></svg>
      </div>
    </div>
  );
};

const Modal = ({ closeModal, data, darkMode = false }: ModalProps) => {
  const modalRoot = document.getElementById('modal-root') || document.body;
  
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={closeModal}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30
        }}
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl relative modal-content max-w-5xl w-full`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Hourly Presence Status Activity
          </h2>
          <button 
            onClick={closeModal}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <Minimize className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        <div className="p-6 h-[calc(90vh-80px)]">
          <PresenceWeekActivityChart data={data} pageWrapperWidth={pageWrapperWidth} chartWrapperWidth={chartWrapperWidth} darkMode={darkMode} />
        </div>
      </motion.div>
    </motion.div>,
    modalRoot
  );
};

const ExpandablePresenceChart: React.FC<PresenceWeekActivityChartProps> = ({ data, pageWrapperWidth, chartWrapperWidth, darkMode = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log('chartWrapperWidth1', chartWrapperWidth);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <Card className={`w-full h-[512px] overflow-hidden hover:scale-[101%] transition-all duration-150 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>
      <motion.div className="h-full flex flex-col">
        <motion.div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <motion.div className="flex items-center gap-2">
            <h3 className="text-gray-500 text-base md:text-lg font-bold">
              Hourly Presence Status Activity
            </h3>
            <ClickableTooltip content={
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <strong>Hourly Activity:</strong> Shows user presence status activity over the past week
              </motion.p>
            }>
              <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
            </ClickableTooltip>
          </motion.div>
          <button
            onClick={openModal}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
          >
            <Expand className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </motion.div>
        
        <div className="flex-1 px-2 pb-2">
          <PresenceWeekActivityChart data={data} pageWrapperWidth={pageWrapperWidth} chartWrapperWidth={chartWrapperWidth} darkMode={darkMode} />
        </div>
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

export default ExpandablePresenceChart;
