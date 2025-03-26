import * as d3 from "d3";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface StatusData {
  status: string;
  count: number;
  percentage: number;
  color?: string;
}

// Generate random hex color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const CircleStatusChart = ({ data, width = 500, height = 600, darkMode = false }: { data: StatusData[]; width?: number; height?: number; darkMode?: boolean; }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    status: string;
    count: number;
    percentage: number;
    x: number;
    y: number;
  } | null>(null);

  // Theme colors
  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const backgroundColor = darkMode ? "#1e293b" : "white";
  const tooltipTextColor = darkMode ? "#e2e8f0" : "#1e293b";

  useEffect(() => {
    if (!svgRef.current) return;

    // Ensure percentage is always a number and add colors
    const processedData = data.map((item) => ({
      ...item,
      percentage: typeof item.percentage === "string" ? parseFloat(item.percentage) : item.percentage,
      color: item.color || getRandomColor()
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
      const gradientId = `gradient-${d.status.toLowerCase()}`;

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
      .pie<StatusData>()
      .value((d) => d.percentage)
      .sort(null)
      .padAngle(0.02);

    // Create arc generators
    const arc = d3
      .arc<d3.PieArcDatum<StatusData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const hoverArc = d3
      .arc<d3.PieArcDatum<StatusData>>()
      .innerRadius(0)
      .outerRadius(radius * 1.08);

    const labelArc = d3
      .arc<d3.PieArcDatum<StatusData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // Generate pie chart data
    const pieData = pie(processedData);

    // Create a group for each slice
    const slices = chartGroup
      .selectAll<SVGGElement, d3.PieArcDatum<StatusData>>(".slice")
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
          status: d.data.status,
          count: d.data.count,
          percentage: d.data.percentage,
          x: x + width / 2,
          y: y + height / 2 - 30,
        });

        setActiveSlice(d.data.status);

        d3.select(this)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("d", function (d) {
            return hoverArc(d as d3.PieArcDatum<StatusData>);
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
            return arc(d as d3.PieArcDatum<StatusData>);
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
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .style("text-shadow", "0px 0px 4px rgba(0,0,0,0.6)")
      .text((d) => d.data.status.charAt(0).toUpperCase() + d.data.status.slice(1));

    // Create legend with wrapping
    const legendHeight = 30;
    const legendPadding = 10;
    const legendRectSize = 14;
    const legendSpacing = 4;
    const legendTextOffset = 20;

    // Calculate text widths for legend items
    const tempText = svg.append("text").attr("font-size", "14px");
    const legendItemWidths = processedData.map(d => {
      tempText.text(d.status.charAt(0).toUpperCase() + d.status.slice(1));
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
      .attr("transform", `translate(${margin.left}, ${height - totalLegendHeight})`);

    const legendItems = legendGroup
      .selectAll(".legend-item")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${positions[i].x}, ${positions[i].y})`)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        setActiveSlice(d.status);

        chartGroup
          .selectAll<SVGPathElement, d3.PieArcDatum<StatusData>>("path")
          .filter((p) => p.data.status === d.status)
          .transition()
          .duration(300)
          .ease(d3.easeCubicOut)
          .attr("d", (d) => hoverArc(d));
      })
      .on("mouseout", function () {
        setActiveSlice(null);

        chartGroup
          .selectAll<SVGPathElement, d3.PieArcDatum<StatusData>>("path")
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
      .attr("font-size", "14px")
      .text((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1));

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
              color: tooltipTextColor
            }}
          >
            <div className="font-bold text-lg">{tooltipData.status.charAt(0).toUpperCase() + tooltipData.status.slice(1)}</div>
            <div className="text-sm">
              Count:{" "}
              <span className="font-semibold">
                {tooltipData.count.toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              Percentage:{" "}
              <span className="font-semibold">{tooltipData.percentage}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircleStatusChart;
