import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent } from "@/components/ui/card";
import { Expand, Minimize } from "lucide-react";
import ReactDOM from "react-dom";
import { Select } from "@/components/ui/select";

const PresenceWeekActivityChart = ({ 
  data = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    statusCounts: {
      Online: Math.floor(Math.random() * 150),
      Offline: Math.floor(Math.random() * 50),
      Idle: Math.floor(Math.random() * 30),
      DND: Math.floor(Math.random() * 20)
    }
  })),
  width = 490,
  height = 500
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
      
    const x = d3.scaleBand()
      .domain(data.map(d => d.day))
      .range([0, width])
      .padding(0.2);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(Object.values(d.statusCounts)))])
      .range([height, 0]);

    g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => d));

    g.append("g").call(d3.axisLeft(y));

    const line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.day) + x.bandwidth() / 2)
      .y(d => y(d.value));

    // Tooltip setup
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
      const day = Math.round(xPos / (width / data.length));
      const closestData = data.find(d => d.day === day);
      if (!closestData) return;
      const statusKey = selectedStatus || Object.keys(closestData.statusCounts)[0];
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
    <div>
      <Select onChange={(e) => setSelectedStatus(e.target.value || null)}>
        <option value="">All</option>
        {Object.keys(data[0].statusCounts).map((key) => (
          <option key={key} value={key}>{key}</option>
        ))}
      </Select>
      <svg className="mx-auto" ref={svgRef}></svg>
    </div>
  );
};

const ExpandablePresenceChart = ({ width = 490 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <Card className="flex-1 p-6">
      <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between">
        <span>Presence Activity</span>
        <button onClick={openModal} style={{ padding: "4px" }}>
          <Expand />
        </button>
      </div>
      <PresenceWeekActivityChart width={width} />
      {isModalOpen && <Modal closeModal={closeModal} />}
    </Card>
  );
};

const Modal = ({ closeModal }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 scale-175">
      <Card className="w-[75vw] bg-white p-4 rounded relative">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold">Presence Activity Details</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={closeModal}
          >
            <Minimize />
          </button>
        </div>
        <CardContent className="pb-0">
          <PresenceWeekActivityChart width={document.body.offsetWidth/1.8} />
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};

export default ExpandablePresenceChart;
