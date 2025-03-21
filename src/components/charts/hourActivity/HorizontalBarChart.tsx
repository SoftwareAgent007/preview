import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HourlyActivity } from '@/types/dataTypes';


interface HorizontalBarChartProps {
  data: HourlyActivity[];
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

  const specialHours = [0, 4, 8, 12, 16, 20];

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || !width || !height) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Responsive margins
    const margin = {
      top: Math.max(20, height * 0.05),
      right: Math.max(30, width * 0.08),
      bottom: Math.max(40, height * 0.1),
      left: Math.max(50, width * 0.12)
    };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Responsive font sizes
    const fontSize = Math.max(12, Math.min(16, width * 0.03));

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxCount = d3.max(data, d => +d.count) || 0;

    const x = d3.scaleLinear()
      .domain([0, maxCount])
      .range([0, chartWidth]);

    const y = d3.scaleBand()
      .range([0, chartHeight])
      .domain(data.map(d => `${d.hour}`))
      .padding(0.5);

    // Background bars
    svg.selectAll("backgroundRect")
      .data(data)
      .join("rect")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("width", chartWidth)
        .attr("height", y.bandwidth())
        .attr("fill", "#f0f0f0")
        .attr("rx", Math.min(5, y.bandwidth() / 2))
        .attr("ry", Math.min(5, y.bandwidth() / 2));

    // Data bars
    svg.selectAll("dataRect")
      .data(data)
      .join("rect")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}`) || 0)
        .attr("width", d => x(+d.count))
        .attr("height", y.bandwidth())
        .attr("fill", "#3B82F6")
        .attr("rx", Math.min(5, y.bandwidth() / 2))
        .attr("ry", Math.min(5, y.bandwidth() / 2))
        .on("mouseover", (_, d) => {
          setHoveredHour(d.hour);
        })
        .on("mouseout", () => {
          setHoveredHour(null);
        });

    // Hour labels
    svg.selectAll("hourLabels")
      .data(data)
      .join("text")
        .attr("x", -10)
        .attr("y", d => (y(`${d.hour}`) || 0) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(d => {
          if (specialHours.includes(d.hour) || d.hour === hoveredHour) {
            return `${d.hour}:00${d.hour === hoveredHour ? ` (${d.count})` : ''}`;
          }
          return "";
        })
        .attr("font-size", d => 
          specialHours.includes(d.hour) && d.hour !== hoveredHour 
            ? `${fontSize}px` 
            : `${fontSize * 0.8}px`
        )
        .attr("fill", "#4a4a4a")
        .attr("opacity", 0.8);

  }, [data, width, height, hoveredHour]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg ref={svgRef} className="w-full h-full" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default HorizontalBarChart;