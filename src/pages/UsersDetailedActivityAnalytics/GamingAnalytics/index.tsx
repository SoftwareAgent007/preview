import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";

type RolesData = { role: string; count: number; percentage: number; color: string }[];

const CircleRoleChart = ({ data }: { data: RolesData }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const width = 500;
    const height = 500;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;

    const pie = d3.pie<{ percentage: number }>().value((d) => d.percentage);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
    const outerArc = d3.arc().innerRadius(radius).outerRadius(radius + 30);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -height / 2 + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("Active Roles Playing Now");

    const dataReady = pie(data);

    svg
      .selectAll(".slice")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8);

    const legend = svg
      .selectAll(".legend")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(-60, ${i * 20 - 100})`);

    legend
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d) => d.color);

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text((d) => d.role);
  }, [data]);

  return <svg className="m-auto" ref={svgRef}></svg>;
};

const GamingAnalytics = () => {
  return (
    <div className="w-full bg-gray-50">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex gap-6 mb-6">
          {['Active Users', 'Avg. Session Time', 'Peak Players', 'Total Game Time'].map((title, index) => (
            <Card key={index} className="flex-1 p-6 h-30">
              <div className="h-full flex items-center justify-center text-gray-700 font-bold">{title}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="grid grid-rows-10 h-[1000px] gap-6">
            <Card className="p-6 row-span-6">
              <div className="h-full flex items-center justify-center text-gray-700">User Activity Timeline</div>
            </Card>
            <Card className="p-6 row-span-4">
              <div className="h-full flex items-center justify-center text-gray-700">Top Games</div>
            </Card>
          </div>
          
          <div className="grid grid-rows-8 gap-6 h-[1000px]">
            <Card className="p-6 row-span-3">
              <div className="h-full flex items-center justify-center text-gray-700">Steam Players <img src="steam_logo.png" alt="Steam Logo" className="inline-block w-6 h-6 ml-2" /></div>
            </Card>
            <Card className="p-6 row-span-5">
              <CircleRoleChart data={[]} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamingAnalytics;
