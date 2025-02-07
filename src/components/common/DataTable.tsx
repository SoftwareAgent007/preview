import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Keyword = {
  id: bigint;
  keyword: string;
  volume: number;
  createdAt: Date;
  active: boolean;
  guildId: bigint;
};

const columns: ColumnDef<Keyword>[] = [
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
    accessorKey: "volume",
    header: ({ column }) => (
      <div className="text-left font-bold">Volume</div>
    ),
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("volume")}</div>
    ),
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="text-left font-bold">Actions</div>
    ),
    cell: ({ row }) => (
      <Button variant="link" className="text-red-500 p-0">
        Delete
      </Button>
    ),
  },
];

// Sample data for demonstration
const sampleKeywords: Keyword[] = [
  {
    id: BigInt(1),
    keyword: "react",
    volume: 1000,
    createdAt: new Date(),
    active: true,
    guildId: BigInt(1),
  },
  {
    id: BigInt(2),
    keyword: "typescript",
    volume: 800,
    createdAt: new Date(),
    active: true,
    guildId: BigInt(1),
  },
  {
    id: BigInt(3),
    keyword: "nextjs",
    volume: 600,
    createdAt: new Date(),
    active: true,
    guildId: BigInt(1),
  },
];

const DataTableComponent = ({
  displayedKeywords = sampleKeywords,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  totalPages,
}: {
  displayedKeywords?: Keyword[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}) => {
  const table = useReactTable({
    data: displayedKeywords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-bold mb-4">Keywords List</h2>
      <Input
        type="text"
        placeholder="Search keywords..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
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
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DataTableComponent;