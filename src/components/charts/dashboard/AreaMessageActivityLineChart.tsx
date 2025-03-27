import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  count: number;
}

interface AreaMessageActivityLineChartProps {
  data: DataPoint[];
  width: number;
  height?: number;
  graphColor?: string;
  title?: string;
  showTooltip?: boolean;
  showGridLines?: boolean;
  animate?: boolean;
  darkMode?: boolean;
}

const AreaMessageActivityLineChart: React.FC<AreaMessageActivityLineChartProps> = ({ 
  data, 
  width, 
  height = 300,
  viewType,
  graphColor = "#3B82F6",
  title,
  showTooltip = true,
  showGridLines = true,
  animate = true,
  darkMode = false
}) => {

  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredData, setHoveredData] = useState<DataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Theme colors based on dark mode
  const textColor = darkMode ? "#e2e8f0" : "#64748b";
  const axisColor = darkMode ? "#475569" : "#cbd5e1";
  const backgroundColor = darkMode ? "#1e293b" : "transparent";
  const gridColor = darkMode ? "#334155" : "#e2e8f0";
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = {
      top: 1,
      right: 30,
      left: 60,
      bottom: viewType === 'yearly' ? 50 :
              viewType === 'monthly' ? 60 :
              viewType === 'weekly' ? 80 : 70
    };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", backgroundColor)
      .style("border-radius", "8px")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add a background rect for better visibility
    svg.append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", backgroundColor)
      .attr("rx", 8);

    const filteredData = data.slice(0, 90);

    // Use band scale for categorical x-axis
    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, chartWidth])
      .padding(0.3);
    
    // Add padding to y domain for better visualization
    const yExtent = d3.extent(data, d => +d.count) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    
    const y = d3.scaleLinear()
      .domain([Math.max(0, yExtent[0] - yPadding), yExtent[1] + yPadding])
      .range([chartHeight, 0]);
    
    // Add grid lines if enabled
    if (showGridLines) {
      // Add X grid lines
      svg.append("g")
        .attr("class", "grid x-grid")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(
          d3.axisBottom(x)
            .tickSize(-chartHeight)
            .tickFormat(() => "")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .attr("stroke", gridColor)
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "3,3"));
      
      // Add Y grid lines
      svg.append("g")
        .attr("class", "grid y-grid")
        .call(
          d3.axisLeft(y)
            .ticks(5)
            .tickSize(-chartWidth)
            .tickFormat(() => "")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .attr("stroke", gridColor)
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "3,3"));
    }
    
    // Add X axis with styled ticks
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x)
        .tickSizeOuter(0)
        .tickPadding(10));
    
    xAxis.selectAll("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-45)")
      .attr("fill", textColor)
      .attr("font-size", "12px");
    
    xAxis.selectAll("line")
      .attr("stroke", axisColor);
    
    xAxis.select(".domain")
      .attr("stroke", axisColor);
    
    // Add Y axis with styled ticks
    const yAxis = svg.append("g")
      .attr("transform", "translate(-5,0)")
      .call(d3.axisLeft(y)
        .tickSizeOuter(0)
        .tickPadding(10)
        .ticks(5)
        .tickFormat(d => d3.format(+d >= 1000 ? "~s" : "~d")(+d)));
    
    yAxis.selectAll("text")
      .attr("fill", textColor)
      .attr("font-size", "12px");
    
    yAxis.selectAll("line")
      .attr("stroke", axisColor);
    
    yAxis.select(".domain")
      .attr("stroke", axisColor);
    
    // Create gradient for area
    const gradientId = `area-gradient-${Math.random().toString(36).substring(2, 9)}`;
    
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", graphColor)
      .attr("stop-opacity", 0.7);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", graphColor)
      .attr("stop-opacity", 0.1);
    
    // Create area generator using band scale
    const area = d3.area<DataPoint>()
      .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
      .y0(chartHeight)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);
    
    // Create line generator using band scale
    const line = d3.line<DataPoint>()
      .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);
    
    if (animate) {
      // Create a clip path for the running animation
      const clipId = `clip-${Math.random().toString(36).substring(2, 9)}`;
      
      svg.append("defs")
        .append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("width", 0)
        .attr("height", chartHeight)
        .transition()
        .duration(1500)
        .ease(d3.easeQuadInOut)
        .attr("width", chartWidth);
      
      // Add area path with running animation
      const areaPath = svg.append("path")
        .datum(filteredData)
        .attr("fill", `url(#${gradientId})`)
        .attr("stroke", "none")
        .attr("clip-path", `url(#${clipId})`)
        .attr("d", area);
      
      // Add line path with running animation
      const linePath = svg.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", graphColor)
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("clip-path", `url(#${clipId})`)
        .attr("d", line);
      
      // Add data points with delayed appearance
      const dataPoints = svg.selectAll(".data-point")
        .data(filteredData)
        .join("circle")
        .attr("class", "data-point")
        .attr("cx", d => (x(d.date) || 0) + x.bandwidth() / 2)
        .attr("cy", d => y(d.count))
        .attr("r", 0)
        .attr("fill", "white")
        .attr("stroke", graphColor)
        .attr("stroke-width", 2);
      
      // Delay the appearance of points based on their x position
      dataPoints.each(function(d, i) {
        const point = d3.select(this);
        const xPos = (x(d.date) || 0) + x.bandwidth() / 2;
        const delay = (xPos / chartWidth) * 1500;
        
        point.transition()
          .delay(delay)
          .duration(300)
          .attr("r", 4);
      });
    } else {
      // Non-animated version
      svg.append("path")
        .datum(filteredData)
        .attr("fill", `url(#${gradientId})`)
        .attr("stroke", "none")
        .attr("d", area);
      
      svg.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", graphColor)
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);
      
      svg.selectAll(".data-point")
        .data(filteredData)
        .join("circle")
        .attr("class", "data-point")
        .attr("cx", d => (x(d.date) || 0) + x.bandwidth() / 2)
        .attr("cy", d => y(d.count))
        .attr("r", 4)
        .attr("fill", "white")
        .attr("stroke", graphColor)
        .attr("stroke-width", 2);
    }
    
    // Add interactive overlay for tooltip
    if (showTooltip) {
      const overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all");
      
      // Vertical line for tooltip
      const tooltipLine = svg.append("line")
        .attr("class", "tooltip-line")
        .attr("stroke", textColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .style("opacity", 0);
      
      // Tooltip circle indicator
      const tooltipCircle = svg.append("circle")
        .attr("class", "tooltip-circle")
        .attr("r", 6)
        .attr("fill", graphColor)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("opacity", 0);
      
      overlay
        .on("mousemove", function(event) {
          const [mouseX] = d3.pointer(event);
          const bandWidth = x.bandwidth();
          const index = Math.floor(mouseX / (chartWidth / data.length));
          const d = data[Math.min(Math.max(0, index), data.length - 1)];
          
          const xPos = (x(d.date) || 0) + bandWidth / 2;
          
          tooltipLine
            .attr("x1", xPos)
            .attr("x2", xPos)
            .style("opacity", 1);
          
          tooltipCircle
            .attr("cx", xPos)
            .attr("cy", y(d.count))
            .style("opacity", 1);
          
          setHoveredData(d);
          setTooltipPosition({
            x: xPos + margin.left,
            y: y(d.count) + margin.top - 20
          });
        })
        .on("mouseleave", function() {
          tooltipLine.style("opacity", 0);
          tooltipCircle.style("opacity", 0);
          setHoveredData(null);
        });
    }
    
    // Add title if provided
    if (title) {
      svg.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", textColor)
        .text(title);
    }
    
  }, [data, width, height, graphColor, showTooltip, showGridLines, animate, darkMode]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
      {showTooltip && hoveredData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none bg-white dark:bg-gray-800 shadow-lg rounded-md px-3 py-2 text-sm z-10"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {hoveredData.date}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: graphColor }}
            ></div>
            <span className="font-semibold" style={{ color: graphColor }}>
              {hoveredData.count.toLocaleString()}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AreaMessageActivityLineChart;