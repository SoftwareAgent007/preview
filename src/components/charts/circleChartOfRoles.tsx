import { useEffect, useRef } from "react";
import * as d3 from "d3";

type RolesData = { role: string; count: number; percentage: number | string; color: string }[];

const CircleRoleChart = ({ data, width = 500, height = 600 }: { data: RolesData; width?: number; height?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;

    const pie = d3.pie<{ percentage: number }>().value((d) => d.percentage);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
    const outerArc = d3.arc().innerRadius(radius + 20).outerRadius(radius + 50);

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const chartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const dataReady = pie(data);

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

    const labelsData = dataReady.map((d) => ({
      role: d.data.role,
      count: d.data.count,
      percentage: d.data.percentage,
      x: outerArc.centroid(d)[0],
      y: outerArc.centroid(d)[1]
    }));

    const simulation = d3.forceSimulation(labelsData)
      .force("x", d3.forceX((d) => d.x).strength(0.5))
      .force("y", d3.forceY((d) => d.y).strength(0.5))
      .force("collide", d3.forceCollide(25)) // Раздвигаем метки
      .stop();

    for (let i = 0; i < 120; i++) simulation.tick(); // Запускаем симуляцию вручную

    const textLabels = chartGroup.selectAll(".role-text").data(labelsData);

    const labelsEnter = textLabels
      .enter()
      .append("text")
      .attr("class", "role-text")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "black");

    labelsEnter
      .merge(textLabels)
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    labelsEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "-5")
      .attr("font-weight", "bold")
      .attr("font-size", "20")
      .attr("fill", "black")
      .text((d) => d.role);

    labelsEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "15")
      .text((d) => `${d.count} (${d.percentage}%)`);

    textLabels.exit().remove();

    // Hover-эффект для сегментов
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

  }, [data, width, height]);

  return <svg className="m-auto" ref={svgRef}></svg>;
};

export default CircleRoleChart;
