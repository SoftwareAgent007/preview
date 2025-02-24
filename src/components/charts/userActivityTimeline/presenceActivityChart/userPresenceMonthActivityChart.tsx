import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { Button } from "react-day-picker";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const InteractiveChart = ({ 
  data = [
    { day: 1, statusCounts: { Online: 100, Offline: 50, Idle: 30, DND: 20 } }, 
    { day: 2, statusCounts: { Online: 120, Offline: 40, Idle: 25, DND: 15 } }, 
    { day: 3, statusCounts: { Online: 140, Offline: 30, Idle: 20, DND: 10 } }, 
    { day: 4, statusCounts: { Online: 130, Offline: 35, Idle: 22, DND: 12 } }, 
    { day: 5, statusCounts: { Online: 125, Offline: 38, Idle: 24, DND: 14 } }, 
    { day: 6, statusCounts: { Online: 135, Offline: 28, Idle: 18, DND: 9 } }, 
    { day: 7, statusCounts: { Online: 145, Offline: 25, Idle: 15, DND: 8 } }  
  ],
  width = 500,
  height = 400
}) => {
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
      
    const x = d3.scaleBand()
      .domain(data.map(d => d.day))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(Object.values(d.statusCounts)))])
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => daysOfWeek[d - 1]));

    g.append("g").call(d3.axisLeft(y));

    const line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.day) + x.bandwidth() / 2)
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
      const day = Math.round(xPos / (width / data.length)); // Adjusted to calculate day based on x position
      const closestData = data.find(d => d.day === day);
      if (!closestData) return;
      const statusKey = selectedStatus || Object.keys(closestData.statusCounts)[0] as keyof typeof closestData.statusCounts;
      const statusValue = closestData.statusCounts[statusKey];
      tooltip.style("display", "block")
        .attr("transform", `translate(${x(closestData.day) + 10},${y(statusValue) - 10})`);
      tooltip.select("text").text(`${statusKey}: ${statusValue}`);
    });
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

    <Card className="flex-1 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">User Presence Activity Timeline</h2>
        <div className="flex gap-2">
          <Button onClick={() => {/* Handle Weekly */}}>Weekly</Button>
          <Button onClick={() => {/* Handle Monthly */}}>Monthly</Button>
          <Button onClick={() => {/* Handle Yearly */}}>Yearly</Button>
        </div>
      </div>
      <Select onValueChange={(value) => setSelectedStatus(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {Object.keys(data[0].statusCounts).map((key) => (
            <SelectItem key={key} value={key}>{key}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <svg ref={svgRef}></svg>
    </Card>
  );
};

export default InteractiveChart;
