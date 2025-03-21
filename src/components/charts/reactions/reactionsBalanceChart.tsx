import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

// Define proper types for the data
interface ReactionData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface BackToBackHistogramProps {
  data?: ReactionData[];
  width?: number;
  darkMode?: boolean;
}

const BackToBackHistogram = ({ 
  data = [], 
  width = 800,
  darkMode = false
}: BackToBackHistogramProps) => {
  const height = 400; // Reduced height for better proportions
  const chartRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef<any>(null);

  // Modern color palette
  const COLOR_POSITIVE = darkMode ? "#60a5fa" : "#3b82f6"; // Blue
  const COLOR_NEUTRAL = darkMode ? "#93c5fd" : "#bfdbfe"; // Light blue
  const COLOR_NEGATIVE = darkMode ? "#1e293b" : "#334155"; // Dark slate
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
    
    const actualWidth = width || dimensions.width;
    const actualHeight = height;

    d3.select(chartRef.current).selectAll("*").remove();

    if (data.length === 0) {
      const svg = d3
        .select(chartRef.current)
        .attr("width", actualWidth)
        .attr("height", actualHeight)
        .append("text")
        .attr("x", actualWidth / 2)
        .attr("y", actualHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", darkMode ? "#94a3b8" : "#64748b")
        .text("No data available");
      return;
    }

    // Properly type the grouped data
    const uniqueData: ReactionData[] = Array.from(
      d3.group(data, (d) => d.date), 
      ([, value]) => value[0]
    );

    const margin = { top: 30, right: 30, bottom: 60, left: 40 };
    const w = actualWidth - margin.left - margin.right;
    const h = actualHeight - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .attr("width", actualWidth)
      .attr("height", actualHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add gradient definitions
    const defs = svg.append("defs");
    
    // Positive gradient
    const positiveGradient = defs.append("linearGradient")
      .attr("id", "positive-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    positiveGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", COLOR_POSITIVE)
      .attr("stop-opacity", 1);
      
    positiveGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", COLOR_POSITIVE)
      .attr("stop-opacity", 0.7);
    
    // Negative gradient
    const negativeGradient = defs.append("linearGradient")
      .attr("id", "negative-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
      
    negativeGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", COLOR_NEGATIVE)
      .attr("stop-opacity", 1);
      
    negativeGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", COLOR_NEGATIVE)
      .attr("stop-opacity", 0.7);
    
    // Neutral gradient
    const neutralGradient = defs.append("linearGradient")
      .attr("id", "neutral-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    neutralGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", COLOR_NEUTRAL)
      .attr("stop-opacity", 0.9);
      
    neutralGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", COLOR_NEUTRAL)
      .attr("stop-opacity", 0.6);

    const xScale = d3.scaleBand()
      .domain(uniqueData.map((d) => d.date))
      .range([0, w])
      .padding(0.3); // Increased padding for better spacing

    // Use proper type assertions for max/min calculations
    const yMax = d3.max(uniqueData, (d) => d.positive + (d.neutral / 2)) || 0;
    const yMin = d3.min(uniqueData, (d) => d.negative) || 0;
    const yPadding = (yMax - yMin) * 0.2; // Increased padding for better visualization

    const yScale = d3.scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .nice()
      .range([h, 0]);

    // Add subtle grid lines
    svg.append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yScale.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)")
      .attr("stroke-dasharray", "3,3");

    // Create tooltip only once
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", darkMode ? "#1e293b" : "white")
        .style("color", darkMode ? "white" : "#334155")
        .style("border", darkMode ? "1px solid #475569" : "1px solid #e2e8f0")
        .style("border-radius", "8px")
        .style("box-shadow", "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)")
        .style("padding", "12px 16px")
        .style("font-size", "14px")
        .style("font-weight", "500")
        .style("pointer-events", "none")
        .style("opacity", "0")
        .style("z-index", "10")
        .style("transition", "opacity 0.2s ease");
    }

    // Create a group for each date to handle hover effects
    const dateGroups = svg.selectAll(".date-group")
      .data(uniqueData)
      .enter()
      .append("g")
      .attr("class", "date-group")
      .attr("transform", d => `translate(${xScale(d.date) || 0}, 0)`)
      .attr("data-date", d => d.date) // Add data attribute for date
      .on("mouseenter", function(event, d) {
        // Don't call setHoveredDate here to avoid re-rendering
        // Instead, use direct DOM manipulation for hover effects
        
        // Highlight the current group
        d3.select(this).selectAll("rect")
          .attr("stroke", darkMode ? "white" : "black")
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.7);
        
        // Dim other groups
        svg.selectAll(".date-group").filter((g: any) => g.date !== d.date)
          .style("opacity", 0.5);
        
        // Show tooltip
        tooltipRef.current
          .style("opacity", 1)
          .html(`
            <div style="margin-bottom: 8px; font-weight: bold; font-size: 16px;">${d.date}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${COLOR_POSITIVE};">Positive:</span>
              <span>${d.positive}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${COLOR_NEUTRAL};">Neutral:</span>
              <span>${d.neutral}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: ${COLOR_NEGATIVE};">Negative:</span>
              <span>${Math.abs(d.negative)}</span>
            </div>
          `)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mousemove", function(event) {
        tooltipRef.current
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseleave", function() {
        // Reset all groups
        svg.selectAll(".date-group")
          .style("opacity", 1);
        
        svg.selectAll("rect")
          .attr("stroke-width", 0);
        
        // Hide tooltip
        tooltipRef.current
          .style("opacity", 0);
      });

    // Draw positive bars
    dateGroups.append("rect")
      .attr("class", "bar positive")
      .attr("x", 0)
      .attr("y", d => yScale(d.positive + d.neutral / 2))
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Start with height 0 for animation
      .attr("fill", "url(#positive-gradient)")
      .attr("rx", 2) // Rounded corners
      .attr("ry", 2)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .ease(d3.easeCubicOut)
      .attr("height", d => Math.abs(yScale(0) - yScale(d.positive + d.neutral / 2)));

    // Draw neutral bars
    dateGroups.append("rect")
      .attr("class", "bar neutral")
      .attr("x", 0)
      .attr("y", d => yScale(d.neutral / 2))
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Start with height 0 for animation
      .attr("fill", "url(#neutral-gradient)")
      .attr("rx", 2)
      .attr("ry", 2)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50 + 100)
      .ease(d3.easeCubicOut)
      .attr("height", d => Math.abs(yScale(0) - yScale(d.neutral / 2)));

    // Draw negative bars
    dateGroups.append("rect")
      .attr("class", "bar negative")
      .attr("x", 0)
      .attr("y", yScale(0))
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Start with height 0 for animation
      .attr("fill", "url(#negative-gradient)")
      .attr("rx", 2)
      .attr("ry", 2)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50 + 200)
      .ease(d3.easeCubicOut)
      .attr("height", d => Math.abs(yScale(0) - yScale(d.negative)));

    // Add center line with animation
    const centerLine = svg.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");
    
    centerLine.transition()
      .duration(1000)
      .attr("x2", w);

    // Add x-axis with animation
    const xAxis = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${yScale(0) + 10})`)
      .style("opacity", 0);
    
    xAxis.call(
      d3.axisBottom(xScale)
        .tickSize(0)
        .tickPadding(10)
    )
    .selectAll("text")
      .attr("transform", "rotate(-25)")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)");
    
    xAxis.select(".domain").remove();
    
    xAxis.transition()
      .duration(800)
      .style("opacity", 1);

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", -h / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)")
      .text("Reaction Count")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);

    return () => {
      // Only remove tooltip when component unmounts
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };

  }, [data, dimensions, width, height, darkMode]);

  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1 relative">
        <svg 
          ref={chartRef} 
          className="w-full h-full"
          style={{ overflow: "visible" }}
        />
      </div>
      <motion.div 
        className="legend flex justify-center gap-6 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {[
          { type: "positive", label: "Positive", color: COLOR_POSITIVE },
          { type: "neutral", label: "Neutral", color: COLOR_NEUTRAL },
          { type: "negative", label: "Negative", color: COLOR_NEGATIVE }
        ].map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-sm" 
              style={{ backgroundColor: item.color }} 
            />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default BackToBackHistogram;
