import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import SearchableSelect from "@/components/ui/searchebleSelect";
import StatusHeatmap from "@/components/charts/status/statusHeatmap";

interface HeatmapSectionProps {
  selectedStatus: string;
  setStatus: (status: string) => void;
  activityData: any; // Replace with proper type
  mockerStatuses: { value: string; label: string; }[];
}

const HeatmapSection = ({ selectedStatus, setStatus, activityData, mockerStatuses }: HeatmapSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="p-4 md:p-6 w-full">
        <motion.div 
          className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <motion.span 
              className="text-gray-500 text-lg font-bold"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Status Activity Heatmap
            </motion.span>
            <ClickableTooltip content={
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <strong>Status Activity Heatmap:</strong> Displays the number of statuses selected each day during a week in the season. The background darkens based on the difference in numbers.
              </motion.p>
            }>
              <motion.span 
                className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(209, 213, 219, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                ?
              </motion.span>
            </ClickableTooltip>
          </div>
          <SearchableSelect
            className="w-full md:w-auto"
            options={mockerStatuses}
            placeholder="Select status..."
            value={selectedStatus}
            onChange={setStatus}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatusHeatmap activityData={activityData} />
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default HeatmapSection;