import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  count: number;
}

interface AreaLineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  graphColor?: string;
  title?: string;
  showTooltip?: boolean;
  showGridLines?: boolean;
  animate?: boolean;
  darkMode?: boolean;
}

const AreaLineChart: React.FC<AreaLineChartProps> = ({ 
  data, 
  width, 
  height,
  graphColor = "#8884d8",
  title,
  showTooltip = true,
  showGridLines = true,
  animate = true,
  darkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<DataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .range([chartHeight, 0]);

    const area = d3.area<DataPoint>()
      .x(d => x(new Date(d.date)))
      .y0(chartHeight)
      .y1(d => y(d.count));

    const line = d3.line<DataPoint>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.count));

    // Add area
    g.append("path")
      .datum(data)
      .attr("fill", graphColor)
      .attr("fill-opacity", 0.3)
      .attr("d", area);

    // Add line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", graphColor)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));

    // Add tooltip interaction
    if (showTooltip) {
      const tooltip = g.append("g")
        .style("display", "none");

      tooltip.append("circle")
        .attr("r", 4)
        .attr("fill", graphColor);

      const bisect = d3.bisector((d: DataPoint) => new Date(d.date)).left;

      svg.on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event, g.node());
        const x0 = x.invert(mouseX);
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        if (!d0 || !d1) return;
        const d = x0.getTime() - new Date(d0.date).getTime() > new Date(d1.date).getTime() - x0.getTime() ? d1 : d0;

        tooltip
          .style("display", null)
          .attr("transform", `translate(${x(new Date(d.date))},${y(d.count)})`);

        setHoveredData(d);
        setTooltipPosition({
          x: x(new Date(d.date)) + margin.left,
          y: y(d.count) + margin.top
        });
      })
      .on("mouseleave", function() {
        tooltip.style("display", "none");
        setHoveredData(null);
      });
    }
  }, [data, width, height, graphColor, showTooltip]);

  return (
    <div className="relative">
      <svg ref={svgRef} />
      {hoveredData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute pointer-events-none bg-white dark:bg-gray-800 shadow-lg rounded-md px-3 py-2 text-sm"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 40,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium">
            {new Date(hoveredData.date).toLocaleDateString()}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {hoveredData.count.toLocaleString()} users
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AreaLineChart;