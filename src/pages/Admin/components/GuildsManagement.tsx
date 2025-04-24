import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Removed Select imports as they are no longer used here
import { Pencil, Trash2, Check, X, AlertCircle, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
import { cn } from '@/lib/utils';
import { Agency, Guild } from '@/types/dataTypes';

interface GuildsManagementProps {
  guilds: (Guild & { _dragId?: string })[];
  agencies: Agency[];
  className?: string;
  onUpdate: (guild: Guild) => void;
  onDelete: (guildId: string) => Promise<boolean>;
  // These props might be used by drag-and-drop logic in the parent, keep them for now
  onAssignToAgency: (guildId: string, agencyId: string) => void;
  onRemoveFromAgency: (guildId: string, agencyId: string) => void;
}

const GuildsManagement = ({
  guilds = [],
  agencies = [],
  className = "",
  onUpdate,
  onDelete,
  onAssignToAgency, // Kept prop, might be used elsewhere
  onRemoveFromAgency // Kept prop, might be used elsewhere
}: GuildsManagementProps) => {
  const [editingGuild, setEditingGuild] = React.useState<Guild | null>(null);
  const [editedValues, setEditedValues] = React.useState<Partial<Guild>>({});
  const [guildToDelete, setGuildToDelete] = React.useState<Guild | null>(null);
  const [deleteError, setDeleteError] = React.useState<string>("");

  // Calculate usage count for each guild (how many agencies it's assigned to)
  const guildUsageCount = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    agencies.forEach(agency => {
      agency.agencyGuilds?.forEach(guild => {
        counts[guild.id] = (counts[guild.id] || 0) + 1;
      });
    });
    
    return counts;
  }, [agencies]);

  const handleEditStart = (guild: Guild) => {
    setEditingGuild(guild);
    // Initialize editedValues with current guild name; agency is not editable here anymore
    setEditedValues({ name: guild.name });
  };

  const handleEditCancel = () => {
    setEditingGuild(null);
    setEditedValues({});
  };

  const handleEditSave = () => {
    if (editingGuild && editedValues.name) { // Only save if name is present
      // Only update fields that were editable (name in this case)
      const updatedGuild = { ...editingGuild, name: editedValues.name };
      onUpdate(updatedGuild);
      setEditingGuild(null);
      setEditedValues({});
      toast({
        title: "Guild updated",
        description: `Successfully updated ${updatedGuild.name}`,
      });
    } else if (editingGuild) {
      // If name is empty or undefined, treat as cancel
      handleEditCancel();
      toast({
        title: "Update cancelled",
        description: "Guild name cannot be empty.",
        variant: "destructive"
      })
    }
  };

  const handleDelete = async (guild: Guild) => {
    try {
      const success = await onDelete(guild.id);
      if (success) {
        setGuildToDelete(null);
        toast({
          title: "Guild deleted",
          description: "Successfully deleted guild",
        });
      }
    } catch (error) {
        // Assuming error is an object with a message property
        const errorMessage = error instanceof Error ? error.message : "Cannot delete guild - it may have active clients or partners";
        setDeleteError(errorMessage);
        // Keep the dialog open by not setting guildToDelete to null here
    }
  };

  const handleAssignToAgency = (guildId: string, agencyId: string) => {
    // Ensure the guild is not already assigned to the agency
    const targetAgency = agencies.find(a => a.id === agencyId);
    if (targetAgency && !targetAgency.agencyGuilds.some(g => g.id === guildId)) {
      onAssignToAgency(guildId, agencyId);
    }
  };

  const handleRemoveFromAgency = (guildId: string, agencyId: string) => {
    onRemoveFromAgency(guildId, agencyId);
  };

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-xl font-semibold mb-4">Guilds Management</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Guild Name</TableHead>
              <TableHead className="w-[150px]">Agency Usage</TableHead>
              <TableHead className="w-[100px]">Members</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {/* Assuming DragDropContext is provided by a parent component */}
          <Droppable droppableId="guilds-table" type="guild">
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {guilds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No guilds found
                    </TableCell>
                  </TableRow>
                ) : (
                  guilds.map((guild, index) => {
                    // Get usage count for this guild
                    const usageCount = guildUsageCount[guild.id] || 0;
                    
                    return (
                      <Draggable key={guild.id} draggableId={guild.id} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "border-b",
                              snapshot.isDragging && "bg-gray-50 cursor-grabbing"
                            )}
                          >
                            <TableCell {...provided.dragHandleProps}>
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                {editingGuild?.id === guild.id ? (
                                  <Input
                                    value={editedValues.name ?? ''} // Use ?? '' for controlled input
                                    onChange={(e) => setEditedValues(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-[200px]"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditSave();
                                      if (e.key === 'Escape') handleEditCancel();
                                    }}
                                  />
                                ) : (
                                  <span>{guild.name}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {usageCount > 0 ? (
                                <Badge variant="secondary">
                                  {usageCount} {usageCount === 1 ? 'agency' : 'agencies'}
                                </Badge>
                              ) : (
                                <span className="text-gray-500 italic">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {/* Assuming guild.members exists and is an array */}
                              <Badge variant="outline">{guild.members?.length ?? 0} members</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1"> {/* Reduced gap */}
                                {editingGuild?.id === guild.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleEditSave}
                                      className="text-green-600 hover:text-green-700"
                                      disabled={!editedValues.name} // Disable save if name is empty
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleEditCancel}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditStart(guild)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setDeleteError(""); // Clear previous error on open
                                        setGuildToDelete(guild);
                                      }}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    );
                  })
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </div>

      <AlertDialog open={!!guildToDelete} onOpenChange={(open) => {
        if (!open) {
          setGuildToDelete(null);
          setDeleteError(""); // Clear error when dialog is closed
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guild</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{guildToDelete?.name}"? This action cannot be undone.
              {deleteError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteError("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Prevent dialog closing immediately if delete fails
                e.preventDefault();
                if (guildToDelete) {
                  handleDelete(guildToDelete);
                }
              }}
              className={cn(
                "bg-red-600 hover:bg-red-700 text-white",
                deleteError && "bg-red-400 hover:bg-red-500" // Indicate error state slightly
              )}
              disabled={!!deleteError} // Optionally disable delete button if there's an error shown
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default GuildsManagement;