import React from 'react';
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

interface AgencyStructureProps {
  agencies: Agency[];
  className?: string;
  isLoading: boolean;
  onAddAgency: (agency: Omit<Agency, 'id'>) => void;
  onUpdateAgency: (agency: Agency) => void;
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
  const [isAddAgencyModalOpen, setIsAddAgencyModalOpen] = React.useState(false);
  const [newAgencyData, setNewAgencyData] = React.useState({ name: "" });
  const [deleteError, setDeleteError] = React.useState<string>("");

  const handleAddAgency = () => {
    onAddAgency({
      name: newAgencyData.name,
      members: [],
      guilds: [],
      users: []
    });
    setIsAddAgencyModalOpen(false);
    setNewAgencyData({ name: "" });
    toast({
      title: "Agency added",
      description: `Successfully added ${newAgencyData.name}`,
    });
  };

  const handleEditAgency = (agencyId: string, newName: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    if (!agency) return;

    onUpdateAgency({ ...agency, name: newName });
    setEditingAgencyId(null);
    setNewAgencyName("");
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
        <h3 className="text-xl font-semibold">Agency Structure</h3>
        <Dialog open={isAddAgencyModalOpen} onOpenChange={setIsAddAgencyModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 hover:text-white text-white text-sm font-normal" variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Agency
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Agency</DialogTitle>
              <DialogDescription>
                Create a new agency to manage guilds and users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={newAgencyData.name}
                  onChange={(e) => setNewAgencyData({ ...newAgencyData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-normal" type="submit" onClick={handleAddAgency}>Add Agency</Button>
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
              <div className="flex items-center gap-2">
                {editingAgencyId === agency.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newAgencyName}
                      onChange={(e) => setNewAgencyName(e.target.value)}
                      className="w-[200px]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAgency(agency.id, newAgencyName)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAgencyId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold">{agency.name}</span>
                    <Badge variant="secondary">{agency.users.length} members</Badge>
                  </>
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
                      {agency.guilds?.map((guild, index) => (
                        <Draggable key={guild.id}  draggableId={`${guild.id}-${guild.name}`} index={index}>
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
                      {agency.users?.map((user, index) => (
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