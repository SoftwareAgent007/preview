import React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Check, X } from "lucide-react";
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

interface Guild {
  id: string;
  name: string;
  organization: string;
  group: string;
  members: number;
}

interface GuildsManagementProps {
  guilds?: Guild[];
  organizations: string[];
  groups: string[];
  className?: string;
  onUpdate?: (guild: Guild) => void;
  onDelete?: (guildId: string) => void;
}

const GuildsManagement = ({ 
  guilds = [], 
  className="",
  organizations = [], 
  groups = [],
  onUpdate,
  onDelete
}: GuildsManagementProps) => {
  const [editingGuild, setEditingGuild] = React.useState<Guild | null>(null);
  const [editedValues, setEditedValues] = React.useState<Partial<Guild>>({});
  const [guildToDelete, setGuildToDelete] = React.useState<Guild | null>(null);

  const handleEditStart = (guild: Guild) => {
    setEditingGuild(guild);
    setEditedValues(guild);
  };

  const handleEditCancel = () => {
    setEditingGuild(null);
    setEditedValues({});
  };

  const handleEditSave = () => {
    if (editingGuild && editedValues) {
      const updatedGuild = { ...editingGuild, ...editedValues };
      onUpdate?.(updatedGuild);
      setEditingGuild(null);
      setEditedValues({});
      toast({
        title: "Guild updated",
        description: `Successfully updated ${updatedGuild.name}`,
      });
    }
  };

  const handleDelete = (guildId: string) => {
    onDelete?.(guildId);
    setGuildToDelete(null);
    toast({
      title: "Guild deleted",
      description: "Successfully deleted guild",
    });
  };

  const handleInputChange = (field: keyof Guild, value: string) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={cn("p-6", className)}>
      <h3 className="text-xl font-semibold">Guilds Management</h3> 
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Guild Name</TableHead>
              <TableHead className="w-[200px]">Organization</TableHead>
              <TableHead className="w-[150px]">Group</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guilds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No guilds found
                </TableCell>
              </TableRow>
            ) : (
              guilds.map((guild) => (
                <TableRow key={guild.id}>
                  <TableCell>
                    {editingGuild?.id === guild.id ? (
                      <Input
                        value={editedValues.name || guild.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-[200px]"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{guild.name}</span>
                        <Badge variant="outline">{guild.members} members</Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingGuild?.id === guild.id ? (
                      <Select
                        value={editedValues.organization || guild.organization}
                        onValueChange={(value) => handleInputChange("organization", value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org} value={org}>
                              {org}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{guild.organization}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingGuild?.id === guild.id ? (
                      <Select
                        value={editedValues.group || guild.group}
                        onValueChange={(value) => handleInputChange("group", value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{guild.group}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingGuild?.id === guild.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditSave}
                            className="text-green-500 hover:text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditCancel}
                            className="text-red-500 hover:text-red-600"
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
                            className="text-gray-500 hover:text-blue-500"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setGuildToDelete(guild)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!guildToDelete} onOpenChange={() => setGuildToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guild</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {guildToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => guildToDelete && handleDelete(guildToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
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