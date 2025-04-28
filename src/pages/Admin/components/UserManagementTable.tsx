import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AlertCircle, GripVertical, Loader2, Plus, Trash2, Pencil, User as UserIcon} from "lucide-react";
import {Agency, Guild, PaginationDto, User as UserType} from "@/types/dataTypes";
import {toast} from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {Draggable, Droppable} from 'react-beautiful-dnd';
import {cn} from "@/lib/utils";
import ManageUserModal, {MODAL_MODE} from "@/pages/Admin/components/ManageUserModal.tsx";

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
  onCreateUser: (user: Partial<UserType>) => Promise<void>;
  onAssignAgency: (userId: string, agencyId: string) => void;
  onRemoveAgency: (userId: string, agencyId: string) => void;
  onAssignGuild: (userId: string, guildId: string) => void;
  onRemoveGuild: (userId: string, guildId: string) => void;
  onRestrictGuilds: (userId: string, guildIds: string[]) => void;
  onReorderUsers: (reorderedUsers: UserType[]) => void;
}

type ModalState = {
    isOpen: boolean,
    mode: MODAL_MODE
    userData: null | UserType
}

const UserManagementTable = ({
  users,
  agencies,
  pagination,
  isLoading: isTableLoading,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onUpdate,
  onCreateUser,
  onReorderUsers
}: UserManagementTableProps) => {

  const [modal, setModal] = React.useState<ModalState>({
      isOpen: false,
      mode: MODAL_MODE.CREATE,
      userData: null,
  });

  const [userToDelete, setUserToDelete] = React.useState<UserType | null>(null);
  const [deleteError, setDeleteError] = React.useState<string>("");
  const [isDeleting, setIsDeleting] = React.useState(false);


  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await onDelete(userToDelete.id);
      setUserToDelete(null);
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred while deleting the user.";
      setDeleteError(errorMessage);
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

    const columns = React.useMemo<ColumnDef<UserType>[]>(() => [
        {
            id: 'drag-handle',
            header: () => null,
            size: 40,
            cell: ({row}) => {
                return (
                    <div className="flex items-center justify-center"></div>
                );
            },
        },
        {
            id: 'name',
            accessorKey: "name",
            header: "User Name",
            size: 350,
            cell: ({row}) => {
                const user = row.original;
                   return <div className="flex items-center gap-2">
                        <UserIcon className="h-8 w-8 rounded-full flex-shrink-0"/>
                        <div className="flex-grow min-w-0">
                            <div className="font-medium truncate">{user.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                        </div>
                    </div>
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            size: 150,
            cell: ({row}) => {
                const user = row.original;
                  return (<Badge variant="outline" className={cn(
                        "whitespace-nowrap font-medium",
                        user.role === 'ADMIN' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                            user.role === 'AGENCY_PARTNER' ? 'border-green-300 bg-green-50 text-green-700' :
                                'border-gray-300 bg-gray-50 text-gray-700'
                    )}>
                        {user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                    </Badge>)
            },
        },
        {
            accessorKey: "isActive",
            header: "Status",
            size: 120,
            cell: ({row}) => {
                const user = row.original;

                return (
                    <Badge variant={user.ownerGuilds.length > 0 ? "success" : "secondary"}
                           className="whitespace-nowrap">
                        {user.ownerGuilds.length > 0 ? "Assigned" : "Unassigned"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "agencyId",
            header: "Agency",
            size: 200,
            cell: ({row}) => {
                const user = row.original;

                return (<span className="text-sm text-muted-foreground">
                        {user.role === 'ADMIN' ? 'N/A' : user.agencyId ? agencies.find(a => a.id === user.agencyId)?.name || user.agencyId : 'N/A'}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-2">Actions</div>,
            size: 100,
            cell: ({row}) => {
                const user = row.original;
                const disableActions = isDeleting || isTableLoading;

                return (
                    <div className="flex items-center justify-end gap-1">
                        <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setModal({isOpen: true, mode: MODAL_MODE.UPDATE, userData: user})}
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
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </>
                    </div>
                );
            },
        },
    ], [ setUserToDelete, isTableLoading, isDeleting, agencies]);

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
    const renderRow = (row: any, provided: any, snapshot: any) => (
        <TableRow
            ref={provided.innerRef}
            {...provided.draggableProps}
            data-state={row.getIsSelected() && "selected"}
            className={cn(
                "border-b hover:bg-muted/50",
                snapshot.isDragging && "bg-gray-100 shadow-md opacity-90",
            )}
            style={{
                ...provided.draggableProps.style,
            }}
        >
            {row.getVisibleCells().map((cell: any, cellIndex: number) => (
                <TableCell
                    key={cell.id}
                    {...(cell.column.id === 'drag-handle' ? provided.dragHandleProps : {})}
                    style={{width: cell.column.getSize()}}
                    className="px-3 py-1.5 align-middle h-16"
                >
                    {cell.column.id === 'drag-handle' && (
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab"/>
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <Button
                    onClick={() => setModal({
                        mode: MODAL_MODE.CREATE,
                        isOpen: true,
                        userData: null,
                    })}
                    disabled={isTableLoading}
                    className="flex items-center gap-1 bg-blue-500 text-white"
                >
                    <Plus className="h-4 w-4"/>
                    Add User
                </Button>
            </div>

            <ManageUserModal
                {...modal}
                agencies={agencies}
                onUpdate={onUpdate}
                onClose={() => setModal({
                    ...modal,
                    isOpen: false,
                    userData: null,
                })}
                onCreate={onCreateUser}
            />

            <div className="rounded-md border relative overflow-x-auto">
                {(isTableLoading || isDeleting) && (
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                        <span className="ml-2 text-sm text-muted-foreground">
                {isDeleting ? 'Deleting...' : 'Loading...'}
              </span>
                    </div>
                )}

                <Table className="w-full min-w-[850px]" style={{tableLayout: 'fixed'}}>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{width: header.getSize()}}
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
                        disabled={isTableLoading}
                    >
                        <SelectTrigger className="w-[75px] h-9">
                            <SelectValue/>
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
                            disabled={pagination.currentPage === 1 || isTableLoading }
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
                            disabled={pagination.currentPage === pagination.totalPages || isTableLoading}
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
                            Are you sure you want to delete user <span
                            className="font-medium">{userToDelete?.name}</span>? This action cannot be undone.
                            {deleteError && (
                                <div
                                    className="mt-3 flex items-start gap-2 text-sm text-destructive bg-red-50 p-3 rounded-md border border-destructive/30">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0"/>
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
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                            Delete User
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UserManagementTable;