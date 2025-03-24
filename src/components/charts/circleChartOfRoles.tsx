import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBreakdown } from "@/pages/UsersDetailedActivityAnalytics/PresenceAnalytics/interfaces/presence-activirt.interfaces";

interface RoleData {
  role: string;
  count: number;
  percentage: number;
  color: string;
}


const CircleRoleChart = ({ data, width = 500, height = 600, darkMode = false }: { data: StatusBreakdown[]; width?: number; height?: number; darkMode?: boolean; }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    role: string;
    count: number;
    percentage: number;
    x: number;
    y: number;
  } | null>(null);

  // Theme colors
  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const backgroundColor = darkMode ? "#1e293b" : "white";
  
  if (data) {
    data.forEach(item => {
      item.color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    });
  }
  useEffect(() => {
    if (!svgRef.current) return;

    // Ensure percentage is always a number
    const processedData = data.map((item) => ({
      ...item,
      percentage:
        typeof item.percentage === "string"
          ? parseFloat(item.percentage)
          : item.percentage,
    }));

    const margin = { top: 20, right: 20, bottom: 60, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = (Math.min(chartWidth, chartHeight) / 2) * 0.8;

    // Create SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2 - 30})`);

    // Add a subtle shadow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");

    filter
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 3)
      .attr("result", "offsetBlur");

    const feComponentTransfer = filter
      .append("feComponentTransfer")
      .attr("in", "offsetBlur")
      .attr("result", "offsetBlur");

    feComponentTransfer
      .append("feFuncA")
      .attr("type", "linear")
      .attr("slope", 0.3);

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create gradient fills for each slice
    processedData.forEach((d, i) => {
      const gradientId = `gradient-${d.role
        .replace(/\s+/g, "-")
        .toLowerCase()}`;

      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.rgb(d.color).brighter(0.5).toString());

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.rgb(d.color).darker(0.3).toString());

      // Update the color to use the gradient
      processedData[i].color = `url(#${gradientId})`;
    });

    // Create pie layout
    const pie = d3
      .pie<RoleData>()
      .value((d) => d.percentage)
      .sort(null)
      .padAngle(0.02);

    // Create arc generators
    const arc = d3
      .arc<d3.PieArcDatum<RoleData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const hoverArc = d3
      .arc<d3.PieArcDatum<RoleData>>()
      .innerRadius(0)
      .outerRadius(radius * 1.08);

    const labelArc = d3
      .arc<d3.PieArcDatum<RoleData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // Generate pie chart data
    const pieData = pie(processedData);

    // Create a group for each slice
    const slices = chartGroup
      .selectAll<SVGGElement, d3.PieArcDatum<RoleData>>(".slice")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "slice");

    // Add path for each slice
    slices
      .append("path")
      .attr("d", (d) => arc(d))
      .attr("fill", (d) => d.data.color)
      .attr("stroke", backgroundColor)
      .attr("stroke-width", 2)
      .style("filter", "url(#drop-shadow)")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        const [x, y] = labelArc.centroid(d);
        setTooltipData({
          role: d.data.role,
          count: d.data.count,
          percentage: d.data.percentage,
          x: x + width / 2,
          y: y + height / 2 - 30,
        });

        setActiveSlice(d.data.role);

        d3.select(this)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("d", function (d) {
            return hoverArc(d as d3.PieArcDatum<RoleData>);
          });
      })
      .on("mouseout", function (event, d) {
        setTooltipData(null);
        setActiveSlice(null);

        d3.select(this)
          .transition()
          .duration(400)
          .ease(d3.easeCubicInOut)
          .attr("d", function (d) {
            return arc(d as d3.PieArcDatum<RoleData>);
          });
      });

    // Add inner labels
    const innerLabels = slices
      .filter((d) => d.data.percentage >= 15) // Only add labels for slices that are large enough
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .style("text-shadow", "0px 0px 4px rgba(0,0,0,0.6)")
      .text((d) => d.data.role.charAt(0).toUpperCase() + d.data.role.slice(1));

    // Create legend with improved positioning
    const legendHeight = 30;
    const legendItemWidth = Math.min(120, (width - 40) / processedData.length);
    const legendWidth = legendItemWidth * processedData.length;

    // Center the legend horizontally
    const legendGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${(width - legendWidth) / 1}, ${height - legendHeight - 20})`
      );

    const legendItems = legendGroup
      .selectAll(".legend-item")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * legendItemWidth}, 0)`)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        setActiveSlice(d.role);

        // Highlight the corresponding pie slice
        chartGroup
          .selectAll<SVGPathElement, d3.PieArcDatum<RoleData>>("path")
          .filter((p) => p.data.role === d.role)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("d", (d) => hoverArc(d));
      })
      .on("mouseout", function () {
        setActiveSlice(null);

        // Reset all slices with a smooth transition
        chartGroup
          .selectAll<SVGPathElement, d3.PieArcDatum<RoleData>>("path")
          .transition()
          .duration(400)
          .ease(d3.easeCubicInOut)
          .attr("d", (d) => arc(d));
      });

    // Add colored rectangles to legend
    legendItems
      .append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("rx", 2)
      .attr("fill", (d) => d.color);

    // Add text to legend
    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 7)
      .attr("dy", ".35em")
      .attr("fill", textColor)
      .attr("font-size", "14px")
      .text((d) => d.role.charAt(0).toUpperCase() + d.role.slice(1));
  }, [data, width, height, darkMode, activeSlice]);

  return (
    <div className="relative">
      <motion.svg 
        ref={svgRef} 
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          ease: "easeOut"
        }}
      ></motion.svg>

      <AnimatePresence>
        {tooltipData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            className="absolute pointer-events-none bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-10"
            style={{
              left: tooltipData.x,
              top: tooltipData.y,
              transform: "translate(-50%, -50%)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div className="font-bold text-lg">{tooltipData.role}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Count:{" "}
              <span className="font-semibold">
                {tooltipData.count.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Percentage:{" "}
              <span className="font-semibold">{tooltipData.percentage}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircleRoleChart;
