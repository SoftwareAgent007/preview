import React, { useEffect, useRef } from "react";
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
}

const Heatmap: React.FC<HeatmapProps> = ({ activityData, maxActivity = 500 }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  
  const weeks = activityData ? activityData.length : 0;
  const days = activityData && activityData.length > 0 ? Object.keys(activityData[0]) : [];

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

      const margin = { top: 20, right: 20, bottom: 20, left: 80 };
      const width = ref.current.clientWidth - margin.left - margin.right; 
      const height = width * (days.length / (weeks || 1)); 

      const xScale = d3.scaleBand()
        .domain(d3.range(weeks))
        .range([0, width])
        .padding(0.1);

      const yScale = d3.scaleBand()
        .domain(days)
        .range([0, height])
        .padding(0.1);

      const colorScale = d3.scaleLinear()
        .domain([0, maxActivity])
        .range(["#e0f7fa", "#01579b"]);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Create tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "heatmap-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("transition", "all 0.2s ease-in-out");

      // Create cells with proper event handling
      const cells = g.selectAll(".cell")
        .data(activityData.flatMap((weekData, week) =>
          days.map(day => ({ week, day, value: weekData[day] }))
        ))
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d: any) => xScale(d.week))
        .attr("y", (d: any) => yScale(d.day))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("fill", (d: any) => colorScale(d.value ? d.value.value : 0))
        .attr("opacity", 0)
        .style("transition", "all 0.2s ease-in-out");

      // Add event listeners using D3 v7 syntax
      cells.on("pointerenter", (event: PointerEvent, d: any) => {
        const cell = d3.select(event.target as Element);
        cell
          .transition()
          .duration(200)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="flex flex-col gap-1">
              <div class="font-medium text-blue-600">${d.day}</div>
              <div class="text-gray-600">Date: ${d.value ? d.value.date : 'N/A'}</div>
              <div class="text-gray-600">Count: ${d.value ? d.value.value + 1 : 0}</div>
            </div>
          `);
      })
      .on("pointermove", (event: PointerEvent) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("pointerleave", (event: PointerEvent) => {
        const cell = d3.select(event.target as Element);
        cell
          .transition()
          .duration(200)
          .attr("stroke", null);
        tooltip.style("visibility", "hidden");
      });

      // Animate cells
      cells.transition()
        .delay((d: any, i: number) => i * 10)
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr("opacity", (d: any) => 0.1 + (d.value ? d.value.value / maxActivity : 0) * 0.8);

      // Animated labels
      g.selectAll(".day-label")
        .data(days)
        .enter()
        .append("text")
        .attr("class", "day-label")
        .attr("x", -5)
        .attr("y", (d: any) => yScale(d) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("text-anchor", "end")
        .style("font-weight", "bold")
        .style("opacity", 0)
        .text((d: any) => d)
        .transition()
        .delay((d: any, i: number) => i * 50)
        .duration(500)
        .style("opacity", 1);

      g.selectAll(".week-label")
        .data(d3.range(weeks))
        .enter()
        .append("text")
        .attr("class", "week-label")
        .attr("x", (d: any) => xScale(d) + xScale.bandwidth() / 2)
        .attr("y", height + 15)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("opacity", 0)
        .text((d: any) => `Week ${d + 1}`)
        .transition()
        .delay((d: any, i: number) => i * 50)
        .duration(500)
        .style("opacity", 1);

      // Cleanup
      return () => {
        tooltip.remove();
      };
    } catch (error) {
      console.error('Error rendering heatmap:', error);
      throw error; // Let error boundary handle it
    }
  }, [activityData, maxActivity, days, weeks]);

  return (
    <HeatmapErrorBoundary>
      <motion.div 
        className="w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.svg 
          ref={ref} 
          width="100%" 
          height={520}
          variants={cellVariants}
        />
        <motion.div 
          className="flex justify-center mt-2 border rounded-lg p-2"
          variants={labelVariants}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">Indicator of the number of selected type uses per day</span>
            <motion.div 
              className="flex gap-1"
              variants={containerVariants}
            >
              {["#e0f7fa", "#81d4fa", "#29b6f6", "#0288d1", "#01579b"].map((color, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 rounded"
                  style={{ 
                    backgroundColor: color, 
                    opacity: 0.2 + i * 0.2 
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    opacity: 0.8,
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