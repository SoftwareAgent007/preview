import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { Expand, Minimize, Info, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClickableTooltip } from "@/components/ui/tooltip";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Define proper interfaces for type safety
interface StatusCounts {
  [key: string]: number;
}

interface DataPoint {
  day: number;
  statusCounts: StatusCounts;
}

interface LineDataPoint {
  day: number;
  value: number;
}

interface PresenceActivityChartProps {
  data?: DataPoint[];
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

// Status colors with semantic meaning
const statusColors: Record<string, string> = {
  Online: "#10b981", // Green
  Offline: "#6b7280", // Gray
  Idle: "#f59e0b", // Amber
  DND: "#ef4444", // Red
  Gaming: "#3b82f6", // Blue
  Streaming: "#8b5cf6", // Purple
  Working: "#0ea5e9", // Sky
  Studying: "#8b5cf6", // Purple
  Chatting: "#ec4899", // Pink
};

// Sample data
const sampleData: DataPoint[] = [
  { day: 1, statusCounts: { Online: 100, Offline: 50, Idle: 30, DND: 20 } }, 
  { day: 2, statusCounts: { Online: 120, Offline: 40, Idle: 25, DND: 15 } }, 
  { day: 3, statusCounts: { Online: 140, Offline: 30, Idle: 20, DND: 10 } }, 
  { day: 4, statusCounts: { Online: 130, Offline: 35, Idle: 22, DND: 12 } }, 
  { day: 5, statusCounts: { Online: 125, Offline: 38, Idle: 24, DND: 14 } }, 
  { day: 6, statusCounts: { Online: 135, Offline: 28, Idle: 18, DND: 9 } }, 
  { day: 7, statusCounts: { Online: 145, Offline: 25, Idle: 15, DND: 8 } },
  { day: 8, statusCounts: { Online: 155, Offline: 20, Idle: 10, DND: 5 } },
  { day: 9, statusCounts: { Online: 160, Offline: 15, Idle: 8, DND: 4 } },
  { day: 10, statusCounts: { Online: 150, Offline: 25, Idle: 12, DND: 6 } },
  { day: 11, statusCounts: { Online: 140, Offline: 30, Idle: 15, DND: 8 } },
  { day: 12, statusCounts: { Online: 130, Offline: 35, Idle: 18, DND: 10 } },
  { day: 13, statusCounts: { Online: 120, Offline: 40, Idle: 20, DND: 12 } },
  { day: 14, statusCounts: { Online: 110, Offline: 45, Idle: 22, DND: 14 } },
  { day: 15, statusCounts: { Online: 100, Offline: 50, Idle: 25, DND: 16 } },
  { day: 16, statusCounts: { Online: 105, Offline: 48, Idle: 23, DND: 15 } },
  { day: 17, statusCounts: { Online: 115, Offline: 43, Idle: 21, DND: 13 } },
  { day: 18, statusCounts: { Online: 125, Offline: 38, Idle: 19, DND: 11 } },
  { day: 19, statusCounts: { Online: 135, Offline: 33, Idle: 17, DND: 9 } },
  { day: 20, statusCounts: { Online: 145, Offline: 28, Idle: 15, DND: 7 } },
  { day: 21, statusCounts: { Online: 155, Offline: 23, Idle: 13, DND: 5 } },
  { day: 22, statusCounts: { Online: 165, Offline: 18, Idle: 11, DND: 3 } },
  { day: 23, statusCounts: { Online: 160, Offline: 20, Idle: 12, DND: 4 } },
  { day: 24, statusCounts: { Online: 150, Offline: 25, Idle: 14, DND: 6 } },
  { day: 25, statusCounts: { Online: 140, Offline: 30, Idle: 16, DND: 8 } },
  { day: 26, statusCounts: { Online: 130, Offline: 35, Idle: 18, DND: 10 } },
  { day: 27, statusCounts: { Online: 120, Offline: 40, Idle: 20, DND: 12 } },
  { day: 28, statusCounts: { Online: 110, Offline: 45, Idle: 22, DND: 14 } },
  { day: 29, statusCounts: { Online: 100, Offline: 50, Idle: 24, DND: 16 } },
  { day: 30, statusCounts: { Online: 95, Offline: 55, Idle: 26, DND: 18 } }
];

const PresenceActivityChart: React.FC<PresenceActivityChartProps> = ({ 
  data = sampleData,
  darkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [hoveredPoint, setHoveredPoint] = useState<{day: number, status: string, value: number} | null>(null);
  
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(400);
  
  // Theme colors
  const textColor = darkMode ? '#e2e8f0' : '#64748b';
  const backgroundColor = darkMode ? '#1e293b' : '#ffffff';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const tooltipBgColor = darkMode ? '#0f172a' : 'white';
  const tooltipTextColor = darkMode ? '#e2e8f0' : '#334155';
  const tooltipBorderColor = darkMode ? '#475569' : '#e2e8f0';
  
  const updateChartDimensions = () => {
    if (chartRef.current) {
      setChartWidth(chartRef.current.offsetWidth);
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

    // Create x scale with proper typing
    const x = d3.scaleBand()
      .domain(data.map(d => d.day.toString()))
      .range([0, width])
      .padding(0.2);

    // Find max value for y scale with proper typing
    const maxValue = d3.max(data, d => {
      return d3.max(Object.values(d.statusCounts)) || 0;
    }) || 0;

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
        .tickFormat(d => {
          const dayNum = parseInt(d);
          return dayNum <= 30 ? (dayNum % 5 === 0 || dayNum === 1 ? `Day ${dayNum}` : "") : "";
        })
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

    // Create line generator with proper typing
    const line = d3.line<LineDataPoint>()
      .curve(d3.curveCatmullRom)
      .x(d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
      .y(d => y(d.value));
    
    // Create area generator for fills
    const area = d3.area<LineDataPoint>()
      .curve(d3.curveCatmullRom)
      .x(d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
      .y0(height)
      .y1(d => y(d.value));
    
    // Create a transparent overlay for better hover detection
    const overlay = g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    // Create vertical line for hover effect
    const verticalLine = g.append("line")
      .attr("class", "hover-line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", darkMode ? "#475569" : "#94a3b8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0);
    
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

    // Add hover interaction
    overlay.on("mousemove", function(event) {
      const [mouseX] = d3.pointer(event);
      const xPos = mouseX;
      
      // Find the closest day to the mouse position
      const bandWidth = width / data.length;
      const dayIndex = Math.floor(xPos / bandWidth);
      const day = dayIndex + 1;
      
      if (day < 1 || day > data.length) return;
      
      const dataPoint = data[dayIndex];
      
      // Update vertical line position
      verticalLine
        .attr("x1", (x(day.toString()) || 0) + (x.bandwidth() / 2))
        .attr("x2", (x(day.toString()) || 0) + (x.bandwidth() / 2))
        .style("opacity", 1);
      
      // Show tooltip
      tooltip.style("display", "block");
      
      // Determine which status to show
      let statusToShow = selectedStatus;
      if (statusToShow === "all") {
        // Find the status with the highest value
        statusToShow = Object.entries(dataPoint.statusCounts)
          .reduce((max, [key, value]) => value > max[1] ? [key, value] : max, ["", 0])[0];
      }
      
      const value = dataPoint.statusCounts[statusToShow];
      
      // Position tooltip
      tooltip
        .attr("transform", `translate(${(x(day.toString()) || 0) + (x.bandwidth() / 2) - 60}, ${y(value) - 60})`);
      
      // Update tooltip text
      tooltip.select("text:nth-child(2)")
        .text(`Day ${day}`);
      
      tooltip.select("text:nth-child(3)")
        .text(`${statusToShow}: ${value}`);
      
      // Update hovered point for React state
      setHoveredPoint({
        day,
        status: statusToShow,
        value
      });
    });
    
    overlay.on("mouseleave", function() {
      verticalLine.style("opacity", 0);
      tooltip.style("display", "none");
      setHoveredPoint(null);
    });

    // Draw lines and areas for each status
    statusKeys.forEach((key, i) => {
      const color = statusColors[key] || d3.schemeCategory10[i % 10];
      
      // Create data for the line
      const lineData: LineDataPoint[] = data.map(d => ({
        day: d.day,
        value: d.statusCounts[key]
      }));
      
      // Draw area under the line with gradient
      const gradientId = `area-gradient-${key.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Create gradient
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.3);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.05);
      
      // Draw area
      g.append("path")
        .datum(lineData)
        .attr("fill", `url(#${gradientId})`)
        .attr("d", area)
        .attr("opacity", selectedStatus !== "all" && selectedStatus !== key ? 0.1 : 0.5);
      
      // Draw line
      g.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", selectedStatus === key || selectedStatus === "all" ? 2.5 : 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("opacity", selectedStatus !== "all" && selectedStatus !== key ? 0.3 : 1)
        .attr("d", line);
      
      // Add dots for data points
      g.selectAll(`.dot-${key}`)
        .data(lineData)
        .enter()
        .append("circle")
        .attr("class", `dot-${key}`)
        .attr("cx", d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
        .attr("cy", d => y(d.value))
        .attr("r", selectedStatus === key || selectedStatus === "all" ? 4 : 3)
        .attr("fill", color)
        .attr("stroke", backgroundColor)
        .attr("stroke-width", 1.5)
        .attr("opacity", selectedStatus !== "all" && selectedStatus !== key ? 0.3 : 1);
    });
  }, [data, selectedStatus, chartWidth, chartHeight, darkMode]);

  return (
    <div 
      ref={chartRef}
      className="w-full h-full flex flex-col"
      style={{ padding: "10px" }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedStatus === "all" ? "Showing all statuses" : `Showing: ${selectedStatus}`}
        </div>
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
        >
          <SelectTrigger className="w-[150px] h-8 text-sm">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {data.length > 0 && Object.keys(data[0].statusCounts).map(status => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: statusColors[status] || '#888' }}
                  />
                  {status}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative flex-1">
        <svg 
          ref={svgRef} 
          className="w-full h-full"
          style={{ overflow: "visible" }}
        ></svg>
      </div>
    </div>
  );
};

// Modal component for expanded view
const Modal: React.FC<ModalProps> = ({ closeModal, data, darkMode = false }) => {
  // Create portal for modal
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;
  
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeModal}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Presence Activity Timeline</h2>
          <button 
            onClick={closeModal}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Minimize className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 h-[calc(90vh-80px)]">
          <PresenceActivityChart data={data} darkMode={darkMode} />
        </div>
      </motion.div>
    </motion.div>,
    modalRoot
  );
};

// Expandable chart component
const ExpandablePresenceChart: React.FC<PresenceActivityChartProps> = ({ data = sampleData, darkMode = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <Card className="w-full h-[400px] overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">User Presence Activity</h3>
            <ClickableTooltip content="Shows user presence status activity over time">
              <Info className="w-4 h-4 text-gray-400" />
            </ClickableTooltip>
          </div>
          <button
            onClick={openModal}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Expand className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 px-2 pb-2">
          <PresenceActivityChart data={data} darkMode={darkMode} />
        </div>
      </div>

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
