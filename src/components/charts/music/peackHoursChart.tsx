import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PeakListeningHoursChartProps {
    data: { hour: number; percentage: number }[];
}

const PeakListeningHoursChart: React.FC<PeakListeningHoursChartProps> = ({ data }) => {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (data.length === 0) return;

        const width = 500;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 50, left: 40 };

        const currentHour = new Date().getHours();
        const fullDayData = Array.from({ length: 24 }, (_, i) => ({
            hour: (currentHour - 23 + i + 24) % 24,
            percentage: data.find(d => d.hour === (currentHour - 23 + i + 24) % 24)?.percentage || 0
        }));

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const x = d3.scaleBand()
            .domain(fullDayData.map(d => d.hour.toString()))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(fullDayData, d => d.percentage) || 0])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const sortedData = [...fullDayData].sort((a, b) => b.percentage - a.percentage);
        const colorScale = d3.scaleLinear<string>()
            .domain([sortedData[sortedData.length - 1]?.percentage || 0, sortedData[0].percentage])
            .range(["#e0f7fa", "#01579b"]);

        const g = svg.append("g");

        const tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "5px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px")
            .style("visibility", "hidden");

        g.selectAll("rect")
            .data(fullDayData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.hour.toString()) || 0)
            .attr("y", d => y(d.percentage))
            .attr("height", d => height - margin.bottom - y(d.percentage))
            .attr("width", x.bandwidth() * 1.2) // Increase bar thickness
            .attr("fill", d => colorScale(d.percentage))
            .attr("rx", 8) // Rounded top corners only
            .attr("ry", 8)
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible").text(`${d.hour}:00 - ${d.percentage}%`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

        g.selectAll("text")
            .data(fullDayData)
            .enter()
            .append("text")
            .attr("x", d => (x(d.hour.toString()) || 0) + x.bandwidth() * 0.6)
            .attr("y", height - margin.bottom + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#333")
            .attr("transform", d => `rotate(-45, ${(x(d.hour.toString()) || 0) + x.bandwidth() * 0.6}, ${height - margin.bottom + 20})`)
            .text(d => `${d.hour}:00`);
    }, [data]);

    return <svg ref={ref} width={500} height={300}></svg>;
};

export default PeakListeningHoursChart;
