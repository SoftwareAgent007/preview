import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertCircle, GripVertical, Loader2, Plus, Trash2, Pencil, User as UserIcon, List
} from "lucide-react";
import { Agency, Guild, PaginationDto, User as UserType } from "@/types/dataTypes";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { cn } from "@/lib/utils";
import ManageUserModal, { MODAL_MODE } from "@/pages/Admin/components/ManageUserModal.tsx";

interface UserManagementTableProps {
    users: UserType[];
    agencies: Agency[];
    guilds: Guild[];
    pagination: PaginationDto;
    isInModal: boolean;
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
    isOpen: boolean;
    mode: MODAL_MODE;
    userData: null | UserType;
}

const UserManagementTable = ({
    users,
    agencies,
    guilds,
    pagination,
    isInModal = false,
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
    const [isFullListModalOpen, setIsFullListModalOpen] = React.useState(false);

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
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
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = React.useMemo<ColumnDef<UserType>[]>(() => [
        {
            id: 'drag-handle',
            header: () => null,
            size: 40,
            cell: () => (
                <div className="flex items-center justify-center">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                </div>
            ),
        },
        {
            id: 'name',
            accessorKey: "name",
            header: "User Name",
            size: 350,
            cell: ({ row }) => {
                const user = row.original;
                return (
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
                return (
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
                return (
                    <Badge variant={user.ownerGuilds?.length > 0 ? "success" : "secondary"} className="whitespace-nowrap">
                        {user.ownerGuilds?.length > 0 ? "Assigned" : "Unassigned"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "agencyId",
            header: "Agency",
            size: 200,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <span className="text-sm text-muted-foreground">
                        {user.role === 'ADMIN' ? 'N/A' : user.agencyId ? agencies.find(a => a.id === user.agencyId)?.name || user.agencyId : 'N/A'}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-2">Actions</div>,
            size: 100,
            cell: ({ row }) => {
                const user = row.original;
                const disableActions = isDeleting || isTableLoading;

                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setModal({isOpen: true, mode: MODAL_MODE.UPDATE, userData: user})}
                            disabled={user.role === 'ADMIN' || disableActions}
                            aria-label="Edit user"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(user)}
                            disabled={user.role === 'ADMIN' || disableActions}
                            aria-label="Delete user"
                            className="text-destructive hover:text-red-700 hover:bg-red-100 h-8 w-8"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ], [isTableLoading, isDeleting, agencies]);

    const limitedUsers = users.slice(0, 10);

    const table = useReactTable({
        data: limitedUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            pagination: {
                pageSize: 10,
                pageIndex: 0,
            },
        },
        manualPagination: true,
    });

    const handleDragEnd = (result: DropResult) => {
        const { destination, source } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const reorderedUsers = Array.from(limitedUsers);
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
                snapshot.isDragging && "bg-gray-100 shadow-md opacity-90"
            )}
            style={{
                ...provided.draggableProps.style,
            }}
        >
            {row.getVisibleCells().map((cell: any) => (
                <TableCell
                    key={cell.id}
                    {...(cell.column.id === 'drag-handle' ? provided.dragHandleProps : {})}
                    style={{ width: cell.column.getSize() }}
                    className="px-3 py-1.5 align-middle h-16"
                >
                    {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                    )}
                </TableCell>
            ))}
        </TableRow>
    );

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    {!isInModal && (<div>
                        <p className="text-sm text-muted-foreground">Full list of users available to view only in modal view</p>
                    </div>)}
                    
                    <div className="flex gap-2">
                        {!isInModal && (
                            <Button
                                onClick={() => setIsFullListModalOpen(true)}
                                disabled={isTableLoading}
                                className="flex items-center gap-1"
                                variant="outline">

                            <List className="h-4 w-4" />
                            View Full List
                        </Button>
                        )}

                        <Button
                            onClick={() => setModal({isOpen: true, mode: MODAL_MODE.CREATE, userData: null})}
                            disabled={isTableLoading}
                            className="flex items-center gap-1 bg-blue-500 text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add User
                        </Button>
                    </div>
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
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">
                                {isDeleting ? 'Deleting...' : 'Loading...'}
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

                <FullUserListModal
                    isOpen={isFullListModalOpen}
                    onClose={() => setIsFullListModalOpen(false)}
                    users={users}
                    agencies={agencies}
                    guilds={guilds}
                    isLoading={isTableLoading}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onCreateUser={onCreateUser}
                    onReorderUsers={onReorderUsers}
                />
            </div>
        </DragDropContext>
    );
};

interface FullUserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: UserType[];
    agencies: Agency[];
    guilds: Guild[];
    isLoading: boolean;
    onDelete: (userId: string) => Promise<boolean>;
    onUpdate: (user: UserType) => Promise<void>;
    onCreateUser: (user: Partial<UserType>) => Promise<void>;
    onReorderUsers: (reorderedUsers: UserType[]) => void;
}

const FullUserListModal: React.FC<FullUserListModalProps> = ({
    isOpen,
    onClose,
    users,
    agencies,
    guilds,
    isLoading,
    onDelete,
    onUpdate,
    onCreateUser,
    onReorderUsers
}) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const paginatedUsers = users.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle><span className="text-2xl font-bold">All Users</span></DialogTitle>
                    <DialogDescription>View and manage all users with pagination.</DialogDescription>
                </DialogHeader>

                <UserManagementTable
                    isInModal={true}
                    users={paginatedUsers}
                    agencies={agencies}
                    guilds={guilds}
                    pagination={{
                        currentPage,
                        totalPages,
                        itemsPerPage,
                        totalItems: users.length
                    }}
                    isLoading={isLoading}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={() => {}} // Not used in modal
                    onToggleActive={() => {}} // Not used in modal
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onCreateUser={onCreateUser}
                    onAssignAgency={() => {}} // Not used in modal
                    onRemoveAgency={() => {}} // Not used in modal
                    onAssignGuild={() => {}} // Not used in modal
                    onRemoveGuild={() => {}} // Not used in modal
                    onRestrictGuilds={() => {}} // Not used in modal
                    onReorderUsers={onReorderUsers}
                />

                {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserManagementTable;