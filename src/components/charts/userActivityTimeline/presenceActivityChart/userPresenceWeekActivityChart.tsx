import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent } from "@/components/ui/card";
import { Expand, Minimize } from "lucide-react";
import ReactDOM from "react-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

// #region Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const selectVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};
// #endregion

const PresenceWeekActivityChart = ({ data }) => {
  const svgRef = useRef();
  const chartRef = useRef(); 
  const [selectedStatus, setSelectedStatus] = useState("all");

  
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(500);

  
  const updateChartDimensions = () => {
    if (chartRef.current) {
      setChartWidth(chartRef.current.offsetWidth * 1.01); 
      setChartHeight(chartRef.current.offsetHeight); 
    }
  };

  useEffect(() => {
    updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);
    return () => window.removeEventListener("resize", updateChartDimensions);
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.day))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(Object.values(d.statusCounts)))])
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => (chartWidth < 768 && d % 2 !== 0 ? "" : d)));

    g.append("g").call(d3.axisLeft(y));

    const line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.day) + x.bandwidth() / 2)
      .y(d => y(d.value));

    
    const tooltip = g.append("g").style("display", "none");
    tooltip.append("rect")
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", 100)
      .attr("height", 40);
    tooltip.append("text")
      .attr("x", 50)
      .attr("y", 20)
      .attr("text-anchor", "middle");

    svg.on("pointermove", (event) => {
      const [xPos] = d3.pointer(event, g.node());
      const day = Math.round(xPos / (width / data.length));
      const closestData = data.find(d => d.day === day);
      if (!closestData) return;
      const statusKey = selectedStatus === "all" ? Object.keys(closestData.statusCounts)[0] : selectedStatus;
      const statusValue = closestData.statusCounts[statusKey];

      tooltip.style("display", "block")
        .attr("transform", `translate(${x(closestData.day) + 10},${y(statusValue) - 10})`);
      tooltip.select("text").text(`${statusKey}: ${statusValue}`);
    });

    Object.keys(data[0].statusCounts).forEach((key, i) => {
      g.append("path")
        .datum(data.map(d => ({ day: d.day, value: d.statusCounts[key] })))
        .attr("fill", "none")
        .attr("stroke", d3.schemeCategory10[i])
        .attr("stroke-width", selectedStatus === "all" || selectedStatus === key ? 2 : 1)
        .attr("opacity", selectedStatus === "all" || selectedStatus === key ? 1 : 0.2)
        .attr("d", line);
    });
  }, [data, selectedStatus, chartWidth, chartHeight]);

  return (
    <motion.div 
      ref={chartRef} 
      className="w-full h-[384px] sm:h-[480px] md:h-[512px] lg:h-[650px] flex flex-col items-left"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={selectVariants}>
        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
          <SelectTrigger className="w-40 hover:scale-[101%] transition-all duration-150">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.keys(data[0].statusCounts).map((key) => (
              <SelectItem key={key} value={key}>{key}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      <motion.svg 
        className="mx-auto" 
        ref={svgRef}
        variants={chartVariants}
      />
    </motion.div>
  );
};

const ExpandablePresenceChart = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    statusCounts: {
      Online: Math.floor(Math.random() * 150),
      Offline: Math.floor(Math.random() * 50),
      Idle: Math.floor(Math.random() * 30),
      DND: Math.floor(Math.random() * 20)
    }
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="flex-1 p-6 hover:scale-[101%] transition-all duration-150">
        <motion.div 
          className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="title">
            <span className="text-gray-500 text-lg font-bold mb-4 mr-5">Presence Activity</span>
            <ClickableTooltip 
              content={
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <strong>User Presence Activity Timeline:</strong> Displays a chart showing varying levels of user activity over a selected timeframe.
                </motion.p>
              }
            >
              <motion.span 
                className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(209, 213, 219, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                ?
              </motion.span>
            </ClickableTooltip>
          </div>
          <motion.button 
            onClick={() => setIsModalOpen(true)} 
            className="p-1 rounded-full hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Expand className="text-gray-500" />
          </motion.button>
        </motion.div>
        <PresenceWeekActivityChart data={data} />
      </Card>

      <AnimatePresence>
        {isModalOpen && <Modal closeModal={() => setIsModalOpen(false)} data={data} />}
      </AnimatePresence>
    </motion.div>
  );
};


const Modal = ({ closeModal, data }) => {
  const handleOutsideClick = (event) => {
    const target = event.target;
    if (target.closest('.modal-content') === null) {
      closeModal();
    }
  };

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={closeModal}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className="bg-white p-6 rounded-lg shadow-xl relative modal-content max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2 
            className="text-gray-500 text-xl font-bold"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Presence Activity Timeline
          </motion.h2>
          <motion.button
            whileHover={{ 
              scale: 1.1,
              backgroundColor: "rgba(243, 244, 246, 1)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={closeModal}
            className="p-2 rounded-full"
          >
            <Minimize className="text-gray-500 w-5 h-5" />
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PresenceWeekActivityChart data={data} />
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ExpandablePresenceChart;
