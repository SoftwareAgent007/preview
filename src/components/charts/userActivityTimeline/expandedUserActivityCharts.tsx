import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ActivityCharts = () => {
  // Sample data - replace with your actual data source
  const data = {
    activeUsers: [
      { date: '2024-01-01', count: 1200 },
      { date: '2024-01-02', count: 1350 },
      { date: '2024-01-03', count: 1100 },
      { date: '2024-01-04', count: 1400 },
      { date: '2024-01-05', count: 1600 },
    ],
    playingNow: [
      { date: '2024-01-01', count: 800 },
      { date: '2024-01-02', count: 900 },
      { date: '2024-01-03', count: 750 },
      { date: '2024-01-04', count: 950 },
      { date: '2024-01-05', count: 1100 },
    ]
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>User Activity Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-20" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-40" />
              <span className="text-sm font-medium">Playing Now</span>
            </div>
          </div>
          <CombinedAreaChart
            data={data}
            width={800}
            height={300}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const CombinedAreaChart = ({ data, width, height = 300 }) => {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    if (!svgRef.current || !data.activeUsers.length || !data.playingNow.length) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get combined date range
    const allDates = [...data.activeUsers, ...data.playingNow].map(d => new Date(d.date));
    const xDomain = d3.extent(allDates);

    // Get combined count range
    const allCounts = [...data.activeUsers, ...data.playingNow].map(d => d.count);
    const yDomain = [0, d3.max(allCounts) * 1.1];

    // X scale
    const x = d3.scaleTime()
      .domain(xDomain)
      .range([0, chartWidth]);

    // Y scale
    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([chartHeight, 0]);

    // Area generator
    const area = d3.area()
      .x(d => x(new Date(d.date)))
      .y0(chartHeight)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("stroke-opacity", 0.1)
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-chartWidth)
        .tickFormat(""));

    // Add Active Users area and line
    svg.append("path")
      .datum(data.activeUsers)
      .attr("fill", "#3498db")
      .attr("fill-opacity", 0.2)
      .attr("d", area);

    svg.append("path")
      .datum(data.activeUsers)
      .attr("fill", "none")
      .attr("stroke", "#3498db")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7)
      .attr("d", line);

    // Add Playing Now area and line
    svg.append("path")
      .datum(data.playingNow)
      .attr("fill", "#2ecc71")
      .attr("fill-opacity", 0.3)
      .attr("d", area);

    svg.append("path")
      .datum(data.playingNow)
      .attr("fill", "none")
      .attr("stroke", "#2ecc71")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x)
        .ticks(5)
        .tickSize(0)
        .tickPadding(8))
      .call(g => g.select(".domain").attr("stroke-opacity", 0.2));

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(0)
        .tickPadding(8))
      .call(g => g.select(".domain").attr("stroke-opacity", 0.2));

  }, [data, width, height]);

  return <svg ref={svgRef} className="w-full" />;
};

export default ActivityCharts;