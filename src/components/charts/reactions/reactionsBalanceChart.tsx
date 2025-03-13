import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { HistogramData } from "./reaction.interface";

interface BackToBackHistogramProps {
  data: HistogramData[];
  width?: number;
}

const BackToBackHistogram: React.FC<BackToBackHistogramProps> = ({ data = [], width = 800 }) => {
  const height = 600;

  const COLOR_POSITIVE = "#4682B4";
  const COLOR_NEUTRAL = "#A9CCE3";
  const COLOR_NEGATIVE = "#1C2833";
  
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    d3.select(chartRef.current).selectAll("*").remove();

    if (data.length === 0) {
      const svg = d3
        .select(chartRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "gray")
        .text("No data available");
      return;
    }

    const uniqueData = Array.from(d3.group(data, (d) => d.date), ([, value]) => value[0]);

    const margin = { top: 40, right: 60, bottom: 50, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand().domain(uniqueData.map((d) => d.date)).range([0, w]).padding(0.2);

    const yMax = d3.max(uniqueData, (d) => d.positive + (d.neutral / 2));
    const yMin = d3.min(uniqueData, (d) => d.negative);
    const yPadding = (yMax - yMin) * 0.1;

    const yScale = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).nice().range([h, 0]);

    const colorScale = d3.scaleOrdinal().domain(["positive", "neutral", "negative"]).range([COLOR_POSITIVE, COLOR_NEUTRAL, COLOR_NEGATIVE]);

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #3b82f6")
      .style("border-radius", "5px")
      .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
      .style("padding", "5px")
      .style("visibility", "hidden");

    const drawBars = (type, yAccessor) => {
      svg
        .selectAll(`.bar.${type}`)
        .data(uniqueData)
        .enter()
        .append("rect")
        .attr("class", `bar ${type}`)
        .attr("x", (d) => xScale(d.date))
        .attr("y", yAccessor)
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => Math.abs(yScale(0) - yScale(d[type])))
        .attr("fill", colorScale(type))
        .on("mouseover", function(event, d) {
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.date}</strong><br>Positive: ${d.positive}<br>Neutral: ${d.neutral}<br>Negative: ${Math.abs(d.negative)}`)
            .style("top", `${event.pageY - 30}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    };

    drawBars("positive", (d) => yScale(d.positive + d.neutral / 2 + 5));
    drawBars("neutral", (d) => yScale(d.neutral / 2));
    drawBars("negative", (d) => yScale(-(d.neutral / 2) - 5));

    svg.append("g")
      .attr("transform", `translate(0,${yScale(yMin) + (d3.mean(uniqueData, d => d.neutral) / 2)})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-25)")
      .attr("y", 2)
      .attr("x", -5)
      .style("font-size", "10px")
      .style("text-anchor", "end");

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", 1);

    return () => {
      tooltip.remove();
    };

  }, [data, width, height]);

  return (
    <div className="w-full flex flex-col items-center">
      <svg ref={chartRef}></svg>
      <div className="legend flex justify-center gap-8 mt-6 text-lg">
        {["positive", "neutral", "negative"].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded-md" 
              style={{ backgroundColor: item === "positive" ? COLOR_POSITIVE : item === "neutral" ? COLOR_NEUTRAL : COLOR_NEGATIVE }} 
            />
            <span className="text-lg font-medium">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackToBackHistogram;
