import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

interface DataPoint {
  hour: number;
  count: number;
}

interface HorizontalBarChartProps {
  data: number[];
  width?: number;
  height?: number;
  barColor?: string;
  darkMode?: boolean;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ 
  data, 
  width = 460, 
  height = 500,
  barColor = '#3B82F6',
  darkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartInitializedRef = useRef<boolean>(false);
  const [hoveredBar, setHoveredBar] = useState<DataPoint | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

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
      right: Math.max(40, width * 0.01), // Increased right margin
      bottom: 20,
      left: Math.max(40, width * 0.1) // Increased left margin
    };

    const chartWidth = width * 0.9 - margin.left - margin.right; // Made chart thinner
    const chartHeight = height - margin.top - margin.bottom - 60; // Reduced bottom padding

    // Responsive font sizes
    const fontSize = Math.max(12, Math.min(16, width * 0.03));

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add subtle background
    svg.append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", backgroundColor)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("opacity", 0.5);

    const maxCount = d3.max(transformedData, d => d.count) || 0;

    const x = d3.scaleLinear()
      .domain([0, maxCount * 1.1]) // Add 10% padding
      .range([0, chartWidth]);

    const y = d3.scaleBand()
      .range([0, chartHeight])
      .domain(transformedData.map(d => `${d.hour}`))
      .padding(0.4);

    // Add subtle grid lines
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

    // X axis
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

    // Y axis with custom time formatting
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

    // Background bars
    svg.selectAll("backgroundRect")
      .data(transformedData)
      .join("rect")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("width", chartWidth)
        .attr("height", y.bandwidth())
        .attr("fill", backgroundBarColor)
        .attr("rx", Math.min(5, y.bandwidth() / 2))
        .attr("ry", Math.min(5, y.bandwidth() / 2))
        .attr("opacity", 0.5);

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

    // Data bars with animation - run only once
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
    
    // Run animation only once
    bars.transition()
      .duration(1000)
      .delay((_, i) => i * 50)
      .attr("width", d => x(d.count))
      .on("end", (_, i, nodes) => {
        if (i === nodes.length - 1) {
          setAnimationComplete(true);
          
          // Add count labels after animation completes
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
              .duration(500)
              .attr("opacity", 1);
        }
      });

  }, [transformedData, width, height, barColor, darkMode]); // Remove animationComplete from dependencies

  // Reset initialization flag when key props change
  useEffect(() => {
    return () => {
      chartInitializedRef.current = false;
    };
  }, [data, width, height, darkMode]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-none shadow-lg rounded-lg p-3 z-10"
            style={{
              backgroundColor: tooltipBgColor,
              color: tooltipTextColor,
              border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
              top: `${(height / transformedData.length) * (hoveredBar.hour + 0.5)}px`,
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
    </div>
  );
};

export default HorizontalBarChart;