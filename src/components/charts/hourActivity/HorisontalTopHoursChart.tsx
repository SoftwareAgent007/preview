import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

interface DataPoint {
  hour: number;
  users: number;
}

interface HorizontalTopHoursChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  barColor?: string;
  darkMode?: boolean;
}

const HorizontalTopHoursChart: React.FC<HorizontalTopHoursChartProps> = ({ 
  data, 
  width = 460, 
  height = 400,
  barColor = '#3B82F6',
  darkMode = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartInitializedRef = useRef<boolean>(false);
  const [hoveredBar, setHoveredBar] = useState<DataPoint | null>(null);

  // Theme colors
  const textColor = darkMode ? '#e2e8f0' : '#64748b';
  const labelColor = darkMode ? '#94a3b8' : '#94a3b8';
  const backgroundBarColor = darkMode ? '#334155' : '#f1f5f9';
  const tooltipBgColor = darkMode ? '#0f172a' : 'white';
  const tooltipTextColor = darkMode ? '#e2e8f0' : '#334155';
  const borderColor = darkMode ? '#475569' : '#e2e8f0';

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || !width || !height) return;
    
    // Prevent re-initialization if already rendered
    if (chartInitializedRef.current) return;
    chartInitializedRef.current = true;

    d3.select(svgRef.current).selectAll("*").remove();

    // Sort data by users in descending order and take top 5
    const top5Data = [...data].sort((a, b) => b.users - a.users).slice(0, 5);

    // Responsive margins
    const margin = {
      top: Math.max(20, height * 0.05),
      right: Math.max(30, width * 0.15),
      bottom: Math.max(20, height * 0.05),
      left: Math.max(50, width * 0.1)
    };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Responsive font sizes
    const fontSize = Math.max(12, Math.min(14, width * 0.025));
    const usersFontSize = Math.max(12, Math.min(14, width * 0.025));

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxusers = d3.max(top5Data, d => +d.users) || 0;

    const x = d3.scaleLinear()
      .domain([0, maxusers * 1.1]) // Add 10% padding
      .range([0, chartWidth]);

    const y = d3.scaleBand()
      .range([0, chartHeight])
      .domain(top5Data.map(d => `${d.hour}`))
      .padding(0.4);

    // Create gradient for bars
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

    // Background bars
    svg.selectAll("backgroundRect")
      .data(top5Data)
      .join("rect")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("width", chartWidth)
        .attr("height", y.bandwidth())
        .attr("fill", backgroundBarColor)
        .attr("rx", Math.min(6, y.bandwidth() / 2))
        .attr("ry", Math.min(6, y.bandwidth() / 2))
        .attr("opacity", 0.5);

    // Data bars with animation
    const bars = svg.selectAll("dataRect")
      .data(top5Data)
      .join("rect")
        .attr("class", "data-bar")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("height", y.bandwidth())
        .attr("fill", "url(#bar-gradient)")
        .attr("rx", Math.min(6, y.bandwidth() / 2))
        .attr("ry", Math.min(6, y.bandwidth() / 2))
        .attr("width", 0) // Start with width 0 for animation
        .attr("opacity", 0.9)
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          setHoveredBar(d);
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

    // Hour labels
    svg.selectAll("hourLabels")
      .data(top5Data)
      .join("text")
        .attr("x", -10)
        .attr("y", d => (y(`${d.hour}`) || 0) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(d => `${d.hour}:00`)
        .attr("font-size", `${fontSize}px`)
        .attr("fill", textColor)
        .attr("font-weight", "600");

    // Run animation
    bars.transition()
      .duration(1000)
      .delay((_, i) => i * 100)
      .attr("width", d => x(+d.users))
      .on("end", (_, i, nodes) => {
        if (i === nodes.length - 1) {
          // Add users labels after animation completes
          svg.selectAll("usersLabels")
            .data(top5Data)
            .join("text")
              .attr("x", d => x(+d.users) + 8)
              .attr("y", d => (y(`${d.hour}`) || 0) + y.bandwidth() / 2)
              .attr("dy", ".35em")
              .attr("fill", labelColor)
              .attr("font-size", `${usersFontSize}px`)
              .attr("font-weight", "500")
              .attr("opacity", 0)
              .text(d => `${d.users.toLocaleString()} users`)
              .transition()
              .duration(500)
              .attr("opacity", 1);
        }
      });

  }, [data, width, height, barColor, darkMode]);

  // Reset initialization flag when key props change
  useEffect(() => {
    return () => {
      chartInitializedRef.current = false;
    };
  }, [data, width, height, darkMode]);

  return (
    <div className="relative w-full h-full flex flex-col">      
      {/* Chart container */}
      <div className="relative flex-1 flex items-center justify-center">
        <motion.svg 
          ref={svgRef} 
          className="w-full h-full" 
          preserveAspectRatio="xMidYMid meet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        <AnimatePresence>
          {hoveredBar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute pointer-events-none shadow-lg rounded-lg p-3 z-10"
              style={{
                backgroundColor: tooltipBgColor,
                color: tooltipTextColor,
                border: `1px solid ${borderColor}`,
                top: `${(height / (data.length > 5 ? 5 : data.length)) * ([...data].sort((a, b) => b.users - a.users).findIndex(d => d.hour === hoveredBar.hour) + 0.5)}px`,
                right: "20px",
                minWidth: "150px"
              }}
            >
              <div className="font-medium mb-2 text-sm">
                <span className="block text-base mb-1">Time Period</span>
                {hoveredBar.hour}:00 - {(hoveredBar.hour + 1) % 24}:00
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs opacity-80">Active Users</div>
                <div className="font-bold text-lg" style={{ color: barColor }}>
                  {hoveredBar.users.toLocaleString()}
                </div>
                <div className="text-xs mt-1 opacity-70">
                  {Math.round((hoveredBar.users / (d3.max([...data].map(d => d.users)) || 1)) * 100)}% of peak activity
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HorizontalTopHoursChart;