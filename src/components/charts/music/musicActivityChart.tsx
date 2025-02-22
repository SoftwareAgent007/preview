import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  genre: string;
  artist: string;
  count: number;
  total: number;
}

interface HorizontalBarChartRelatedGenresProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

const HorizontalBarChartRelatedGenres: React.FC<HorizontalBarChartRelatedGenresProps> = ({
  data,
  width = 500,
  height = 450,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 50, bottom: 40, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxCount = d3.max(data, (d) => d.total) || 0;

    const x = d3.scaleLinear().domain([0, maxCount]).range([0, chartWidth]);

    const y = d3
      .scaleBand()
      .range([0, chartHeight])
      .domain(data.map((d) => d.genre))
      .padding(0.3);

    svg
      .selectAll("backgroundRect")
      .data(data)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.genre) + 3 || 0)
      .attr("width", chartWidth)
      .attr("height", y.bandwidth() / 1.5) // Thinner bars
      .attr("fill", "#f0f0f0")
      .attr("rx", 4)
      .attr("ry", 4);

    svg
      .selectAll("dataRect")
      .data(data)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.genre) + 3 || 0)
      .attr("width", (d) => x(d.count))
      .attr("height", y.bandwidth() / 1.5) // Thinner bars
      .attr("fill", "#3B82F6")
      .attr("rx", 4)
      .attr("ry", 4);

    svg
      .selectAll("genreLabels")
      .data(data)
      .join("text")
      .attr("x", -10)
      .attr("y", (d) => (y(d.genre) -5 || 0) + y.bandwidth() / 3)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text((d) => `${d.genre}`)
      .attr("font-size", "14px")
      .attr("fill", "#4a4a4a");

    svg
      .selectAll("artistLabels")
      .data(data)
      .join("text")
      .attr("x", -10)
      .attr("y", (d) => (y(d.genre) -5 || 0) + y.bandwidth() / 1.2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text((d) => {
        const maxLength = 10; // Set the maximum length for the artist name
        return d.artist.length > maxLength ? `${d.artist.substring(0, maxLength)}...` : d.artist;
      })
      .attr("font-size", "12px")
      .attr("fill", "#888");

    svg
      .selectAll("percentageLabels")
      .data(data)
      .join("text")
      .attr("x", (d) => x(d.count) + 5)
      .attr("y", (d) => (y(d.genre) || 0) + y.bandwidth() / 2.5)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text((d) => `${((d.count / d.total) * 100).toFixed(1)}%`)
      .attr("font-size", "12px")
      .attr("fill", "#4a4a4a");

  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default HorizontalBarChartRelatedGenres;
