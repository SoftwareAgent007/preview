import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/data-rande-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { DateRange } from "react-day-picker";
import { Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuditLogs, LogActionType, AdminAction } from '@/hooks/analytics/useAuditLogs';
import { format } from 'date-fns';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedActionType, setSelectedActionType] = useState<LogActionType | "all">("all");
  const [selectedTargetType, setSelectedTargetType] = useState<string>("all");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Convert date range to ISO strings for the API
  const dateFilters = useMemo(() => {
    if (!dateRange) return {};
    
    return {
      startDate: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'') : undefined,
      endDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd\'T\'23:59:59\'Z\'') : undefined
    };
  }, [dateRange]);

  // Build filters object for the useAuditLogs hook
  const filters = useMemo(() => ({
    page: currentPage,
    perPage,
    actionType: selectedActionType !== "all" ? selectedActionType : undefined,
    targetType: selectedTargetType !== "all" ? selectedTargetType : undefined,
    ownerId: selectedOwnerId !== "all" ? selectedOwnerId : undefined,
    ...dateFilters
  }), [currentPage, perPage, selectedActionType, selectedTargetType, selectedOwnerId, dateFilters]);

  // Use the hook with our filters
  const {
    logs,
    meta,
    isLoading,
    error,
    refetch,
    actionTypes,
    targetTypes,
    admins,
    exportLogs
  } = useAuditLogs(filters);

  // Helper function to get admin name by ID
  const getAdminName = (id: string) => {
    const admin = admins.find(a => a.id === id);
    return admin ? admin.name : "Unknown";
  };

  // Handle search filter
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    
    const term = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.id.toLowerCase().includes(term) ||
      log.targetId.toLowerCase().includes(term) ||
      log.ownerName.toLowerCase().includes(term) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(term))
    );
  }, [logs, searchTerm]);

  // Handle pagination change
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Format details object for display
  const formatDetails = (details: Record<string, any> | undefined) => {
    if (!details) return "-";
    try {
      return JSON.stringify(details, null, 2);
    } catch (e) {
      return "-";
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return timestamp;
    }
  };

  // Format action type for display (convert SNAKE_CASE to Title Case)
  const formatActionType = (type: LogActionType) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <motion.div 
      className="w-full min-h-screen bg-gray-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <DatePickerWithRange
              value={dateRange as DateRange}
              onChange={(range) => setDateRange(range)}
            />

            <Select 
              value={selectedActionType} 
              onValueChange={(value) => setSelectedActionType(value as LogActionType | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {formatActionType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedTargetType} 
              onValueChange={setSelectedTargetType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Target Types</SelectItem>
                {targetTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedOwnerId} 
              onValueChange={setSelectedOwnerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {admins.map(admin => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={perPage.toString()} 
              onValueChange={(value) => setPerPage(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={exportLogs}
            >
              <Download className="h-4 w-4" />
              Export Full Report
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading logs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-destructive">
              Error loading logs. Please try again later.
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No logs found matching your criteria.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead>Target Type</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{log.ownerName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{log.ownerName}</div>
                            <div className="text-sm text-gray-500">{log.ownerId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatActionType(log.actionType)}</TableCell>
                      <TableCell>{log.targetId}</TableCell>
                      <TableCell>{log.targetType}</TableCell>
                      <TableCell>
                        <pre className="text-xs whitespace-pre-wrap max-w-[200px] overflow-hidden text-ellipsis">
                          {formatDetails(log.details)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  Showing {meta.page > 0 ? (meta.page - 1) * meta.perPage + 1 : 0} to {Math.min(meta.page * meta.perPage, meta.total)} of {meta.total} entries
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
                  {meta.totalPages <= 7 ? (
                    // Show all pages if 7 or fewer
                    Array.from({ length: meta.totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))
                  ) : (
                    // Show ellipsis for many pages
                    <>
                      <Button
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(1)}
                      >
                        1
                      </Button>
                      
                      {currentPage > 3 && <span>...</span>}
                      
                      {Array.from(
                        { length: Math.min(3, meta.totalPages) },
                        (_, i) => {
                          const pageNum = Math.max(
                            2,
                            Math.min(
                              currentPage - 1 + i,
                              meta.totalPages - 1
                            )
                          );
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => paginate(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                      
                      {currentPage < meta.totalPages - 2 && <span>...</span>}
                      
                      <Button
                        variant={currentPage === meta.totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(meta.totalPages)}
                      >
                        {meta.totalPages}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === meta.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
