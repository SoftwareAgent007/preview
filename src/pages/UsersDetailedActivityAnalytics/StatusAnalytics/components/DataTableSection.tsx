import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import StatusDataTableComponent from "@/components/common/StatusDataTable";

interface DataTableSectionProps {
  data: any; // Replace with proper type
}

const DataTableSection = ({ data }: DataTableSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="p-4 md:p-6 w-full">
        <motion.h3 
          className="text-lg font-bold mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          List Of Status Messages
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatusDataTableComponent data={data} />
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default DataTableSection;