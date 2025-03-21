import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { Expand, Minimize, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClickableTooltip } from "@/components/ui/tooltip";

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

interface PresenceWeekActivityChartProps {
  data?: DataPoint[];
  darkMode?: boolean;
}

interface ModalProps {
  closeModal: () => void;
  data: DataPoint[];
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
  { day: 7, statusCounts: { Online: 145, Offline: 25, Idle: 15, DND: 8 } }
];

const PresenceWeekActivityChart: React.FC<PresenceWeekActivityChartProps> = ({ 
  data = sampleData,
  darkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [hoveredPoint, setHoveredPoint] = useState<{day: number, status: string, value: number} | null>(null);

  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(500);

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
    if (!svgRef.current || !data.length) return;
    
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

    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.day.toString()))
      .range([0, width])
      .padding(0.2);

    const maxValue = d3.max(data, d => {
      return d3.max(Object.values(d.statusCounts)) || 0;
    }) || 0;

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
        const dayNum = parseInt(d.toString());
        return (chartWidth < 768 && dayNum % 2 !== 0) ? "" : `Day ${dayNum}`;
      }))
      .attr("color", darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .attr("color", darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)");

    // Create line generator
    const line = d3.line<LineDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
      .y(d => y(d.value));

    // Create area generator for fills
    const area = d3.area<LineDataPoint>()
      .curve(d3.curveMonotoneX)
      .x(d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
      .y0(height)
      .y1(d => y(d.value));

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
      const dayIndex = Math.floor(xPos / (width / data.length));
      const dayNum = dayIndex + 1;
      
      if (dayIndex < 0 || dayIndex >= data.length) return;
      
      const closestData = data[dayIndex];
      if (!closestData) return;
      
      const statusKey = selectedStatus === "all" 
        ? Object.keys(closestData.statusCounts)[0] 
        : selectedStatus;
      
      const statusValue = closestData.statusCounts[statusKey];
      
      // Position vertical line
      verticalLine
        .attr("x1", (x(dayNum.toString()) || 0) + (x.bandwidth() / 2))
        .attr("x2", (x(dayNum.toString()) || 0) + (x.bandwidth() / 2))
        .style("display", "block");
      
      // Update tooltip
      tooltip.style("display", "block")
        .attr("transform", `translate(${(x(dayNum.toString()) || 0) + (x.bandwidth() / 2) - 60},${y(statusValue) - 60})`);
      
      tooltip.select("text:nth-child(2)")
        .text(`Day ${dayNum}`);
      
      tooltip.select("text:nth-child(3)")
        .text(`${statusKey}: ${statusValue}`)
        .attr("fill", statusColors[statusKey] || (darkMode ? "white" : "black"));
      
      // Update hovered point state
      setHoveredPoint({
        day: dayNum,
        status: statusKey,
        value: statusValue
      });
    });
    
    svg.on("mouseleave", () => {
      tooltip.style("display", "none");
      verticalLine.style("display", "none");
      setHoveredPoint(null);
    });

    // Enhanced running animation on load
    Object.keys(data[0].statusCounts).forEach((key, statusIndex) => {
      if (selectedStatus !== "all" && selectedStatus !== key) return;
      
      const lineData = data.map(d => ({ day: d.day, value: d.statusCounts[key] || 0 }));
      
      // Create gradient for area
      const gradientId = `gradient-${key.replace(/\s+/g, '-').toLowerCase()}`;
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
      
      // Add area with progressive reveal animation
      const areaPath = g.append("path")
        .datum(lineData)
        .attr("fill", `url(#${gradientId})`)
        .attr("d", area)
        .attr("opacity", 0);
      
      // Add line with progressive drawing animation
      const path = g.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", statusColors[key])
        .attr("stroke-width", selectedStatus === key ? 3 : 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);
      
      // Animate path drawing with running effect
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
          // Fade in area as line is drawn
          areaPath
            .transition()
            .duration(1800)
            .delay(statusIndex * 200)
            .ease(d3.easeQuadInOut)
            .attr("opacity", 0.7);
        });
      
      // Add points with sequential appearance following the line
      const points = g.selectAll(`.point-${key}`)
        .data(lineData)
        .enter()
        .append("circle")
        .attr("class", `point-${key}`)
        .attr("cx", d => (x(d.day.toString()) || 0) + (x.bandwidth() / 2))
        .attr("cy", d => y(d.value))
        .attr("r", 0)
        .attr("fill", statusColors[key])
        .attr("stroke", darkMode ? "#1F2937" : "white")
        .attr("stroke-width", 2);
      
      // Animate points to appear sequentially along the path
      lineData.forEach((_, i) => {
        const pointDelay = statusIndex * 200 + (i / (lineData.length - 1)) * 1800;
        points.filter((_, j) => j === i)
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
      <div className="flex justify-between items-center mb-4">
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
          <SelectTrigger className={`w-40 h-8 text-xs ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {data.length > 0 && Object.keys(data[0].statusCounts).map((key) => (
              <SelectItem key={key} value={key} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full inline-block mr-2" 
                  style={{ backgroundColor: statusColors[key] || '#888' }}
                />
                {key}
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

// Enhanced modal animations
const Modal: React.FC<ModalProps> = ({ closeModal, data, darkMode = false }) => {
  // Create portal for modal
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
            Weekly Presence Activity
          </h2>
          <button 
            onClick={closeModal}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <Minimize className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        <div className="p-6 h-[calc(90vh-80px)]">
          <PresenceWeekActivityChart data={data} darkMode={darkMode} />
        </div>
      </motion.div>
    </motion.div>,
    modalRoot
  );
};

// Expandable chart component
const ExpandablePresenceChart: React.FC<PresenceWeekActivityChartProps> = ({ data = sampleData, darkMode = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <Card className={`w-full h-[512px] overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>
      <div className="h-full flex flex-col">
        <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Weekly Presence Activity
            </h3>
            <ClickableTooltip content="Shows user presence status activity over the past week">
              <Info className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </ClickableTooltip>
          </div>
          <button
            onClick={openModal}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
          >
            <Expand className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        
        <div className="flex-1 px-2 pb-2">
          <PresenceWeekActivityChart data={data} darkMode={darkMode} />
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
