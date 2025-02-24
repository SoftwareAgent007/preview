import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: string;
  count: number;
}

interface AreaLineChartProps {
  data: DataPoint[];
  width: number;
  height?: number;
  graphColor?: string;
}

const AreaLineChart: React.FC<AreaLineChartProps> = ({ 
  data, 
  width, 
  height = 300,
  graphColor = "#3B82F6"
}) => {
  
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Only render if we have a ref and data
    if (!svgRef.current || data.length === 0) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Margins
    const margin = {top: 10, right: 30, bottom: 30, left: 50};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Take only the first 90 data points
    const filteredData = data.slice(0, 90);

    // X axis (Time scale)
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, chartWidth]);
    
    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

    // Y axis (Linear scale)
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => +d.count) as [number, number])
      .range([chartHeight, 0]);
    
    svg.append("g")
      .attr("transform", "translate(-5,0)")
      .call(d3.axisLeft(y).tickSizeOuter(0));

    // Area generator
    const area = d3.area<DataPoint>()
      .x(d => x(new Date(d.date)))
      .y0(chartHeight)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX)

    // Line generator
    const line = d3.line<DataPoint>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX)

    // Add area
    svg.append("path")
      .datum(filteredData)
      .attr("fill", graphColor)
      .attr("fill-opacity", 4)
      .attr("stroke", "none")
      .attr("d", area);

    // Add line
    svg.append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", graphColor)
      .attr("stroke-width", 1)
      .attr("d", line);

    // Add circles
    svg.selectAll("myCircles")
      .data(filteredData)
      .join("circle")
        .attr("fill", graphColor)
        .attr("stroke", "none")
        .attr("cx", d => x(new Date(d.date)))
        .attr("cy", d => y(d.count))
        .attr("r", 1);

  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default AreaLineChart;