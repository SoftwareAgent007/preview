import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
  getFilteredRowModel,
  FilterFn,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Loader2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { Badge } from "../ui/badge";
import { KeywordListItemDto } from "@/types/dataTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}

const globalFilterFn: FilterFn<KeywordListItemDto> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return value ? String(value).toLowerCase().includes(String(filterValue).toLowerCase()) : false;
};

interface KeywordsDataTableProps {
  displayedKeywords: KeywordListItemDto[];
  defaultKeywords: KeywordListItemDto[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalKeywords: number;
  totalPages: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onToggleActive: (keyword: KeywordListItemDto) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  getKeywordState: (keyword: KeywordListItemDto) => { isLoading: boolean; active: boolean };
}

const KeywordsDataTable = ({
  displayedKeywords,
  defaultKeywords,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  totalKeywords,
  totalPages,
  pageSize,
  onPageSizeChange,
  onToggleActive,
  onDelete,
  isLoading,
  getKeywordState
}: KeywordsDataTableProps) => {
  const [globalFilter, setGlobalFilter] = React.useState(searchTerm);
  const [keywordToDelete, setKeywordToDelete] = React.useState<KeywordListItemDto | null>(null);
  const [debounceTimeout, setDebounceTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      setSearchTerm(value);
    }, 300);

    setDebounceTimeout(timeout);
  };

  const tableData = React.useMemo(() => {
    return globalFilter ? displayedKeywords : defaultKeywords;
  }, [globalFilter, displayedKeywords, defaultKeywords]);

  const columns: ColumnDef<KeywordListItemDto>[] = [
    {
      accessorKey: "keyword",
      header: ({ column }) => (
        <div className="text-left font-bold">Keyword</div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("keyword")}</div>
      ),
    },
    {
      accessorKey: "matches.count",
      header: ({ column }) => (
        <div className="text-left font-bold">Matches Count</div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.original.matches.count}</div>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <div className="text-left font-bold">Active</div>
      ),
      cell: ({ row }) => (
        <div className="text-left">
          <Badge className={`text-white ${row.original.active ? 'bg-green-500' : 'bg-red-500'}`}>
            {row.original.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="text-left font-bold">Actions</div>
      ),
      cell: ({ row }) => {
        const { isLoading: isKeywordLoading, active } = getKeywordState(row.original);
        
        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              {isKeywordLoading && (
                <div className="absolute mr-2 -right-6 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(row.original)}
                disabled={isKeywordLoading}
                className={`text-gray-500 hover:text-blue-500 transition-opacity ${isKeywordLoading ? 'opacity-50' : ''}`}
              >
                {active ? 
                  <ToggleRight className="w-5 h-5" /> : 
                  <ToggleLeft className="w-5 h-5" />
                }
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setKeywordToDelete(row.original)}
              disabled={isKeywordLoading}
              className="text-gray-500 ml-2 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    state: {
      pagination: {
        pageSize: pageSize,
        pageIndex: currentPage - 1,
      },
      globalFilter,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater(table.getState().pagination);
        onPageSizeChange(newState.pageSize);
      }
    },
    manualPagination: true,
  });

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    table.setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">Keywords List</h2>
          <span className="text-sm text-gray-500">Found keywords: {totalKeywords}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative">
        <Input
          placeholder="Search keywords..."
          value={globalFilter}
          onChange={handleSearchChange}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      <div className="rounded-md border min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border-b"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(pageNum)}
              className="min-w-[32px]"
              disabled={isLoading}
            >
              {pageNum}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
      
      <AlertDialog open={!!keywordToDelete} onOpenChange={() => setKeywordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the keyword "{keywordToDelete?.keyword}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                keywordToDelete && onDelete(keywordToDelete?.id);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KeywordsDataTable;