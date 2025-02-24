import { useEffect, useRef } from "react";
import * as d3 from "d3";

type RolesData = { role: string; count: number; percentage: number | string; color: string }[];

const CircleRoleChart = ({ data }: { data: RolesData }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 500;
    const height = 500;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;

    const pie = d3.pie<{ percentage: number }>().value((d) => d.percentage);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
    const outerArc = d3.arc().innerRadius(radius).outerRadius(radius + 30);

    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll("*").remove();
    
    const chartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const dataReady = pie(data);

    // Draw pie slices
    const slices = chartGroup.selectAll(".slice").data(dataReady);

    slices
      .enter()
      .append("path")
      .attr("class", "slice")
      .merge(slices)
      .attr("d", arcGenerator as any)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8);

    slices.exit().remove();

    // Append text labels
    const textLabels = chartGroup.selectAll(".role-text").data(dataReady);

    const labelsEnter = textLabels
      .enter()
      .append("text")
      .attr("class", "role-text")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "black");

    labelsEnter
      .merge(textLabels)
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        return `translate(${pos})`;
      });

    labelsEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "-5")
      .attr("font-weight", "bold")
      .attr("font-size", "20")
      .attr("fill", "black")
      .text((d) => d.data.role);

    labelsEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "15")
      .text((d) => `${d.data.count} (${d.data.percentage}%)`);

    textLabels.exit().remove();

    // Hover effect
    chartGroup
      .selectAll("path")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1.0)
          .style("filter", "drop-shadow(0px 0px 5px rgba(0,0,0,0.5))");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .style("filter", "none");
      });
  }, [data]);

  return <svg className="m-auto" ref={svgRef}></svg>;
};

export default CircleRoleChart;