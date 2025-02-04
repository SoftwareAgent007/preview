import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Define the data type
interface DataPoint {
  hour: number;
  count: number;
}

// Props interface
interface HorizontalBarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ 
  data, 
  width = 460, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Specific hours to always show
  const specialHours = [0, 4, 8, 12, 16, 20];

  useEffect(() => {
    // Only render if we have a ref and data
    if (!svgRef.current || data.length === 0) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Margins
    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Find max count for scaling
    const maxCount = d3.max(data, d => +d.count) || 0;

    // X axis (Linear scale for values)
    const x = d3.scaleLinear()
      .domain([0, maxCount])
      .range([0, chartWidth]);

    // Y axis (Band scale for hours)
    const y = d3.scaleBand()
      .range([0, chartHeight])
      .domain(data.map(d => `${d.hour}`))
      .padding(0.5);

    // Background bars (light gray)
    svg.selectAll("backgroundRect")
      .data(data)
      .join("rect")
        .attr("x", 20)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("width", chartWidth)
        .attr("height", y.bandwidth())
        .attr("fill", "#f0f0f0")
        .attr("rx", 5)
        .attr("ry", 5);

    // Data bars
    svg.selectAll("dataRect")
      .data(data)
      .join("rect")
        .attr("x", 20)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("width", d => x(+d.count))
        .attr("height", y.bandwidth())
        .attr("fill", "#3498db")
        .attr("rx", 5)
        .attr("ry", 5)
        .on("mouseover", (_, d) => {
          setHoveredHour(d.hour);
        })
        .on("mouseout", () => {
          setHoveredHour(null);
        });

    // Labels for specific hours or hovered hours
    svg.selectAll("hourLabels")
      .data(data)
      .join("text")
        .attr("x", -42)
        .attr("y", d => (y(`${d.hour}`) || 0) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(d => {
          // Show label if hour is in special hours or currently hovered
          if (specialHours.includes(d.hour) && d.hour !== hoveredHour) {
            return `${d.hour}:00`;
          } 

          if (d.hour === hoveredHour) {
            return `${d.hour}:00 (${d.count})`;
          }
          return "";
        })
        .attr("font-size", (d) => specialHours.includes(d.hour) && d.hour !== hoveredHour ? "18px" : "12px")
        .attr("fill", "#4a4a4a")
        .attr("opacity", 0.8);

  }, [data, width, height, hoveredHour]);

  return <svg ref={svgRef}></svg>;
};

export default HorizontalBarChart;