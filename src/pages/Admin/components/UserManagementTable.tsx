import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Pencil, Check, X, User as UserIcon, AlertCircle, GripVertical } from "lucide-react";
import { User as UserType, Agency, Guild, PaginationDto, UserRole } from "@/types/dataTypes";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { cn } from "@/lib/utils";

const userRoles: UserRole[] = ['ADMIN', 'AGENCY_PARTNER', 'CLIENT'];

interface UserManagementTableProps {
  users: UserType[];
  agencies: Agency[];
  guilds: Guild[];
  pagination: PaginationDto;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleActive: (user: UserType) => void;
  onDelete: (userId: string) => Promise<boolean>;
  onUpdate: (user: UserType) => Promise<void>;
  onAssignAgency: (userId: string, agencyId: string) => void;
  onRemoveAgency: (userId: string, agencyId: string) => void;
  onAssignGuild: (userId: string, guildId: string) => void;
  onRemoveGuild: (userId: string, guildId: string) => void;
  onRestrictGuilds: (userId: string, guildIds: string[]) => void;
  onReorderUsers: (reorderedUsers: UserType[]) => void;
}

const UserManagementTable = ({
  users,
  pagination,
  isLoading: isTableLoading,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onUpdate,
  onReorderUsers
}: UserManagementTableProps) => {
  const [userToDelete, setUserToDelete] = React.useState<UserType | null>(null);
  const [editingUser, setEditingUser] = React.useState<UserType | null>(null);
  const [editedValues, setEditedValues] = React.useState<Partial<UserType>>({});
  const [userName, setUserName] = React.useState<string>("");
  const [deleteError, setDeleteError] = React.useState<string>("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleEditStart = (user: UserType) => {
    if (editingUser || isUpdating || isDeleting) return;
    setEditingUser(user);
    setEditedValues({
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (field: keyof UserType, value: any) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editingUser || !editedValues) return;
    setIsUpdating(true);
    try {
      const updatedUser: UserType = {
        ...editingUser,
        ...editedValues,
      };
      await onUpdate(updatedUser);
      setEditingUser(null);
      setEditedValues({});
      toast({
        title: "User updated",
        description: "User details have been successfully updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the user.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditedValues({});
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      const success = await onDelete(userToDelete.id);
      if (success) {
        setUserToDelete(null);
        toast({
          title: "User deleted",
          description: "User has been successfully deleted.",
          variant: "default",
        });
      } else {
        setDeleteError("Cannot delete user. They may be assigned to an agency or have active guilds.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError("An unexpected error occurred while deleting the user.");
      toast({
        title: "Deletion Failed",
        description: "Could not delete the user.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = React.useMemo<ColumnDef<UserType>[]>(() => [
    {
      id: 'drag-handle',
      header: () => null,
      size: 40,
      cell: ({ row }) => {
        const isEditingThisRow = editingUser?.id === row.original.id;
        return (
          <div className="flex items-center justify-center">
          </div>
        );
      },
    },
    {
      id: 'name',
      accessorKey: "name",
      header: "User Name",
      size: 350,
      cell: ({ row }) => {
        const user = row.original;
        const isEditingThisRow = editingUser?.id === user.id;

        return isEditingThisRow ? (
          <div className="flex items-center gap-2">
             <UserIcon className="h-8 w-8 rounded-full flex-shrink-0" />
             <div className="flex-grow min-w-0">
                <Input
                  ref={inputRef}
                  value={userName}
                  onChange={(e) => {
                    e.stopPropagation();
                    setUserName(e.target.value);
                  }}
                  className="h-8 text-sm"
                  aria-label="Edit user name"
                />
                <div className="text-sm text-muted-foreground truncate mt-1">{user.email}</div>
             </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <UserIcon className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 150,
      cell: ({ row }) => {
        const user = row.original;
        const isEditingThisRow = editingUser?.id === user.id;

        return isEditingThisRow ? (
          <Select
            value={editedValues.role ?? ''}
            onValueChange={(value: UserRole) => handleInputChange('role', value)}
            aria-label="Edit user role"
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline" className={cn(
            "whitespace-nowrap font-medium",
            user.role === 'ADMIN' ? 'border-blue-300 bg-blue-50 text-blue-700' :
            user.role === 'AGENCY_PARTNER' ? 'border-green-300 bg-green-50 text-green-700' :
            'border-gray-300 bg-gray-50 text-gray-700'
          )}>
            {user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      size: 120,
      cell: ({ row }) => {
        const user = row.original;
        const isEditingThisRow = editingUser?.id === user.id;

        return isEditingThisRow ? (
           <Select
             value={editedValues.isActive ? 'true' : 'false'}
             onValueChange={(value) => handleInputChange('isActive', value === 'true')}
             aria-label="Edit user status"
           >
             <SelectTrigger className="h-8 text-sm w-[100px]">
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="true">Active</SelectItem>
               <SelectItem value="false">Inactive</SelectItem>
             </SelectContent>
           </Select>
        ) : (
          <Badge variant={user.isActive ? "success" : "secondary"} className="whitespace-nowrap">
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      size: 100,
      cell: ({ row }) => {
        const user = row.original;
        const isEditingThisRow = editingUser?.id === user.id;
        const disableActions = !!editingUser || isUpdating || isDeleting || isTableLoading;

        return (
          <div className="flex items-center justify-end gap-1">
            {isEditingThisRow ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditSave}
                  disabled={isUpdating}
                  className="text-green-600 hover:text-green-700 hover:bg-green-100 h-8 w-8"
                  aria-label="Save changes"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditCancel}
                  disabled={isUpdating}
                  className="text-destructive hover:text-red-700 hover:bg-red-100 h-8 w-8"
                  aria-label="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditStart(user)}
                  disabled={user.role === 'Admin' || disableActions}
                  aria-label="Edit user"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUserToDelete(user)}
                  disabled={user.role === 'Admin' || disableActions}
                  aria-label="Delete user"
                  className="text-destructive hover:text-red-700 hover:bg-red-100 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ], [editingUser, editedValues, handleEditSave, handleEditCancel, handleEditStart, handleInputChange, setUserToDelete, isTableLoading, isUpdating, isDeleting]);

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
    meta: {
        editingUser,
        editedValues,
        handleInputChange,
    }
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const userId = draggableId;

    const reorderedUsers = Array.from(users);
    const [movedUser] = reorderedUsers.splice(source.index, 1);
    reorderedUsers.splice(destination.index, 0, movedUser);

    onReorderUsers(reorderedUsers);
  };

  const renderRow = (row: any, provided: any, snapshot: any) => (
    <TableRow
      ref={provided.innerRef}
      {...provided.draggableProps}
      data-state={row.getIsSelected() && "selected"}
      className={cn(
        "border-b hover:bg-muted/50",
        snapshot.isDragging && "bg-gray-100 shadow-md opacity-90",
        editingUser?.id === row.original.id && "bg-accent/50"
      )}
      style={{
        ...provided.draggableProps.style,
      }}
    >
      {row.getVisibleCells().map((cell: any, cellIndex: number) => (
        <TableCell
          key={cell.id}
          {...(cell.column.id === 'drag-handle' ? provided.dragHandleProps : {})}
          style={{ width: cell.column.getSize() }}
          className="px-3 py-1.5 align-middle h-16"
        >
          {cell.column.id === 'drag-handle' && (
             <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
          )}
          {flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
          )}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
      <div className="flex flex-col">
        <div className="rounded-md border relative overflow-x-auto">
          {(isTableLoading || isUpdating || isDeleting) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                {isUpdating ? 'Updating...' : isDeleting ? 'Deleting...' : 'Loading...'}
              </span>
            </div>
          )}

          <Table className="w-full min-w-[850px]" style={{ tableLayout: 'fixed' }}>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="whitespace-nowrap px-3 py-3 text-sm font-medium text-muted-foreground"
                    >
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
            <Droppable droppableId="users-table" type="user">
              {(provided, snapshot) => (
                <TableBody
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    snapshot.isDraggingOver && "bg-accent"
                  )}
                >
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <Draggable
                        key={row.original.id}
                        draggableId={`${row.original.id}-${row.original.name}`}
                        index={index}
                        isDragDisabled={!!editingUser}
                      >
                        {(provided, snapshot) => renderRow(row, provided, snapshot)}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </div>

        <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
            <Select
              value={pagination.itemsPerPage.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
              disabled={isTableLoading || !!editingUser}
            >
              <SelectTrigger className="w-[75px] h-9">
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

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || isTableLoading || !!editingUser}
                aria-label="Go to previous page"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2 whitespace-nowrap">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || isTableLoading || !!editingUser}
                aria-label="Go to next page"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <AlertDialog open={!!userToDelete} onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setUserToDelete(null);
            setDeleteError("");
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete user <span className="font-medium">{userToDelete?.name}</span>? This action cannot be undone.
                {deleteError && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-destructive bg-red-50 p-3 rounded-md border border-destructive/30">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete User
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default UserManagementTable;