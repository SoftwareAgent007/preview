import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, X, Check } from "lucide-react";
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

interface SubOrganization {
  id: string;
  name: string;
  members: number;
}

interface Organization {
  id: string;
  name: string;
  members: number;
  expanded: boolean;
  subOrganizations: SubOrganization[];
}

interface OrganizationStructureProps {
  organizations: Organization[];
  className?: string;
  isLoading: boolean;
}

const OrganizationStructure = ({ organizations: initialOrganizations, isLoading, className }: OrganizationStructureProps) => {
  const [organizations, setOrganizations] = React.useState<Organization[]>(initialOrganizations || []);
  const [editingOrgId, setEditingOrgId] = React.useState<string | null>(null);
  const [editingSubOrgId, setEditingSubOrgId] = React.useState<string | null>(null);
  const [newOrgName, setNewOrgName] = React.useState("");
  const [newSubOrgName, setNewSubOrgName] = React.useState("");
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = React.useState(false);
  const [selectedOrgForSubOrg, setSelectedOrgForSubOrg] = React.useState<string | null>(null);
  const [newOrgData, setNewOrgData] = React.useState({ name: "", members: 0 });
  const [newSubOrgData, setNewSubOrgData] = React.useState({ name: "", members: 0 });

  const toggleOrgExpansion = (orgId: string) => {
    setOrganizations(orgs => orgs.map(org => 
      org.id === orgId ? { ...org, expanded: !org.expanded } : org
    ));
  };

  const handleAddOrg = () => {
    const newOrg: Organization = {
      id: Date.now().toString(),
      name: newOrgData.name,
      members: newOrgData.members,
      expanded: true,
      subOrganizations: []
    };
    setOrganizations(prev => [...prev, newOrg]);
    setIsAddOrgModalOpen(false);
    setNewOrgData({ name: "", members: 0 });
    toast({
      title: "Organization added",
      description: `Successfully added ${newOrgData.name}`,
    });
  };

  const handleAddSubOrg = (orgId: string) => {
    const newSubOrg: SubOrganization = {
      id: Date.now().toString(),
      name: newSubOrgData.name,
      members: newSubOrgData.members
    };
    setOrganizations(orgs => orgs.map(org => {
      if (org.id === orgId) {
        return {
          ...org,
          subOrganizations: [...org.subOrganizations, newSubOrg],
          expanded: true
        };
      }
      return org;
    }));
    setSelectedOrgForSubOrg(null);
    setNewSubOrgData({ name: "", members: 0 });
    toast({
      title: "Sub-organization added",
      description: `Successfully added ${newSubOrgData.name}`,
    });
  };

  const handleEditOrg = (orgId: string, newName: string) => {
    setOrganizations(orgs => orgs.map(org => 
      org.id === orgId ? { ...org, name: newName } : org
    ));
    setEditingOrgId(null);
    setNewOrgName("");
    toast({
      title: "Organization updated",
      description: `Successfully updated organization name`,
    });
  };

  const handleEditSubOrg = (orgId: string, subOrgId: string, newName: string) => {
    setOrganizations(orgs => orgs.map(org => {
      if (org.id === orgId) {
        return {
          ...org,
          subOrganizations: org.subOrganizations.map(subOrg =>
            subOrg.id === subOrgId ? { ...subOrg, name: newName } : subOrg
          )
        };
      }
      return org;
    }));
    setEditingSubOrgId(null);
    setNewSubOrgName("");
    toast({
      title: "Sub-organization updated",
      description: `Successfully updated sub-organization name`,
    });
  };

  const handleDeleteOrg = (orgId: string) => {
    setOrganizations(orgs => orgs.filter(org => org.id !== orgId));
    toast({
      title: "Organization deleted",
      description: "Successfully deleted organization",
    });
  };

  const handleDeleteSubOrg = (orgId: string, subOrgId: string) => {
    setOrganizations(orgs => orgs.map(org => {
      if (org.id === orgId) {
        return {
          ...org,
          subOrganizations: org.subOrganizations.filter(subOrg => subOrg.id !== subOrgId)
        };
      }
      return org;
    }));
    toast({
      title: "Sub-organization deleted",
      description: "Successfully deleted sub-organization",
    });
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Organization Structure</h3>
        <Dialog open={isAddOrgModalOpen} onOpenChange={setIsAddOrgModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Organization</DialogTitle>
              <DialogDescription>
                Create a new organization to manage sub-organizations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={newOrgData.name}
                  onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="members" className="text-right">
                  Members
                </label>
                <Input
                  id="members"
                  type="number"
                  value={newOrgData.members}
                  onChange={(e) => setNewOrgData({ ...newOrgData, members: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddOrg}>Add Organization</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {organizations.map(org => (
          <motion.div key={org.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleOrgExpansion(org.id)}>
                  {org.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {editingOrgId === org.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-[200px]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOrg(org.id, newOrgName)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingOrgId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-semibold">{org.name}</span>
                )}
                <Badge variant="secondary">{org.members} members</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedOrgForSubOrg(org.id);
                    setNewSubOrgData({ name: "", members: 0 });
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingOrgId(org.id);
                    setNewOrgName(org.name);
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
                      <DialogTitle>Delete Organization</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this organization? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button variant="destructive" onClick={() => handleDeleteOrg(org.id)}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <AnimatePresence>
              {org.expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-6 mt-2 space-y-2"
                >
                  {org.subOrganizations.map(subOrg => (
                    <div
                      key={subOrg.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      {editingSubOrgId === subOrg.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newSubOrgName}
                            onChange={(e) => setNewSubOrgName(e.target.value)}
                            className="w-[200px]"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSubOrg(org.id, subOrg.id, newSubOrgName)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSubOrgId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{subOrg.name}</span>
                          <Badge variant="secondary">{subOrg.members} members</Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSubOrgId(subOrg.id);
                            setNewSubOrgName(subOrg.name);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubOrg(org.id, subOrg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {selectedOrgForSubOrg === org.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="grid gap-4">
                        <div className="grid grid-cols-6 gap-4">
                          <Input
                            className="col-span-4"
                            placeholder="Sub-organization name"
                            value={newSubOrgData.name}
                            onChange={(e) => setNewSubOrgData({ ...newSubOrgData, name: e.target.value })}
                          />
                          <Button
                            className="col-span-1"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrgForSubOrg(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="col-span-1"
                            size="sm"
                            onClick={() => handleAddSubOrg(org.id)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default OrganizationStructure; 