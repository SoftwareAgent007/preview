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
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = {top: 20, right: 100, bottom: 40, left: 50};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

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

    svg.selectAll("backgroundRect")
      .data(top5Data)
      .join("rect")
        .attr("x", 25)
        .attr("y", d => (y(`${d.hour}:00`) || 0) + 5) 
        .attr("width", chartWidth - 20)
        .attr("height", y.bandwidth()) 
        .attr("fill", "#e0e0e0")
        .attr("rx", 10) 
        .attr("ry", 10);

    svg.selectAll("dataRect")
      .data(top5Data)
      .join("rect")
        .attr("x", 25)
        .attr("y", d => (y(`${d.hour}:00`) || 0) + 5) 
        .attr("width", d => x(+d.count) - 20)
        .attr("height", y.bandwidth()) 
        .attr("fill", "#3B82F6")
        .attr("rx", 10) 
        .attr("ry", 10);

    svg.selectAll("hourLabels")
      .data(top5Data)
      .join("text")
        .attr("x", -4)
        .attr("y", d => (y(`${d.hour}:00`) || 0) + y.bandwidth() / 1.5)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(d => `${d.hour}:00`)
        .attr("font-size", "18px")
        .attr("fill", "#4a4a4a")
        .style("font-weight", "bold");

    svg.selectAll("countLabels")
      .data(top5Data)
      .join("text")
        .attr("x", chartWidth + 100)
        .attr("y", d => (y(`${d.hour}:00`) || 0) + y.bandwidth() / 1.5)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(d => `${d.count} users`)
        .attr("font-size", "18px")
        .attr("fill", "#4a4a4a");

  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default HorizontalTopHoursChart;
