import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { ActivityStatusData } from "@/components/common/types/userAnalytic.types";
import { motion, AnimatePresence } from "framer-motion";

// #region Error Boundary
class HeatmapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Heatmap Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h3 className="text-red-500 font-medium">Something went wrong with the heatmap.</h3>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
// #endregion

interface HeatmapProps {
  activityData?: ActivityStatusData[];
  maxActivity?: number;
  darkMode?: boolean;
  title?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({ 
  activityData, 
  maxActivity = 500,
  darkMode = false,
  title = "Status Activity Heatmap"
}) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<any>(null);
  const tooltipDataRef = useRef<any>(null);
  const tooltipPositionRef = useRef({ x: 0, y: 0 });
  
  const weeks = activityData ? activityData.length : 0;
  const days = activityData && activityData.length > 0 ? Object.keys(activityData[0]) : [];

  // Theme colors
  const bgColor = darkMode ? "#1e293b" : "#ffffff";
  const textColor = darkMode ? "#e2e8f0" : "#334155";
  const gridColor = darkMode ? "#334155" : "#f1f5f9";
  const tooltipBgColor = darkMode ? "#0f172a" : "#ffffff";
  const tooltipBorderColor = darkMode ? "#334155" : "#e2e8f0";
  const legendBgColor = darkMode ? "#1e293b" : "#f8fafc";

  // Enhanced color palette
  const colorPalette = darkMode 
    ? ["#0c4a6e", "#0369a1", "#0284c7", "#38bdf8", "#7dd3fc"] 
    : ["#0c4a6e", "#0369a1", "#0284c7", "#38bdf8", "#e0f7fa"];
    
  // Create a color scale at component level so it can be used in the tooltip
  const colorScale = d3.scaleQuantile<string>()
    .domain([0, maxActivity / 4, maxActivity / 2, maxActivity * 0.75, maxActivity])
    .range(colorPalette);

  // #region Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const labelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };
  // #endregion

  useEffect(() => {
    if (!ref.current || !activityData) return;

    try {
      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const margin = { top: 30, right: 30, bottom: 50, left: 80 };
      const width = ref.current.clientWidth - margin.left - margin.right; 
      const height = Math.min(width * 0.6, 400); // Control height for better proportions

      // Create a background rect for better aesthetics
      svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", bgColor)
        .attr("rx", 8)
        .attr("ry", 8);

      const xScale = d3.scaleBand()
        .domain(d3.range(weeks).map(d => d.toString()))
        .range([0, width])
        .padding(0.15); // Increased padding for better spacing

      const yScale = d3.scaleBand()
        .domain(days)
        .range([0, height])
        .padding(0.15);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // // Add title
      // svg.append("text")
      //   .attr("x", margin.left + width / 2)
      //   .attr("y", margin.top / 2)
      //   .attr("text-anchor", "middle")
      //   .attr("font-size", "16px")
      //   .attr("font-weight", "bold")
      //   .attr("fill", textColor)
      //   .text(title);

      // Add subtle grid background
      g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", gridColor)
        .attr("opacity", 0.3)
        .attr("rx", 4)
        .attr("ry", 4);

      // Create cells with enhanced styling and animations
      const cells = g.selectAll(".cell")
        .data(activityData.flatMap((weekData, week) =>
          days.map(day => ({ week, day, value: weekData[day] }))
        ))
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d: any) => {
          const pos = xScale(d.week.toString());
          return pos !== undefined ? pos : 0;
        })
        .attr("y", (d: any) => {
          const pos = yScale(d.day);
          return pos !== undefined ? pos : 0;
        })
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("rx", 3) // More rounded corners
        .attr("ry", 3)
        .attr("fill", (d: any) => colorScale(d.value ? d.value.value : 0))
        .attr("opacity", 0)
        .attr("stroke", bgColor)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.3)
        .style("cursor", "pointer")
        .style("transition", "all 0.3s ease-in-out");

      // Create tooltip element once
      if (!tooltipRef.current) {
        tooltipRef.current = d3.select("body")
          .append("div")
          .attr("class", "heatmap-tooltip")
          .style("position", "fixed")
          .style("z-index", "50")
          .style("pointer-events", "none")
          .style("opacity", "0")
          .style("transition", "opacity 0.2s ease-out, transform 0.3s ease-out")
          .style("transform", "translate(0, 10px) scale(0.95)")
          .style("border-radius", "0.5rem")
          .style("box-shadow", "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)")
          .style("padding", "1rem")
          .style("max-width", "250px")
          .style("background", tooltipBgColor)
          .style("border", `1px solid ${tooltipBorderColor}`);
      }

