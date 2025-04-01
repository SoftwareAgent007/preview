import * as d3 from "d3";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface RoleData {
  role?: string;
  roleName?: string;
  count: number;
  percentage: number;
  color: string;
}

const CircleRoleChart = ({ data, width = 500, height = 600, darkMode = false }: { data: RoleData[]; width?: number; height?: number; darkMode?: boolean; }) => {
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

  console.log('width',width);

  // Adaptive sizing based on width
  const getAdaptiveSizes = (width: number) => {
    let chartHeight, radius, fontSize, legendSize;
    
    if (width <= 300) {
      chartHeight = width;
      radius = width * 0.35;
      fontSize = 10;
      legendSize = 10;
    } else if (width <= 500) {
      chartHeight = width * 1.1;
      radius = width * 0.4;
      fontSize = 12;
      legendSize = 12;
    } else if (width <= 800) {
      chartHeight = width * 0.9;
      radius = width * 0.35;
      fontSize = 14;
      legendSize = 14;
    } else {
      chartHeight = width * 0.8;
      radius = width * 0.3;
      fontSize = 16;
      legendSize = 14;
    }

    return { chartHeight, radius, fontSize, legendSize };
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const { chartHeight, radius, fontSize, legendSize } = getAdaptiveSizes(width);

    // Ensure percentage is always a number
    const processedData = data.map((item) => ({
      ...item,
      role: item.role || item.roleName,
      percentage:
        typeof item.percentage === "string"
          ? parseFloat(item.percentage)
          : item.percentage,
    }));

    const margin = { 
      top: radius * 0.1, 
      right: radius * 0.1, 
      bottom: radius * 0.3, 
      left: radius * 0.1 
    };

    const chartWidth = width - margin.left - margin.right;

    // Create SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chartGroup = svg
      .attr("width", width)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${chartHeight / 2 - margin.bottom})`);

    // Add a subtle shadow filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", radius * 0.01)
      .attr("result", "blur");

    filter
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", radius * 0.01)
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
      const gradientId = `gradient-${(d.role || '')
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
      .attr("stroke-width", radius * 0.004)
      .style("filter", "url(#drop-shadow)")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        const [x, y] = labelArc.centroid(d);
        setTooltipData({
          role: d.data.role || '',
          count: d.data.count,
          percentage: d.data.percentage,
          x: x + width / 2,
          y: y + chartHeight / 2 - margin.bottom,
        });

        setActiveSlice(d.data.role || '');

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
      .filter((d) => d.data.percentage >= 15)
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", `${fontSize}px`)
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .style("text-shadow", "0px 0px 4px rgba(0,0,0,0.6)")
      .text((d) => {
        const role = d.data.role || '';
        return role.charAt(0).toUpperCase() + role.slice(1);
      });

    // Create legend with wrapping
    const legendHeight = fontSize * 2;
    const legendPadding = fontSize * 0.7;
    const legendRectSize = legendSize;
    const legendSpacing = legendSize * 0.3;
    const legendTextOffset = legendSize * 1.4;

    // Calculate text widths for legend items
    const tempText = svg.append("text").attr("font-size", `${legendSize}px`);
    const legendItemWidths = processedData.map(d => {
      const role = d.role || '';
      tempText.text(role.charAt(0).toUpperCase() + role.slice(1));
      return tempText.node()!.getComputedTextLength() + legendRectSize + legendTextOffset + legendSpacing;
    });
    tempText.remove();

    // Calculate rows and positions
    let currentRow = 0;
    let currentX = 0;
    const positions = processedData.map((d, i) => {
      if (currentX + legendItemWidths[i] > width - margin.left - margin.right) {
        currentRow++;
        currentX = 0;
      }
      const pos = {
        x: currentX,
        y: currentRow * (legendHeight + legendPadding)
      };
      currentX += legendItemWidths[i] + legendSpacing;
      return pos;
    });

    const totalLegendHeight = (currentRow + 1) * (legendHeight + legendPadding);

    // Create legend group
    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${chartHeight - totalLegendHeight})`);

    const legendItems = legendGroup
      .selectAll(".legend-item")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${positions[i].x}, ${positions[i].y})`)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        setActiveSlice(d.role || '');

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
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .attr("rx", 2)
      .attr("fill", (d) => d.color);

    // Add text to legend
    legendItems
      .append("text")
      .attr("x", legendTextOffset)
      .attr("y", legendRectSize - 2)
      .attr("fill", textColor)
      .attr("font-size", `${legendSize}px`)
      .text((d) => {
        const role = d.role || '';
        return role.charAt(0).toUpperCase() + role.slice(1);
      });

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
