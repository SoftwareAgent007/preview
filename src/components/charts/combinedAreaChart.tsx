import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { DataSet } from "@/components/common/types/userAnalytic.types";

const MultiLayerAreaChart = ({ datasets, width, height = 300 }: { datasets: DataSet; width: number; height: number }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    console.log('datasets',datasets)
    if (!svgRef.current || Object.keys(datasets).length === 0) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const allDates = Object.values(datasets).flatMap((dataset) => dataset.data.map((d) => new Date(d.date)));
    const xDomain = d3.extent(allDates);

    const allCounts = Object.values(datasets).flatMap((dataset) => dataset.data.map((d) => d.count));
    const yDomain = [0, d3.max(allCounts) * 1.1];

    const x = d3.scaleTime().domain(xDomain).range([0, chartWidth]);
    const y = d3.scaleLinear().domain(yDomain).range([chartHeight, 0]);

    const area = d3
      .area()
      .x((d) => x(new Date(d.date)))
      .y0(chartHeight)
      .y1((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    const line = d3
      .line()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("stroke-opacity", 0.1)
      .call(d3.axisLeft(y).ticks(5).tickSize(-chartWidth).tickFormat(""));

    Object.values(datasets).forEach(({ data, color }) => {
      svg.append("path").datum(data).attr("fill", color).attr("fill-opacity", 0.3).attr("d", area);
      svg.append("path").datum(data).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2).attr("d", line);
    });

    svg.append("g").attr("transform", `translate(0,${chartHeight})`).call(
      d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(8)
    ).call((g) => g.select(".domain").attr("stroke-opacity", 0.2));

    svg.append("g").call(
      d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8)
    ).call((g) => g.select(".domain").attr("stroke-opacity", 0.2));
  }, [datasets, width, height]);

  return <svg ref={svgRef} className="w-full" />;
};

export default MultiLayerAreaChart;
