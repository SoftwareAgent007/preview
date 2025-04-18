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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Pencil, Check, X, User } from "lucide-react";
import { UserType, PaginationDto } from "@/types/dataTypes";
import { motion, AnimatePresence } from "framer-motion";
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

interface UserManagementTableProps {
  users: UserType[];
  pagination: PaginationDto;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleActive: (user: UserType) => void;
  onDelete: (userId: bigint) => void;
  onUpdate: (user: UserType) => void;
}
const UserManagementTable = ({
  users,
  pagination,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onToggleActive,
  onDelete,
  onUpdate
}: UserManagementTableProps) => {
  const [userToDelete, setUserToDelete] = React.useState<UserType | null>(null);
  const [editingUser, setEditingUser] = React.useState<UserType | null>(null);
  const [editedValues, setEditedValues] = React.useState<Partial<UserType>>({});

  const handleEditStart = (user: UserType) => {
    setEditingUser(user);
    setEditedValues(user);
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditedValues({});
  };

  const handleEditSave = () => {
    if (editingUser && editedValues) {
      const updatedUser = { ...editingUser, ...editedValues };
      onUpdate(updatedUser); // Update parent component
      setEditingUser(null);
      setEditedValues({});
    }
  };

  const handleInputChange = (field: keyof UserType, value: string) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
    if (editingUser) {
      onUpdate({ ...editingUser, ...editedValues, [field]: value }); // Update parent component on input change
    }
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-left font-bold w-[250px]">User Name</div>,
      cell: ({ row }) => {
        const isEditing = editingUser?.id === row.original.id;
        return (
          <div className="flex items-center gap-3 w-[250px]">
            {row.original.avatar ? (
              <Avatar>
                <img src={row.original.avatar} alt={row.original.name} className="h-8 w-8 rounded-full" />
              </Avatar>
            ) : (
              <User className="h-8 w-8 rounded-full" />
            )}
            {isEditing ? (
              <Input
                value={editedValues.name || row.original.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-8 w-40"
              />
            ) : (
              <span className="truncate">{row.original.name}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: () => <div className="text-left font-bold w-[150px]">Role</div>,
      cell: ({ row }) => {
        const isEditing = editingUser?.id === row.original.id;
        return (
          <div className="w-[150px]">
            {isEditing ? (
              <Select
                value={editedValues.role || row.original.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Admin", "Moderator", "User"].map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className={`
                ${row.original.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 
                  row.original.role === 'Moderator' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'}
              `}>
                {row.original.role}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "group",
      header: () => <div className="text-left font-bold w-[150px]">Group</div>,
      cell: ({ row }) => {
        const isEditing = editingUser?.id === row.original.id;
        return (
          <div className="flex items-center w-[150px]">
            {isEditing ? (
              <Select
                value={editedValues.group || row.original.group}
                onValueChange={(value) => handleInputChange("group", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Moderators", "Admins", "Users"].map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="truncate max-w-full">{row.original.group}</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "organization",
      header: () => <div className="text-left font-bold w-[200px]">Organization</div>,
      cell: ({ row }) => {
        const isEditing = editingUser?.id === row.original.id;
        return (
          <div className="flex items-center w-[200px]">
            {isEditing ? (
              <Select
                value={editedValues.organization || row.original.organization}
                onValueChange={(value) => handleInputChange("organization", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Gaming Guild", "Art Guild", "Music Guild"].map((org) => (
                    <SelectItem key={org} value={org}>
                      {org}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="truncate max-w-full">{row.original.organization}</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right font-bold pr-5 w-[100px]">Actions</div>,
      cell: ({ row }) => {
        const isEditing = editingUser?.id === row.original.id;
        return (
          <div className="flex items-center justify-end gap-2 w-[100px]">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditSave}
                  className="text-green-500 hover:text-green-600"
                >
                  <Check className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCancel}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={row.original.role === 'Admin'}
                  onClick={() => handleEditStart(row.original)}
                  className="text-gray-500 hover:text-blue-500"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserToDelete(row.original)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageSize: pagination.itemsPerPage,
        pageIndex: pagination.currentPage - 1,
      },
    },
    manualPagination: true,
  });

  return (
    <div className="flex flex-col">
      <div className="rounded-md border relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[850px]">
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
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="h-[300px] text-center text-gray-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence initial={false}>
                  {table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b relative"
                      layout
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="relative">
                          <motion.div
                            layout
                            transition={{ duration: 0.2 }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </motion.div>
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <Select
            value={pagination.itemsPerPage.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {table.getRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={pagination.currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{userToDelete?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                userToDelete && onDelete(userToDelete.id);
                setUserToDelete(null);
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

export default UserManagementTable; 