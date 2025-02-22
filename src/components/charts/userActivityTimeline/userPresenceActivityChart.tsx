import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const InteractiveChart = ({ 
  data = [
    { hour: 0, statusCounts: { Online: 100, Offline: 50, Idle: 30, DND: 20 } },
    { hour: 1, statusCounts: { Online: 120, Offline: 40, Idle: 25, DND: 15 } },
    { hour: 2, statusCounts: { Online: 140, Offline: 30, Idle: 20, DND: 10 } },
  ],
  width = 500, // Default width
  height = 400 // Default height
}) => {
  const svgRef = useRef();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [hoverData, setHoverData] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.hour))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(Object.values(d.statusCounts)))])
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(24));

    g.append("g").call(d3.axisLeft(y));

    const line = d3.line()
      .x(d => x(d.hour))
      .y(d => y(d.value));

    const tooltip = g.append("g").style("display", "none");

    tooltip.append("rect")
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", 100)
      .attr("height", 40);

    tooltip.append("text")
      .attr("x", 50)
      .attr("y", 20)
      .attr("text-anchor", "middle");

    svg.on("pointermove", (event) => {
      const [xPos] = d3.pointer(event, g.node());
      const hour = x.invert(xPos);
      
      const closestData = data.reduce((prev, curr) =>
        Math.abs(curr.hour - hour) < Math.abs(prev.hour - hour) ? curr : prev
      );
    
      let statusKey = selectedStatus || Object.keys(closestData.statusCounts)[0]; // Default to the first status if none is selected
      let statusValue = closestData.statusCounts[statusKey];
    
      tooltip.style("display", "block")
        .attr("transform", `translate(${x(closestData.hour) + 10},${y(statusValue) - 10})`);
      
      tooltip.select("text").text(`${statusKey}: ${statusValue}`);
    });
      
    Object.keys(data[0].statusCounts).forEach((key, i) => {
      g.append("path")
        .datum(data.map(d => ({ hour: d.hour, value: d.statusCounts[key] })))
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

export default InteractiveChart;
