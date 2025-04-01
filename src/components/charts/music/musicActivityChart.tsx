import { GenreData } from "@/pages/MusicMetrics/interfaces/music.interfaces";
import * as d3 from "d3";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface DataPoint extends GenreData {
  artist: string;
  total: number;
}

interface HorizontalBarChartRelatedGenresProps {
  data: GenreData[];
  darkMode?: boolean;
  width?: number;
  height?: number;
}

const HorizontalBarChartRelatedGenres: React.FC<HorizontalBarChartRelatedGenresProps> = ({
  data,
  darkMode = false,
  width = 400,
  height = 350
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const barsRef = useRef<d3.Selection<any, DataPoint, any, unknown> | null>(null);
  const backgroundBarsRef = useRef<d3.Selection<any, DataPoint, any, unknown> | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const capitalizeGenre = (genre: string) => {
    return genre.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = width || containerRef.current.clientWidth;
        setDimensions({
          width: Math.max(300, newWidth), // Minimum width of 300px
          height: height || containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  // Create tooltip once
  useEffect(() => {
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select("body").append("div")
        .attr("class", "genre-tooltip")
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
    if (!barsRef.current || !backgroundBarsRef.current) return;
    
    barsRef.current
      .attr("opacity", d => hoveredGenre === null || hoveredGenre === d.genre ? 1 : 0.5)
      .attr("stroke-width", d => hoveredGenre === d.genre ? 2 : 0);
      
    backgroundBarsRef.current
      .attr("opacity", d => hoveredGenre === null || hoveredGenre === d.genre ? 0.15 : 0.05);
  }, [hoveredGenre]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || dimensions.width === 0) return;

    const chartData: DataPoint[] = data.map(d => ({
      ...d,
      artist: "Artist", // TODO: Add artist data
      total: d.playCount,
      count: d.playCount
    }));

    const actualWidth = dimensions.width;
    const actualHeight = dimensions.height;
    
    // Dynamic margins based on screen width
    const margin = { 
      top: 20, 
      right: actualWidth < 400 ? 5 : 10,
      bottom: actualWidth < 400 ? 40 : 30,
      left: Math.min(120, Math.max(80, actualWidth * 0.25)) // Responsive left margin with min/max bounds
    };
    
    const chartWidth = actualWidth - margin.left - margin.right;
    const chartHeight = actualHeight - margin.top - margin.bottom;
    
    // Adjust bar dimensions for small screens
    const optimalBarHeight = actualWidth < 400 
      ? Math.max(15, Math.min(30, (chartHeight / data.length) * 0.6))
      : Math.max(20, Math.min(40, (chartHeight / data.length) * 0.6));
      
    const barPadding = actualWidth < 400
      ? Math.max(5, Math.min(20, (chartHeight / data.length) * 0.4))
      : Math.max(10, Math.min(30, (chartHeight / data.length) * 0.4));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    svg.attr("width", actualWidth)
       .attr("height", actualHeight);

    // Create gradient definitions
    const defs = svg.append("defs");
    
    // Add gradient for bars
    const gradient = defs.append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", darkMode ? "#3b82f6" : "#60a5fa");
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", darkMode ? "#1d4ed8" : "#3b82f6");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sort data by count in descending order
    const sortedData = [...chartData].sort((a, b) => b.count - a.count);

    const maxCount = d3.max(sortedData, d => d.total) || 0;

    const x = d3.scaleLinear()
      .domain([0, maxCount])
      .range([0, chartWidth]);

    const y = d3.scaleBand()
      .range([0, chartHeight])
      .domain(sortedData.map(d => d.genre))
      .padding(barPadding / (optimalBarHeight + barPadding));

    // Add subtle grid lines
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(x.ticks(actualWidth < 400 ? 3 : 5))
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)")
      .attr("stroke-dasharray", "3,3");

    // Add x-axis with custom styling
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x)
        .ticks(actualWidth < 400 ? 3 : 5)
        .tickFormat(d => actualWidth < 400 ? `${d/1000}k` : `${d}`)
      );
      
    xAxis.selectAll("text")
      .attr("font-size", actualWidth < 400 ? "8px" : "10px")
      .attr("fill", darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)");
      
    xAxis.selectAll("line")
      .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)");
      
    xAxis.select(".domain")
      .attr("stroke", darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)");

    // Add x-axis label
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + margin.bottom + (actualWidth < 400 ? -5 : 10))
      .attr("text-anchor", "middle")
      .attr("fill", darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)")
      .attr("font-size", actualWidth < 400 ? "10px" : "14px")
      .attr("font-weight", "500")
      .text("Listening Count");

    // Add background bars
    backgroundBarsRef.current = g.selectAll(".background-bar")
      .data(sortedData)
      .join("rect")
      .attr("class", "background-bar")
      .attr("x", 0)
      .attr("y", d => (y(d.genre) ?? 0))
      .attr("width", d => x(d.total))
      .attr("height", y.bandwidth())
      .attr("fill", darkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(96, 165, 250, 0.1)")
      .attr("opacity", 0.15)
      .attr("rx", actualWidth < 400 ? 2 : 4)
      .attr("ry", actualWidth < 400 ? 2 : 4);

    // Add data bars with animations
    barsRef.current = g.selectAll(".data-bar")
      .data(sortedData)
      .join("rect")
      .attr("class", "data-bar")
      .attr("x", 0)
      .attr("y", d => (y(d.genre) ?? 0))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", "url(#bar-gradient)")
      .attr("stroke", darkMode ? "#fff" : "#000")
      .attr("stroke-width", 0)
      .attr("stroke-opacity", 0.5)
      .attr("rx", actualWidth < 400 ? 2 : 4)
      .attr("ry", actualWidth < 400 ? 2 : 4)
      .on("mouseover", (event, d) => {
        setHoveredGenre(d.genre);
        if (tooltipRef.current) {
          d3.select(tooltipRef.current)
            .style("visibility", "visible")
            .html(`
              <div style="font-weight: bold;">${capitalizeGenre(d.genre)}</div>
              <div>Count: ${d.playCount.toLocaleString()} (${d.percentage}%)</div>
            `);
        }
      })
      .on("mousemove", (event) => {
        if (tooltipRef.current) {
          const tooltipWidth = tooltipRef.current.offsetWidth;
          const xPos = event.pageX + 10;
          const yPos = event.pageY - 10;
          
          // Prevent tooltip from going off screen
          const adjustedX = xPos + tooltipWidth > window.innerWidth 
            ? event.pageX - tooltipWidth - 10 
            : xPos;

          d3.select(tooltipRef.current)
            .style("top", `${yPos}px`)
            .style("left", `${adjustedX}px`);
        }
      })
      .on("mouseout", () => {
        setHoveredGenre(null);
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style("visibility", "hidden");
        }
      });
    
    // Animate bars
    if (barsRef.current) {
      barsRef.current
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .ease(d3.easeElasticOut.amplitude(0.8).period(0.8))
        .attr("width", d => x(d.count));
    }

    // Add genre labels on y-axis with responsive font size and truncation
    g.selectAll(".genre-label")
      .data(sortedData)
      .join("text")
      .attr("class", "genre-label")
      .attr("x", -10)
      .attr("y", d => (y(d.genre) ?? 0) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", actualWidth < 400 ? "10px" : "14px")
      .attr("font-weight", "500")
      .attr("fill", darkMode ? "#fff" : "#4a4a4a")
      .each(function(d) {
        const genre = capitalizeGenre(d.genre);
        const maxChars = actualWidth < 400 ? 8 : 13;
        
        const text = d3.select(this);
        const words = genre.split(' ');
        let lines: string[] = [];
        let currentLine = '';
        
        words.forEach(word => {
          if (currentLine.length + word.length > maxChars) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = currentLine ? `${currentLine} ${word}` : word;
          }
        });
        if (currentLine) lines.push(currentLine);
        
        lines = lines.map(line => 
          line.length > maxChars ? line.slice(0, maxChars-2) + '..' : line
        );
        
        lines.forEach((line, i) => {
          text.append('tspan')
            .attr('x', -10)
            .attr('dy', i === 0 ? 0 : '1.2em')
            .text(line)
            .append('title')
            .text(genre);
        });
      })
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .style("opacity", 1);

    // Add percentage labels with responsive positioning
    g.selectAll(".percentage-label")
      .data(sortedData)
      .join("text")
      .attr("class", "percentage-label")
      .attr("x", d => x(d.count) + (actualWidth < 400 ? 2 : 5))
      .attr("y", d => (y(d.genre) ?? 0) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("font-size", actualWidth < 400 ? "10px" : "12px")
      .attr("font-weight", "bold")
      .attr("fill", darkMode ? "#fff" : "#4a4a4a")
      .text(d => actualWidth < 400 ? `${Math.round(d.percentage)}%` : `${d.percentage}%`)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100 + 400)
      .style("opacity", 1);

  }, [data, dimensions, darkMode]);

  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1 relative" style={{ marginLeft: dimensions.width < 400 ? '-40px' : '0' }}>
        <svg 
          ref={svgRef} 
          className="w-full h-full"
          style={{ overflow: "visible" }}
        />
      </div>
    </motion.div>
  );
};

export default HorizontalBarChartRelatedGenres;
