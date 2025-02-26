import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TrendIndicator from "./TrendIndicator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type StatusData = {
  status: string;
  usedBy: number;
  trend: "increasing" | "decreasing" | "stable";
};

const columns: ColumnDef<StatusData>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div className="text-left font-medium">{row.getValue("status")}</div>,
  },
  {
    accessorKey: "usedBy",
    header: "Usage Count",
    cell: ({ row }) => <div className="text-left">{row.getValue("usedBy")}</div>,
  },
  {
    accessorKey: "trend",
    header: "Change",
    cell: ({ row }) => (
      <TrendIndicator unit={'%'} value={5} isPositive={row.getValue("trend") === "increasing"} />
    ),
  },
];

const StatusDataTableComponent = ({ data }: { data: StatusData[] }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Set default page size
      },
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between p-4">
        <div className="page-size flex">
        <span className="text-lg font-medium mr-5">Page size</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Page Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getState().pagination.pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="mx-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getState().pagination.pageIndex + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusDataTableComponent;