      // Add enhanced event listeners
      cells.on("pointerenter", (event: PointerEvent, d: any) => {
        const cell = d3.select(event.target as Element);
        
        // Highlight ONLY the current cell
        cell
          .transition()
          .duration(150)
          .attr("stroke", darkMode ? "#60a5fa" : "#3b82f6")
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 1)
          .attr("z-index", 10);
        
        // Add a highlight effect with a glow filter
        if (!d3.select("defs").select("#cell-glow").size()) {
          svg.append("defs")
            .append("filter")
            .attr("id", "cell-glow")
            .append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("stdDeviation", 2)
            .attr("flood-color", darkMode ? "#60a5fa" : "#3b82f6")
            .attr("flood-opacity", 0.6);
        }
        
        cell.style("filter", "url(#cell-glow)");
        
        // Remove the row and column highlighting code
        // Instead, slightly dim all other cells to make the hovered one stand out
        g.selectAll(".cell")
          .filter((c: any) => c.day !== d.day || c.week !== d.week) // All cells except the hovered one
          .transition()
          .duration(150)
          .attr("opacity", (c: any) => (0.1 + (c.value ? c.value.value / maxActivity : 0) * 0.9) * 0.6); // Dim to 60% of normal opacity
        
        // Update tooltip content and position directly
        tooltipRef.current
          .html(`
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="font-bold text-lg" style="color: ${textColor}">
                  ${d.day}
                </span>
                <span class="text-sm font-medium px-2 py-1 rounded-full" 
                  style="background: ${darkMode ? '#334155' : '#e2e8f0'}; color: ${darkMode ? '#e2e8f0' : '#334155'}">
                  Week ${d.week + 1}
                </span>
              </div>
              <div class="text-sm" style="color: ${darkMode ? '#94a3b8' : '#64748b'}">
                ${d.value ? d.value.date : 'N/A'}
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-3 h-3 rounded-sm" 
                  style="background-color: ${colorScale(d.value ? d.value.value : 0)}; opacity: 0.9"></div>
                <span class="font-semibold" style="color: ${textColor}">
                  ${d.value ? d.value.value : 0} activities
                </span>
              </div>
            </div>
          `)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 15}px`)
          .style("transform", "translate(0, -100%) scale(1)")
          .style("opacity", "1");
      })
      .on("pointermove", (event: PointerEvent) => {
        // Update position directly without state
        tooltipRef.current
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 15}px`);
      })
      .on("pointerleave", (event: PointerEvent, d: any) => {
        const cell = d3.select(event.target as Element);
        
        // Reset the current cell
        cell
          .transition()
          .duration(200)
          .attr("stroke", bgColor)
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.3)
          .attr("z-index", 1)
          .style("filter", "none"); // Remove the glow filter
        
        // Reset ALL cells to their original opacity
        g.selectAll(".cell")
          .transition()
          .duration(200)
          .attr("opacity", (d: any) => 0.1 + (d.value ? d.value.value / maxActivity : 0) * 0.9);
        
        // Hide tooltip
        tooltipRef.current
          .style("opacity", "0")
          .style("transform", "translate(0, 10px) scale(0.95)");
      });

      // Animate cells with staggered delay based on position
      cells.transition()
        .delay((d: any, i: number) => d.week * 20 + days.indexOf(d.day) * 30)
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("opacity", (d: any) => 0.1 + (d.value ? d.value.value / maxActivity : 0) * 0.9);

      // Enhanced day labels with better styling
      g.selectAll(".day-label")
        .data(days)
        .enter()
        .append("text")
        .attr("class", "day-label")
        .attr("x", -10)
        .attr("y", (d: any) => {
          const pos = yScale(d);
          return pos !== undefined ? pos + (yScale.bandwidth() / 2) : 0;
        })
        .attr("dy", "0.35em")
        .style("text-anchor", "end")
        .style("font-weight", "600")
        .style("font-size", "12px")
        .style("fill", textColor)
        .style("opacity", 0)
        .text((d: any) => d)
        .transition()
        .delay((d: any, i: number) => i * 80)
        .duration(500)
        .style("opacity", 1);

      // Enhanced week labels with better styling
      g.selectAll(".week-label")
        .data(d3.range(weeks).map(d => d.toString()))
        .enter()
        .append("text")
        .attr("class", "week-label")
        .attr("x", (d: any) => {
          const pos = xScale(d);
          return pos !== undefined ? pos + (xScale.bandwidth() / 2) : 0;
        })
        .attr("y", height + 20)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("fill", textColor)
        .style("opacity", 0)
        .text((d: any) => `Week ${parseInt(d) + 1}`)
        .transition()
        .delay((d: any, i: number) => i * 50)
        .duration(500)
        .style("opacity", 0.8);

      // Add subtle grid lines for better readability
      g.selectAll(".horizontal-grid")
        .data(days)
        .enter()
        .append("line")
        .attr("class", "horizontal-grid")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d: any) => {
          const pos = yScale(d);
          return pos !== undefined ? pos : 0;
        })
        .attr("y2", (d: any) => {
          const pos = yScale(d);
          return pos !== undefined ? pos : 0;
        })
        .attr("stroke", darkMode ? "#334155" : "#e2e8f0")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0)
        .attr("stroke-dasharray", "3,3")
        .transition()
        .delay((d: any, i: number) => i * 100 + 500)
        .duration(500)
        .attr("stroke-opacity", 0.5);

      return () => {
        // Clean up tooltip on unmount
        if (tooltipRef.current) {
          tooltipRef.current.remove();
          tooltipRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error rendering heatmap:', error);
      throw error;
    }
  }, [activityData, maxActivity, days, weeks, darkMode, bgColor, textColor, gridColor, colorPalette, colorScale]);

  return (
    <HeatmapErrorBoundary>
      <motion.div 
        className="w-full rounded-lg overflow-hidden shadow-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          background: bgColor,
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}
      >
        <motion.svg 
          ref={ref} 
          width="100%" 
          height={520}
          variants={cellVariants}
          className="overflow-visible"
        />
        
        {/* Enhanced legend with better styling */}
        <motion.div 
          className="flex justify-center mt-2 p-3 mx-4 mb-4 rounded-lg"
          variants={labelVariants}
          style={{ 
            background: legendBgColor,
            borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium" style={{ color: textColor }}>
              Indicator of the number of selected type uses per day
            </span>
            <motion.div 
              className="flex gap-1"
              variants={containerVariants}
            >
              {colorPalette.map((color, i) => (
                <motion.div
                  key={i}
                  className="w-5 h-5 rounded-sm"
                  style={{ 
                    backgroundColor: color, 
                    opacity: 0.2 + i * 0.2,
                    border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    opacity: 0.9,
                    transition: { 
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </HeatmapErrorBoundary>
  );
};

export default Heatmap;