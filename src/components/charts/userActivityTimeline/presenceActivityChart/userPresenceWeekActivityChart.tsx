import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent } from "@/components/ui/card";
import { Expand, Minimize } from "lucide-react";
import ReactDOM from "react-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const PresenceWeekActivityChart = ({ data }) => {
  const svgRef = useRef();
  const chartRef = useRef(); // Reference to chart container
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Dynamic width and height
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(500);

  // Function to update chart dimensions
  const updateChartDimensions = () => {
    if (chartRef.current) {
      setChartWidth(chartRef.current.offsetWidth * 1.01); // Adjust to fit container
      setChartHeight(chartRef.current.offsetHeight); // Maintain proportion
    }
  };

  useEffect(() => {
    updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);
    return () => window.removeEventListener("resize", updateChartDimensions);
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr("width", chartWidth)
      .attr("height", chartHeight)
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
      .call(d3.axisBottom(x).tickFormat(d => (chartWidth < 768 && d % 2 !== 0 ? "" : d)));

    g.append("g").call(d3.axisLeft(y));

    const line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.day) + x.bandwidth() / 2)
      .y(d => y(d.value));

    // Tooltip
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
      const statusKey = selectedStatus === "all" ? Object.keys(closestData.statusCounts)[0] : selectedStatus;
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
        .attr("stroke-width", selectedStatus === "all" || selectedStatus === key ? 2 : 1)
        .attr("opacity", selectedStatus === "all" || selectedStatus === key ? 1 : 0.2)
        .attr("d", line);
    });
  }, [data, selectedStatus, chartWidth, chartHeight]);

  return (
    <div ref={chartRef} className="w-full h-[600px] flex flex-col items-left">
      <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {Object.keys(data[0].statusCounts).map((key) => (
            <SelectItem key={key} value={key}>{key}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <svg className="mx-auto" ref={svgRef}></svg>
    </div>
  );
};

const ExpandablePresenceChart = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Sample data
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    statusCounts: {
      Online: Math.floor(Math.random() * 150),
      Offline: Math.floor(Math.random() * 50),
      Idle: Math.floor(Math.random() * 30),
      DND: Math.floor(Math.random() * 20)
    }
  }));

  return (
    <Card className="flex-1 p-6">
      <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between">
        <span>Presence Activity</span>
        <button onClick={openModal} style={{ padding: "4px" }}>
          <Expand />
        </button>
      </div>
      <PresenceWeekActivityChart data={data} />
      {isModalOpen && <Modal closeModal={closeModal} data={data} />}
    </Card>
  );
};

const Modal = ({ closeModal, data }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 scale-175">
      <Card className="w-[75vw] bg-white p-4 rounded relative">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold">Presence Activity Details</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>
            <Minimize />
          </button>
        </div>
        <CardContent className="pb-0">
          <PresenceWeekActivityChart data={data} />
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};

export default ExpandablePresenceChart;
