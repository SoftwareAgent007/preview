import { useEffect, useRef } from "react";
import * as d3 from "d3";

const mockData = [
  { role: "Owner", percentage: 10 },
  { role: "Admin", percentage: 20 },
  { role: "User", percentage: 60 },
  { role: "Moderator", percentage: 10 },
];

const CircleRoleChart = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(["#FF5733", "#33FF57", "#3357FF", "#FF33A8"]);

    const pie = d3.pie().value((d) => d.percentage);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const dataReady = pie(mockData);

    svg
      .selectAll(".slice")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .style("stroke", "#fff")
      .style("stroke-width", "2px");

    svg
      .selectAll(".text")
      .data(dataReady)
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#fff")
      .text((d) => d.data.role);
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default CircleRoleChart;
