import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { ClickableTooltip } from "@/components/ui/tooltip";

interface PeakListeningHoursChartProps {
    data: number[];
    darkMode?: boolean;
    height?: number;
}

const PeakListeningHoursChart: React.FC<PeakListeningHoursChartProps> = ({ 
    data, 
    darkMode = false,
    height = 300
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height });
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const barsRef = useRef<d3.Selection<SVGRectElement, any, SVGGElement, unknown> | null>(null);

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, [height]);

    // Create tooltip once
    useEffect(() => {
        if (!tooltipRef.current) {
            tooltipRef.current = d3.select("body").append("div")
                .attr("class", "peak-hours-tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background", darkMode ? "#1f2937" : "white")
                .style("color", darkMode ? "white" : "black")
                .style("padding", "8px 12px")
                .style("border-radius", "6px")
                .style("font-size", "12px")
                .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)")
                .style("pointer-events", "none")
                .style("z-index", "10")
                .style("transition", "opacity 0.2s ease")
                .node();
        }

        return () => {
            if (tooltipRef.current) {
                d3.select(tooltipRef.current).remove();
                tooltipRef.current = null;
            }
        };
    }, [darkMode]);

    // Handle hover state changes without redrawing the chart
    useEffect(() => {
        if (!barsRef.current) return;
        
        barsRef.current
            .attr("opacity", d => hoveredBar === null || hoveredBar === d.hour ? 1 : 0.5);
    }, [hoveredBar]);

    // Main chart rendering
    useEffect(() => {
        if (data.length === 0 || !svgRef.current || dimensions.width === 0) return;

        const width = dimensions.width;
        const height = dimensions.height;
        const margin = { top: 30, right: 30, bottom: 60, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const currentHour = new Date().getHours();
        const max = Math.max(...data);
        const fullDayData = data.map((value, i) => ({
            hour: i,
            value,
            percentage: ((value / max) * 100).toFixed(1),
            isCurrentHour: i === currentHour
        }));

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Create gradient definitions
        const defs = svg.append("defs");
        
        // Add gradient for bars
        const gradient = defs.append("linearGradient")
            .attr("id", "bar-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");
            
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", darkMode ? "#3b82f6" : "#60a5fa");
            
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", darkMode ? "#1d4ed8" : "#3b82f6");

        // Add gradient for current hour
        const currentHourGradient = defs.append("linearGradient")
            .attr("id", "current-hour-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");
            
        currentHourGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", darkMode ? "#f97316" : "#fb923c");
            
        currentHourGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", darkMode ? "#ea580c" : "#f97316");

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Add background grid
        g.append("g")
            .attr("class", "grid")
            .selectAll("line")
            .data(d3.range(0, 101, 20))
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", innerWidth)
            .attr("y1", d => d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])(d))
            .attr("y2", d => d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])(d))
            .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)")
            .attr("stroke-dasharray", "3,3");

        const x = d3.scaleBand()
            .domain(fullDayData.map(d => d.hour.toString()))
            .range([0, innerWidth])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, Math.max(...fullDayData.map(d => parseFloat(d.percentage)))])
            .nice()
            .range([innerHeight, 0]);

        // Add x-axis with custom styling
        const xAxis = g.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(x)
                .tickFormat(d => `${d}:00`)
            );
            
        xAxis.selectAll("text")
            .attr("font-size", "10px")
            .attr("fill", darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em");
            
        xAxis.selectAll("line")
            .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)");
            
        xAxis.select(".domain")
            .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)");

        // Add y-axis with custom styling
        const yAxis = g.append("g")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => `${d}%`)
            );
            
        yAxis.selectAll("text")
            .attr("font-size", "10px")
            .attr("fill", darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)");
            
        yAxis.selectAll("line")
            .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)");
            
        yAxis.select(".domain")
            .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)");

        // Add y-axis label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -innerHeight / 2)
            .attr("text-anchor", "middle")
            .attr("fill", darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)")
            .attr("font-size", "12px")
            .text("Listening %");

        // Add bars with animations
        barsRef.current = g.selectAll(".bar")
            .data(fullDayData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.hour.toString()) || 0)
            .attr("width", x.bandwidth())
            .attr("y", innerHeight)
            .attr("height", 0)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", d => d.isCurrentHour ? "url(#current-hour-gradient)" : "url(#bar-gradient)")
            .attr("opacity", 1)
            .on("mouseover", (event, d) => {
                setHoveredBar(d.hour);
                if (tooltipRef.current) {
                    d3.select(tooltipRef.current)
                        .style("visibility", "visible")
                        .html(`
                            <div style="font-weight: bold;">${d.hour}:00${d.isCurrentHour ? ' (Current Hour)' : ''}</div>
                            <div>Count: ${d.value.toLocaleString()}</div>
                            <div>Percentage: ${d.percentage}%</div>
                        `);
                }
            })
            .on("mousemove", (event) => {
                if (tooltipRef.current) {
                    d3.select(tooltipRef.current)
                        .style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                }
            })
            .on("mouseout", () => {
                setHoveredBar(null);
                if (tooltipRef.current) {
                    d3.select(tooltipRef.current).style("visibility", "hidden");
                }
            });
        
        // Animate bars
        barsRef.current
            .transition()
            .duration(1000)
            .delay((d, i) => i * 50)
            .ease(d3.easeCubicOut)
            .attr("y", d => y(parseFloat(d.percentage)))
            .attr("height", d => innerHeight - y(parseFloat(d.percentage)));

        // Add value labels on top of bars
        g.selectAll(".value-label")
            .data(fullDayData)
            .enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", d => (x(d.hour.toString()) || 0) + x.bandwidth() / 2)
            .attr("y", d => y(parseFloat(d.percentage)) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px") 
            .attr("font-weight", "bold")
            .attr("fill", darkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)")
            .attr("opacity", 0)
            .text(d => `${Number(d.percentage).toFixed(0)}`)
            .transition()
            .duration(1000)
            .delay((d, i) => i * 50 + 500)
            .attr("opacity", d => parseFloat(d.percentage) > 10 ? 1 : 0);

    }, [data, dimensions, darkMode]);

    return (
        <motion.div 
            ref={containerRef}
            className="w-full flex flex-col"
            style={{ height }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex-1 relative">
                <svg 
                    ref={svgRef} 
                    className="w-full h-full"
                    style={{ overflow: "visible" }}
                />
            </div>
        </motion.div>
    );
};

export default PeakListeningHoursChart;
