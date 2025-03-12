import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  hour: number;
  count: number;
}

interface HorizontalTopHoursChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

const HorizontalTopHoursChart: React.FC<HorizontalTopHoursChartProps> = ({ 
  data, 
  width = 460, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || !width || !height) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Responsive margins
    const margin = {
      top: Math.max(20, height * 0.05),
      right: Math.max(60, width * 0.15),
      bottom: Math.max(20, height * 0.1),
      left: Math.max(40, width * 0.1)
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

    const top5Data = [...data].sort((a, b) => b.count - a.count).slice(0, 5);
    const maxCount = d3.max(top5Data, d => +d.count) || 0;

    const x = d3.scaleLinear()
      .domain([0, maxCount])
      .range([0, chartWidth]);

    const y = d3.scaleBand()
      .range([0, chartHeight])
      .domain(top5Data.map(d => `${d.hour}:00`))
      .padding(0.5);

    // Background bars
    svg.selectAll("backgroundRect")
      .data(top5Data)
      .join("rect")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}:00`) || 0)
        .attr("width", chartWidth)
        .attr("height", y.bandwidth())
        .attr("fill", "#e0e0e0")
        .attr("rx", Math.min(10, y.bandwidth() / 2))
        .attr("ry", Math.min(10, y.bandwidth() / 2));

    // Data bars
    svg.selectAll("dataRect")
      .data(top5Data)
      .join("rect")
        .attr("x", 0)
        .attr("y", d => y(`${d.hour}:00`) || 0)
        .attr("width", d => x(+d.count))
        .attr("height", y.bandwidth())
        .attr("fill", "#3B82F6")
        .attr("rx", Math.min(10, y.bandwidth() / 2))
        .attr("ry", Math.min(10, y.bandwidth() / 2));

    // Hour labels
    svg.selectAll("hourLabels")
      .data(top5Data)
      .join("text")
        .attr("x", -10)
        .attr("y", d => (y(`${d.hour}:00`) || 0) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(d => `${d.hour}:00`)
        .attr("font-size", `${fontSize}px`)
        .attr("fill", "#4a4a4a")
        .style("font-weight", "bold");

    // Count labels
    svg.selectAll("countLabels")
      .data(top5Data)
      .join("text")
        .attr("x", d => x(+d.count) + 5)
        .attr("y", d => (y(`${d.hour}:00`) || 0) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => `${d.count} users`)
        .attr("font-size", `${fontSize}px`)
        .attr("fill", "#4a4a4a");

  }, [data, width, height]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg ref={svgRef} className="w-full h-full" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default HorizontalTopHoursChart;