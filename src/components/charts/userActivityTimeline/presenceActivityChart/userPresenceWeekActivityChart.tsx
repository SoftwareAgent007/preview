import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PresenceWeekActivityChart = ({ 
  data = [
    { day: 1, statusCounts: { Online: 100, Offline: 50, Idle: 30, DND: 20 } }, 
    { day: 2, statusCounts: { Online: 120, Offline: 40, Idle: 25, DND: 15 } }, 
    { day: 3, statusCounts: { Online: 140, Offline: 30, Idle: 20, DND: 10 } },
    { day: 4, statusCounts: { Online: 130, Offline: 35, Idle: 22, DND: 12 } },
    { day: 5, statusCounts: { Online: 125, Offline: 38, Idle: 24, DND: 14 } },
    { day: 6, statusCounts: { Online: 135, Offline: 28, Idle: 18, DND: 8 } },
    { day: 7, statusCounts: { Online: 145, Offline: 25, Idle: 15, DND: 5 } }
  ],
  width = 500,
  height = 400
}) => {
  const svgRef = useRef();
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = d3.scalePoint()
      .domain(daysOfWeek)
      .range([0, width])
      .padding(0.5);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(Object.values(d.statusCounts)))])
      .range([height, 0]);
    
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    
    g.append("g").call(d3.axisLeft(y));

    const line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => x(daysOfWeek[d.day - 1]))
      .y(d => y(d.value));

    Object.keys(data[0].statusCounts).forEach((key, i) => {
      g.append("path")
        .datum(data.map(d => ({ day: d.day, value: d.statusCounts[key] })))
        .attr("fill", "none")
        .attr("stroke", d3.schemeCategory10[i])
        .attr("stroke-width", selectedStatus && selectedStatus !== key ? 1 : 2)
        .attr("opacity", selectedStatus && selectedStatus !== key ? 0.2 : 1)
        .attr("d", line);
    });
  }, [data, selectedStatus, width, height]);

  return (
    <div>
      <select onChange={(e) => setSelectedStatus(e.target.value || null)}>
        <option value="">All</option>
        {Object.keys(data[0].statusCounts).map((key) => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PresenceWeekActivityChart;
