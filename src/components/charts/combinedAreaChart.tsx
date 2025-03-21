import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";

// Define proper interfaces for the data
interface DataPoint {
  date: string;
  count: number;
}

interface DataSetItem {
  data: DataPoint[];
  color: string;
  label?: string;
}

export interface DataSet {
  [key: string]: DataSetItem;
}

const MultiLayerAreaChart = ({
  datasets,
  width,
  height = 300,
  darkMode = false,
  showTooltip = true,
  showLegend = false,
  animate = true,
  useFullNumbers = true,
  dateFormat = "%m/%d",
}: {
  datasets: DataSet;
  width: number;
  height: number;
  darkMode?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  useFullNumbers?: boolean;
  dateFormat?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    date: Date;
    values: { key: string; value: number; color: string }[];
    x: number;
    y: number;
  } | null>(null);

  // Theme colors
  const textColor = darkMode ? "#e2e8f0" : "#64748b";
  const axisColor = darkMode ? "#475569" : "#cbd5e1";
  const backgroundColor = darkMode ? "#1e293b" : "transparent";
  const gridColor = darkMode ? "#334155" : "#e2e8f0";

  useEffect(() => {
    if (!svgRef.current || Object.keys(datasets).length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Convert dates and ensure we have valid data
    const allDates = Object.values(datasets)
      .flatMap((dataset) => dataset.data.map((d) => new Date(d.date)))
      .filter((d) => !isNaN(d.getTime())); // Filter out invalid dates

    // Handle empty data case
    if (allDates.length === 0) {
      svg
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .text("No data available");
      return;
    }

    const xDomain = d3.extent(allDates) as [Date, Date]; // Type assertion since we've filtered invalid dates

    const allCounts = Object.values(datasets).flatMap((dataset) =>
      dataset.data.map((d) => d.count)
    );
    const maxCount = d3.max(allCounts) || 0; // Default to 0 if no data
    const yDomain = [0, maxCount * 1.1];

    const x = d3.scaleTime().domain(xDomain).range([0, chartWidth]);
    const y = d3.scaleLinear().domain(yDomain).range([chartHeight, 0]);

    // Add subtle background grid
    svg
      .append("g")
      .attr("class", "grid")
      .attr("stroke", gridColor)
      .attr("stroke-opacity", 0.1)
      .attr("stroke-dasharray", "3,3")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => "") // Use a function that returns empty string
      );

    // Type the area and line generators properly
    const area = d3
      .area<DataPoint>()
      .x((d) => x(new Date(d.date)))
      .y0(chartHeight)
      .y1((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    const line = d3
      .line<DataPoint>()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    // Create gradients for each dataset
    const defs = svg.append("defs");

    Object.entries(datasets).forEach(([key, { color }]) => {
      const gradientId = `area-gradient-${key.replace(/\s+/g, "-")}`;

      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.7);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.1);
    });

    // Create a clip path for the running animation if animation is enabled
    if (animate) {
      const clipId = `clip-${Math.random().toString(36).substring(2, 9)}`;
      
      defs.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("width", 0)
        .attr("height", chartHeight)
        .transition()
        .duration(1800)
        .ease(d3.easeQuadInOut)
        .attr("width", chartWidth);
      
      // Draw each dataset with running animation
      Object.entries(datasets).forEach(([key, { data, color }], index) => {
        const gradientId = `area-gradient-${key.replace(/\s+/g, "-")}`;
        const delay = index * 100; // Stagger the animations slightly
        
        // Add area with gradient and clip path
        svg.append("path")
          .datum(data)
          .attr("fill", `url(#${gradientId})`)
          .attr("clip-path", `url(#${clipId})`)
          .attr("d", area);
        
        // Add line with clip path
        const linePath = svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("clip-path", `url(#${clipId})`)
          .attr("d", line);
        
        // Add data points with delayed appearance based on x position
        const dataPoints = svg.selectAll(`.data-point-${key}`)
          .data(data)
          .enter()
          .append("circle")
          .attr("class", `data-point-${key}`)
          .attr("cx", d => x(new Date(d.date)))
          .attr("cy", d => y(d.count))
          .attr("r", 0)
          .attr("fill", "white")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .style("opacity", 0);
        
        // Delay the appearance of points based on their x position
        dataPoints.each(function(d) {
          const point = d3.select(this);
          const xPos = x(new Date(d.date));
          const pointDelay = (xPos / chartWidth) * 1800 + delay; // Sync with clip path animation
          
          point.transition()
            .delay(pointDelay)
            .duration(300)
            .attr("r", 4)
            .style("opacity", 1);
        });
      });
    } else {
      // Non-animated version (existing code)
      Object.entries(datasets).forEach(([key, { data, color }]) => {
        const gradientId = `area-gradient-${key.replace(/\s+/g, "-")}`;

        // Add area with gradient
        svg.append("path")
          .datum(data)
          .attr("fill", `url(#${gradientId})`)
          .attr("d", area);

        // Add line
        svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", line);
        
        // Add data points
        svg.selectAll(`.data-point-${key}`)
          .data(data)
          .enter()
          .append("circle")
          .attr("class", `data-point-${key}`)
          .attr("cx", d => x(new Date(d.date)))
          .attr("cy", d => y(d.count))
          .attr("r", 4)
          .attr("fill", "white")
          .attr("stroke", color)
          .attr("stroke-width", 2);
      });
    }

    // Format the date ticks properly
    const formatDate = d3.timeFormat(dateFormat);

    // Get all unique dates from datasets for x-axis ticks
    const allUniqueDataPoints = new Map<string, Date>();
    Object.values(datasets).forEach(({ data }) => {
      data.forEach((point) => {
        const dateStr = new Date(point.date).toISOString();
        if (!allUniqueDataPoints.has(dateStr)) {
          allUniqueDataPoints.set(dateStr, new Date(point.date));
        }
      });
    });
    
    const uniqueDates = Array.from(allUniqueDataPoints.values()).sort(
      (a, b) => a.getTime() - b.getTime()
    );
    
    // X axis with improved formatting and alignment
    // Use the unique dates for ticks to ensure perfect alignment
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3.axisBottom(x)
          .tickValues(uniqueDates.length <= 10 
            ? uniqueDates 
            : uniqueDates.length > 0 
              ? d3.timeMonth.every(1)?.range(uniqueDates[0], uniqueDates[uniqueDates.length-1]) || uniqueDates
              : []
          )
          .tickSize(0)
          .tickPadding(10)
          .tickFormat(d => formatDate(d as Date))
      );
    
    xAxis.selectAll("text")
      .attr("fill", textColor)
      .attr("font-size", "12px")
      .attr("text-anchor", "middle");
    
    xAxis.select(".domain")
      .attr("stroke", axisColor)
      .attr("stroke-opacity", 0.5);

    // Y axis
    const yAxis = svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(0)
        .tickPadding(10)
        .tickFormat((d) => {
          // Use full numbers instead of abbreviated format
          if (useFullNumbers) {
            return d3.format(",")(+d);
          } else {
            return d3.format(+d >= 1000 ? "~s" : "~d")(+d);
          }
        })
    );

    yAxis.selectAll("text").attr("fill", textColor).attr("font-size", "12px");

    yAxis
      .select(".domain")
      .attr("stroke", axisColor)
      .attr("stroke-opacity", 0.5);

    // Add interactive elements if tooltip is enabled
    if (showTooltip) {
      // Create a bisector to find closest date
      const bisectDate = d3.bisector<DataPoint, Date>((d) => new Date(d.date)).left;
      
      // Add invisible overlay for mouse events
      const overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all");
      
      // Add vertical line for tooltip that aligns with x-axis ticks
      const tooltipLine = svg.append("line")
        .attr("class", "tooltip-line")
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", darkMode ? "#cbd5e1" : "#64748b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .style("opacity", 0);
      
      // Add circles for each dataset point
      const tooltipCircles = Object.entries(datasets).map(([key, { color }]) => {
        return svg.append("circle")
          .attr("class", `tooltip-circle-${key}`)
          .attr("r", 5)
          .attr("fill", color)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .style("opacity", 0);
      });
      
      // Handle mouse events with improved alignment
      overlay
        .on("mousemove", function(event) {
          // Get mouse position
          const [mouseX] = d3.pointer(event);
          
          // Convert mouse position to date
          const mouseDate = x.invert(mouseX);
          
          // Find the closest date in our unique dates array
          let closestDate = uniqueDates[0];
          let minDistance = Math.abs(mouseDate.getTime() - closestDate.getTime());
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const distance = Math.abs(mouseDate.getTime() - uniqueDates[i].getTime());
            if (distance < minDistance) {
              minDistance = distance;
              closestDate = uniqueDates[i];
            }
          }
          
          // Snap to the exact x position of the closest date
          const xPos = x(closestDate);
          
          // Find the closest data point for each dataset
          const tooltipValues = Object.entries(datasets).map(([key, { data, color }]) => {
            // Find the data point with the matching date
            const matchingPoint = data.find(
              (d) => new Date(d.date).getTime() === closestDate.getTime()
            );
            
            if (matchingPoint) {
              return {
                key,
                value: matchingPoint.count,
                color,
                date: closestDate,
                x: xPos,
                y: y(matchingPoint.count),
              };
            }
            
            // If no exact match, find the closest point
            const i = bisectDate(data, closestDate);
            
            // Handle edge cases
            if (i === 0) {
              return {
                key,
                value: data[0].count,
                color,
                date: closestDate,
                x: xPos,
                y: y(data[0].count),
              };
            }
            
            if (i >= data.length) {
              return {
                key,
                value: data[data.length - 1].count,
                color,
                date: closestDate,
                x: xPos,
                y: y(data[data.length - 1].count),
              };
            }
            
            // Find the closest point (left or right)
            const d0 = new Date(data[i - 1].date);
            const d1 = new Date(data[i].date);
            const closestIndex =
              closestDate.getTime() - d0.getTime() > d1.getTime() - closestDate.getTime()
                ? i
                : i - 1;
            
            return {
              key,
              value: data[closestIndex].count,
              color,
              date: closestDate,
              x: xPos,
              y: y(data[closestIndex].count),
            };
          });
          
          // Update tooltip line position
          tooltipLine.attr("x1", xPos).attr("x2", xPos).style("opacity", 1);
          
          // Update circles
          tooltipValues.forEach((item, i) => {
            tooltipCircles[i]
              .attr("cx", item.x)
              .attr("cy", item.y)
              .style("opacity", 1);
          });
          
          // Update tooltip data
          setTooltipData({
            date: closestDate,
            values: tooltipValues,
            x: xPos + margin.left,
            y: Math.min(...tooltipValues.map((v) => v.y)) - 10,
          });
        })
        .on("mouseleave", function() {
          // Hide tooltip elements
          tooltipLine.style("opacity", 0);
          tooltipCircles.forEach((circle) => circle.style("opacity", 0));
          setTooltipData(null);
        });
    }

    // Add legend if enabled
    if (showLegend) {
      const legendItems = Object.entries(datasets);
      const legendItemWidth = 120;
      const legendHeight = 25;
      const legendWidth = Math.min(
        legendItems.length * legendItemWidth,
        chartWidth
      );

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${(chartWidth - legendWidth) / 2}, ${chartHeight + 30})`
        );

      legendItems.forEach(([key, { color }], i) => {
        const legendItem = legend
          .append("g")
          .attr("transform", `translate(${i * legendItemWidth}, 0)`)
          .style("cursor", "pointer")
          .on("mouseover", function () {
            // Highlight this dataset
            svg.selectAll(`path[stroke="${color}"]`).attr("stroke-width", 4);

            svg
              .selectAll(
                `path[fill="url(#area-gradient-${key.replace(/\s+/g, "-")})"]`
              )
              .attr("opacity", 0.9);
          })
          .on("mouseout", function () {
            // Reset
            svg.selectAll(`path[stroke="${color}"]`).attr("stroke-width", 2.5);

            svg
              .selectAll(
                `path[fill="url(#area-gradient-${key.replace(/\s+/g, "-")})"]`
              )
              .attr("opacity", 1);
          });

        // Add color indicator
        legendItem
          .append("circle")
          .attr("r", 6)
          .attr("cx", 10)
          .attr("cy", legendHeight / 2)
          .attr("fill", color);

        // Add text
        legendItem
          .append("text")
          .attr("x", 25)
          .attr("y", legendHeight / 2)
          .attr("dy", "0.35em")
          .attr("fill", textColor)
          .attr("font-size", "12px")
          .text(key);
      });
    }
  }, [datasets, width, height, darkMode, showTooltip, showLegend, animate, useFullNumbers, dateFormat]);

  return (
    <div className="relative">
      <motion.svg
        ref={svgRef}
        className="w-full"
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      <AnimatePresence>
        {showTooltip && tooltipData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute pointer-events-none bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-10"
            style={{
              left: tooltipData.x,
              top: tooltipData.y,
              transform: "translate(-50%, -100%)",
              border: "1px solid #e2e8f0",
              minWidth: "150px",
            }}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {tooltipData.date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="space-y-1.5">
              {tooltipData.values.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.key}
                    </span>
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: item.color }}
                  >
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiLayerAreaChart;
