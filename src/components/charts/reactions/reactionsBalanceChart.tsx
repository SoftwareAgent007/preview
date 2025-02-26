import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const data = [
  { date: "2024-11-21", positive: 150, neutral: 50, negative: -30 },
  { date: "2024-11-21", positive: 150, neutral: 50, negative: -30 },
  { date: "2024-11-22", positive: 200, neutral: 60, negative: -40 },
  { date: "2024-11-23", positive: 180, neutral: 55, negative: -35 },
  { date: "2024-11-24", positive: 220, neutral: 65, negative: -50 },
  { date: "2024-11-25", positive: 170, neutral: 45, negative: -20 },
  { date: "2024-11-26", positive: 210, neutral: 70, negative: -45 },
  { date: "2024-11-23", positive: 180, neutral: 55, negative: -35 },
];

export default function MessageSentimentChart() {
  const ref = useRef();

  useEffect(() => {
    const width = 900;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const barPadding = data.length > 10 ? 0.1 : 0.3;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(barPadding);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.negative) * 1.2, 
        d3.max(data, d => d.positive) * 1.2
      ])
      .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #3b82f6")
      .style("border-radius", "5px")
      .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
      .style("padding", "5px")
      .style("visibility", "hidden");

    const drawBars = (dataKey, color) => {
      svg.selectAll(`.bar-${dataKey}`)
        .data(data)
        .enter()
        .append("rect")
        .attr("class", `bar-${dataKey}`)
        .attr("x", d => xScale(d.date))
        .attr("y", d => yScale(Math.max(0, d[dataKey])))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale(d[dataKey]) - yScale(0)))
        .attr("fill", color)
        .attr("stroke", "black")
        .on("mouseover", function(event, d) {
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.date}</strong><br>Positive: ${d.positive}<br>Neutral: ${d.neutral}<br>Negative: ${d.negative}`)
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    };

    drawBars("positive", "green");
    drawBars("neutral", "yellow");
    drawBars("negative", "orange");

    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  }, [data]); // Dependency added to re-run effect when data changes

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Message Sentiment</CardTitle>
        <Info className="cursor-pointer" size={18} />
      </CardHeader>
      <CardContent>
        <p>👍 +35%, 😐 54%, 👎 -11%</p>
        <svg ref={ref}></svg>
      </CardContent>
    </Card>
  );
}
