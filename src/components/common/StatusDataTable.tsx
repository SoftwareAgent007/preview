import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TrendIndicator from "./TrendIndicator";

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
    </div>
  );
};

export default StatusDataTableComponent;
