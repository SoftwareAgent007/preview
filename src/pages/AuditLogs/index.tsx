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
import { Download, ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { useAuditLogs, LogActionType, AdminAction } from '@/hooks/analytics/useAuditLogs';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedActionType, setSelectedActionType] = useState<LogActionType | "all">("all");
  const [selectedTargetType, setSelectedTargetType] = useState<string>("all");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [expandAllDetails, setExpandAllDetails] = useState(false);

  const dateFilters = useMemo(() => {
    if (!dateRange) return {};

    return {
      startDate: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'') : undefined,
      endDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd\'T\'23:59:59\'Z\'') : undefined
    };
  }, [dateRange]);

  const filters = useMemo(() => ({
    page: currentPage,
    perPage,
    actionType: selectedActionType !== "all" ? selectedActionType : undefined,
    targetType: selectedTargetType !== "all" ? selectedTargetType : undefined,
    ownerId: selectedOwnerId !== "all" ? selectedOwnerId : undefined,
    startDate: dateFilters.startDate,
    endDate: dateFilters.endDate
  }), [currentPage, perPage, selectedActionType, selectedTargetType, selectedOwnerId, dateFilters.startDate, dateFilters.endDate]);

  const {
    logs,
    meta,
    isLoading,
    error,
    actionTypes,
    targetTypes,
    admins,
    exportLogs
  } = useAuditLogs(filters);

  const filteredLogs = useMemo(() => {
    if (!logs) return []; 
    if (!searchTerm.trim()) return logs;

    const term = searchTerm.toLowerCase();
    return logs.filter((log: AdminAction) =>
      log.id.toLowerCase().includes(term) ||
      log.targetId.toLowerCase().includes(term) ||
      (log.owner?.name && log.owner.name.toLowerCase().includes(term)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(term))
    );
  }, [logs, searchTerm]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatDetails = (details: Record<string, any> | undefined | null) => {
    if (!details) return "-";
    try {
      if (typeof details === 'string') {
        try {
          const parsed = JSON.parse(details);
          return JSON.stringify(parsed, null, 2);
        } catch (parseError) {
          return details;
        }
      }
      if (typeof details === 'object') {
        return JSON.stringify(details, null, 2);
      }
      return String(details);
    } catch (e) {
      console.error("Error formatting details:", e);
      return "Invalid Details";
    }
  };


  const formatTimestamp = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (isNaN(date.getTime())) {
        return String(timestamp);
      }
      return format(date, 'MMM d, yyyy, h:mm:ss a');
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return String(timestamp);
    }
  };

  const formatActionType = (type: LogActionType | string | undefined) => {
    if (!type) return "Unknown Action";
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-1">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DatePickerWithRange
              value={dateRange as DateRange}
              onChange={(range) => setDateRange(range)}
              className="col-span-1 sm:col-span-2 md:col-span-1"
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
                {actionTypes?.map(type => (
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
                {targetTypes?.map(type => (
                  <SelectItem key={type} value={type}>
                    {type || "N/A"}
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
                {admins && admins.length > 0 && admins.map(admin => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name || `ID: ${admin.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={perPage.toString()}
              onValueChange={(value) => { setPerPage(parseInt(value)); setCurrentPage(1); }}
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
              disabled={isLoading || !logs || logs.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <div className="flex w-full h-full items-center justify-start space-x-2">
              <Checkbox 
                id="expandDetails" 
                checked={expandAllDetails}
                onCheckedChange={(checked) => setExpandAllDetails(checked as boolean)}
              />
              <label 
                htmlFor="expandDetails" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Expand All Details
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading logs...</span>
            </div>
          ) : error?.message ? (
            <div className="text-center py-16 text-destructive">
              Error loading logs: {error.message || "Please try again later."}
            </div>
          ) : !filteredLogs || filteredLogs.length === 0 ? (
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-gray-500">{new Date(log.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</div>
                            <div className="text-md font-bold text-gray-500">
                              {new Date(log.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{log.owner?.name || "Unknown User"}</div>
                            <div className="text-sm text-gray-500">{log.ownerId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatActionType(log.actionType)}</TableCell>
                      <TableCell>{log.targetId || "-"}</TableCell>
                      <TableCell>{log.targetType || "-"}</TableCell>
                      <TableCell className="details">
                        <div className="relative group">
                          {expandAllDetails ? (
                            <div className="p-2 bg-gray-50 rounded text-xs">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                  <span className="font-medium">{key}:</span>{" "}
                                  <span className="text-gray-700">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs px-2 py-1 h-auto"
                              >
                                View Details
                              </Button>
                              <div className="absolute z-50 hidden group-hover:block right-0 w-64 p-2 bg-white border rounded-md shadow-lg">
                                <div className="max-h-60 overflow-auto">
                                  <div className="text-xs p-2 bg-gray-50 rounded">
                                    {Object.entries(log.details).map(([key, value]) => (
                                      <div key={key} className="mb-1">
                                        <span className="font-medium">{key}:</span>{" "}
                                        <span className="text-gray-700">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {meta && meta.total > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    Showing {meta.currentPage > 0 ? (meta.currentPage - 1) * meta.perPage + 1 : 0} to {Math.min(meta.currentPage * meta.perPage, meta.total)} of {meta.total} entries
                  </div>
                  {meta.totalPages > 1 && (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">Prev</span>
                      </Button>
                      {(() => {
                        const totalPages = meta.totalPages;
                        const pageNumbers = [];
                        const maxPagesToShow = 5;

                        if (totalPages <= maxPagesToShow) {
                          for (let i = 1; i <= totalPages; i++) {
                            pageNumbers.push(i);
                          }
                        } else {
                          pageNumbers.push(1);
                          let startPage = Math.max(2, currentPage - 1);
                          let endPage = Math.min(totalPages - 1, currentPage + 1);

                          if (currentPage <= 3) {
                             endPage = 3;
                          } else if (currentPage >= totalPages - 2) {
                             startPage = totalPages - 2;
                          }

                          if (startPage > 2) {
                            pageNumbers.push('...');
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            pageNumbers.push(i);
                          }

                          if (endPage < totalPages - 1) {
                            pageNumbers.push('...');
                          }

                          pageNumbers.push(totalPages);
                        }

                        return pageNumbers.map((pageNum, index) =>
                          typeof pageNum === 'number' ? (
                            <Button
                              key={`page-${pageNum}`}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => paginate(pageNum)}
                              className="w-9 h-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          ) : (
                            <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm">...</span>
                          )
                        );
                      })()}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === meta.totalPages}
                      >
                         <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
