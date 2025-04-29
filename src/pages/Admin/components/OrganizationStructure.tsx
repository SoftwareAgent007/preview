import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, X, Check, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Agency, Guild, User } from '@/types/dataTypes';
import { Label } from '@/components/ui/label';

interface AgencyStructureProps {
  agencies: Agency[];
  className?: string;
  isLoading: boolean;
  onAddAgency: (agency: Omit<Agency, 'id' | 'createdAt' | 'updatedAt' | 'owners' | 'agencyGuilds'>) => void;
  onUpdateAgency: (agency: { id: string, name: string, description: string }) => void;
  onDeleteAgency: (agencyId: string) => Promise<boolean>;
  onAssignGuild: (agencyId: string, guildId: string) => void;
  onRemoveGuild: (agencyId: string, guildId: string) => void;
  onAssignUser: (agencyId: string, userId: string) => void;
  onRemoveUser: (userId: string, agencyId: string) => void;
}

const AgencyStructure = ({
  agencies,
  isLoading,
  className,
  onAddAgency,
  onUpdateAgency,
  onDeleteAgency,
  onAssignGuild,
  onRemoveGuild,
  onAssignUser,
  onRemoveUser
}: AgencyStructureProps) => {
  const [editingAgencyId, setEditingAgencyId] = React.useState<string | null>(null);
  const [newAgencyName, setNewAgencyName] = React.useState("");
  const [newAgencyDescription, setNewAgencyDescription] = React.useState("");
  const [isAddAgencyModalOpen, setIsAddAgencyModalOpen] = React.useState(false);
  const [newAgencyData, setNewAgencyData] = React.useState({ name: "", description: "" });
  const [deleteError, setDeleteError] = React.useState<string>("");

  useEffect(() => {
    console.log('agencies',agencies);
  }, [agencies]);

  const handleAddAgency = () => {
    console.log('newAgencyData', newAgencyData);
    onAddAgency({
      name: newAgencyData.name,
      description: newAgencyData.description,
    });
    setIsAddAgencyModalOpen(false);
    setNewAgencyData({ name: "", description: "" });
    toast({
      title: "Agency added",
      description: `Successfully added ${newAgencyData.name}`,
    });
  };

  const handleEditAgency = (agencyId: string, newName: string, newDescription: string) => {
    console.log('agencies',agencies);
    const agency = agencies.find(a => a.id === agencyId);
    if (!agency) return;

    onUpdateAgency({ 
        id: agencyId,
        name: newName,
        description: newDescription
    });
    setEditingAgencyId(null);
    setNewAgencyName("");
    setNewAgencyDescription("");
    toast({
      title: "Agency updated",
      description: "Successfully updated agency name",
    });
  };

  const handleDeleteAgency = async (agencyId: string) => {
    try {
      const success = await onDeleteAgency(agencyId);
      if (success) {
        toast({
          title: "Agency deleted",
          description: "Successfully deleted agency",
        });
      }
    } catch (error) {
      setDeleteError("Cannot delete agency - it has active users or guilds");
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4">Agency Management</h2>
        <Dialog open={isAddAgencyModalOpen} onOpenChange={setIsAddAgencyModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 rounded-md" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Agency
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">Add New Agency</DialogTitle>
              <DialogDescription className="text-gray-500">
                Create a new agency to manage guilds and users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  id="name"
                  value={newAgencyData.name}
                  onChange={(e) => setNewAgencyData({ ...newAgencyData, name: e.target.value })}
                  className="col-span-3 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                />
                <label htmlFor="description" className="text-right text-sm font-medium text-gray-700">
                  Description
                </label>
                <Input
                  id="description"
                  value={newAgencyData.description}
                  onChange={(e) => setNewAgencyData({ ...newAgencyData, description: e.target.value })}
                  className="col-span-3 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200" onClick={handleAddAgency}>Add Agency</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {agencies?.map(agency => (
          <motion.div 
            key={agency.id} 
            className="p-4 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-grow items-center gap-4">
                {editingAgencyId === agency.id ? (
                  <div className="flex items-end gap-3 flex-grow">
                    <div className="flex-1">
                      <Label htmlFor={`agency-name-${agency.id}`} className="text-xs font-medium text-gray-600">
                        Agency Name
                      </Label>
                      <Input
                        id={`agency-name-${agency.id}`}
                        value={newAgencyName}
                        onChange={(e) => setNewAgencyName(e.target.value)}
                        className="h-9 mt-1 text-sm"
                        aria-label="Edit Agency Name"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`agency-desc-${agency.id}`} className="text-xs font-medium text-gray-600">
                        Description
                      </Label>
                      <Input
                        id={`agency-desc-${agency.id}`}
                        value={newAgencyDescription}
                        onChange={(e) => setNewAgencyDescription(e.target.value)}
                        className="h-9 mt-1 text-sm"
                        aria-label="Edit Agency Description"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-green-600 hover:bg-green-100 hover:text-green-700"
                      onClick={() => handleEditAgency(agency.id, newAgencyName, newAgencyDescription)}
                      aria-label="Save Agency Changes"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => setEditingAgencyId(null)}
                      aria-label="Cancel Agency Edit"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-gray-800">{agency.name}</span>
                    <Badge variant="outline" className="text-xs font-medium border-gray-300 text-gray-600">
                      {agency.owners?.length || 0} {agency.owners?.length === 1 ? 'owner' : 'owners'}
                    </Badge>
                    {agency.description && <span className="text-sm text-gray-500 italic ml-2"> - {agency.description}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingAgencyId(agency.id);
                    setNewAgencyName(agency.name);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Agency</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this agency? This action cannot be undone.
                        All associated users and guilds will be affected.
                        {deleteError && (
                          <div className="mt-2 text-red-500">
                            {deleteError}
                          </div>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button variant="destructive" onClick={() => handleDeleteAgency(agency.id)}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Guilds</h4>
                <Droppable droppableId={`agency-guilds-${agency.id}`} type="guild">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[100px] p-2 rounded transition-colors",
                        snapshot.isDraggingOver ? "bg-gray-100 border-2 border-dashed border-gray-300" : "bg-white"
                      )}
                    >
                      {agency.agencyGuilds?.length === 0 && (
                        <div className="text-center text-gray-500">Drop guilds here</div>
                      )}
                      {agency.agencyGuilds?.map((guild, index) => (
                        
                        <Draggable key={guild.id} draggableId={`agency-guilds-${agency.id}-${guild.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "flex items-center justify-between p-2 mb-2 bg-white rounded border transition-shadow",
                                snapshot.isDragging && "shadow-lg"
                              )}
                            >
                                <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <span>{guild.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveGuild(agency.id, guild.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Users</h4>
                <Droppable droppableId={`agency-users-${agency.id}`} type="user">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[100px] p-2 rounded transition-colors",
                        snapshot.isDraggingOver ? "bg-gray-100 border-2 border-dashed border-gray-300" : "bg-white"
                      )}
                    >
                      {agency.owners?.length === 0 && (
                        <div className="text-center text-gray-500">Drop users here</div>
                      )}
                      {agency.owners?.map((user, index) => (
                        <Draggable key={user.id} draggableId={`${user.id}-${user.name}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "flex items-center justify-between p-2 mb-2 bg-white rounded border transition-shadow",
                                snapshot.isDragging && "shadow-lg"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <span>{user.name}</span>
                                <Badge variant="outline" className="ml-2">{user.role}</Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveUser(user.id, agency.id)}
                                disabled={user.role === 'Admin'}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default AgencyStructure;