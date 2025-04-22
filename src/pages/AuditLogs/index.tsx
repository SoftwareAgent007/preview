import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/data-rande-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { DateRange } from "react-day-picker";
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  actionType: string;
  targetEntity: string;
  organization: string;
  guild: string;
  oldValue: string;
  newValue: string;
}

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedGuild, setSelectedGuild] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);

  const [mockLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: "2025-03-15 14:30:25",
      user: {
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://github.com/shadcn.png"
      },
      actionType: "Role Update",
      targetEntity: "User",
      organization: "Gaming Division",
      guild: "Gaming Guild",
      oldValue: "User",
      newValue: "Admin"
    },
    {
      id: "2", 
      timestamp: "2025-03-15 13:25:10",
      user: {
        name: "Jane Smith",
        email: "jane@example.com"
      },
      actionType: "Guild Assignment",
      targetEntity: "Guild",
      organization: "Art Division",
      guild: "Art Guild",
      oldValue: "-",
      newValue: "Assigned"
    }
  ]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting report...");
  };

  // Get current logs
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = mockLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <motion.div 
      className="w-full min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <DatePickerWithRange
              value={dateRange}
              onChange={setDateRange}
            />

            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Select Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="gaming">Gaming Division</SelectItem>
                <SelectItem value="art">Art Division</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGuild} onValueChange={setSelectedGuild}>
              <SelectTrigger>
                <SelectValue placeholder="Select Guild" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guilds</SelectItem>
                <SelectItem value="gaming">Gaming Guild</SelectItem>
                <SelectItem value="art">Art Guild</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="role">Role Update</SelectItem>
                <SelectItem value="guild">Guild Assignment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="moderators">Moderators</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Author Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Full Report
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Guild</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.user.avatar} />
                        <AvatarFallback>{log.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{log.user.name}</div>
                        <div className="text-sm text-gray-500">{log.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{log.actionType}</TableCell>
                  <TableCell>{log.targetEntity}</TableCell>
                  <TableCell>{log.organization}</TableCell>
                  <TableCell>{log.guild}</TableCell>
                  <TableCell>{log.oldValue}</TableCell>
                  <TableCell>{log.newValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <div>
              Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, mockLogs.length)} of {mockLogs.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.ceil(mockLogs.length / logsPerPage) }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(mockLogs.length / logsPerPage)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
