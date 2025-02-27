import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { ActivityStatusData } from "@/components/common/types/userAnalytic.types";

interface HeatmapProps {
  activityData?: ActivityStatusData[];
  maxActivity?: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ activityData, maxActivity = 500 }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  
  
  const weeks = activityData ? activityData.length : 0;
  const days = activityData && activityData.length > 0 ? Object.keys(activityData[0]) : [];

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 80 };
    const width = ref.current.clientWidth - margin.left - margin.right; 
    const height = width * (days.length / (weeks || 1)); 

    const xScale = d3.scaleBand()
      .domain(d3.range(weeks))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(days)
      .range([0, height])
      .padding(0.1);

    const colorScale = d3.scaleLinear()
      .domain([0, maxActivity])
      .range(["#e0f7fa", "#01579b"]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("box-shadow", "0px 0px 10px rgba(0,0,0,0.1)")
      .style("visibility", "hidden");

    g.selectAll(".cell")
      .data(activityData ? activityData.flatMap((weekData, week) =>
        days.map(day => ({ week, day, value: weekData[day] }))
      ) : [])
      .enter()
      .append("rect")
      .attr("x", (d: any) => xScale(d.week))
      .attr("y", (d: any) => yScale(d.day))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d: any) => colorScale(d.value ? d.value.value : 0))
      .attr("opacity", (d: any) => 0.1 + (d.value ? d.value.value / maxActivity : 0) * 0.8)
      .on("mouseover", (event: any, d: any) => {
        tooltip.style("visibility", "visible")
            .html(`<strong class="text-blue-600">Day:</strong> <span class="text-blue-500">${d.day}</span><br>
                    <strong class="text-blue-600">Date:</strong> <span class="text-blue-500">${d.value ? d.value.date : 'N/A'}</span><br>
                    <strong class="text-blue-600">Count:</strong> <span class="text-blue-500">${d.value ? d.value.value + 1 : 0}</span>`)
            .style("background-color", "white")
            .style("border", "1px solid #3b82f6") 
            .style("border-radius", "0.375rem") 
            .style("padding", "0.625rem") 
            .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)") 
            .style("color", "#3b82f6"); 
      })
      .on("mousemove", (event: any) => {
        tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    g.selectAll(".day-label")
      .data(days)
      .enter()
      .append("text")
      .attr("x", 2)
      .attr("y", (d: any) => yScale(d) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("text-anchor", "end")
      .style("font-weight", "bold")
      .text((d: any) => d);

    
    g.selectAll(".week-label")
      .data(d3.range(weeks))
      .enter()
      .append("text")
      .attr("x", (d: any) => (xScale(d) + xScale.bandwidth() / 2) + 5)
      .attr("y", height + 15) 
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .text((d: any) => `Week ${d + 1}`);
  }, [activityData, maxActivity]);

  return (
    <div className="w-full">
      <svg ref={ref} width="100%" height={520}></svg>
      <div className="flex justify-center mt-2 border rounded-lg p-2">
        <div className="flex items-center gap-2">
          <span className="text-xs">Indicator of the number of selected type uses per day</span>
          <div className="flex gap-1">
            {["#e0f7fa", "#81d4fa", "#29b6f6", "#0288d1", "#01579b"].map((color, i) => (
              <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color, opacity: 0.2 + i * 0.2 }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
