import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminData } from "@/hooks/admin/useAdminData";
import { toast } from "@/hooks/use-toast";
import { UserType } from "@/types/dataTypes";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronRight, Edit, GripVertical, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { DragDropContext, Draggable, DraggableProvided, DraggableStateSnapshot, Droppable, DroppableProvided, DropResult } from "react-beautiful-dnd";
import GuildsManagement from "./components/GuildsManagement";
import OrganizationStructure from "./components/OrganizationStructure";
import UserManagementTable from "./components/UserManagementTable";

interface Guild {
  id: string;
  name: string;
  organization: string;
  group: string;
  members: number;
}

interface Group {
  id: string;
  name: string;
  members: number;
  expanded: boolean;
  guilds: Guild[];
}

const AdminPanel = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [selectedRole, setSelectedRole] = useState<string>("All Roles");
	const [selectedGroup, setSelectedGroup] = useState<string>("All Groups");
	const [selectedOrg, setSelectedOrg] = useState<string>("All Organizations");
	const [selectedGuild, setSelectedGuild] = useState<string>("");
	const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
	const [newGroupName, setNewGroupName] = useState<string>("");
	const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
	const [newGroupData, setNewGroupData] = useState({ name: "", members: 0 });
	const [mockUsers, setMockUsers] = useState<UserType[]>([
		{ 
			id: BigInt(1), 
			name: "John Doe", 
			email: "john@example.com", 
			avatar: "https://static.vecteezy.com/system/resources/previews/024/183/525/non_2x/avatar-of-a-man-portrait-of-a-young-guy-illustration-of-male-character-in-modern-color-style-vector.jpg", 
			role: "Admin", 
			status: "Active", 
			group: "Moderators", 
			organization: "Gaming Guild" 
		},
		{ 
			id: BigInt(2), 
			name: "Jane Smith", 
			email: "jane@example.com", 
			role: "User", 
			status: "Inactive", 
			group: "Admins", 
			organization: "Art Guild" 
		},
		{ 
			id: BigInt(3), 
			name: "Bob Wilson", 
			email: "bob@example.com", 
			role: "Moderator", 
			status: "Active", 
			group: "Moderators", 
			organization: "Music Guild" 
		}
	]);
	const [guildGroups, setGuildGroups] = useState<Group[]>([
		{ id: "1", name: "Moderators", members: 12, expanded: false, guilds: [] },
		{ id: "2", name: "Admins", members: 5, expanded: false, guilds: [] },
		{ id: "3", name: "Users", members: 150, expanded: false, guilds: [] }
	]);
	const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([
		{ id: "1", name: "Gaming Guild", organization: "Gaming Division", group: "Moderators", members: 500 },
		{ id: "2", name: "Art Guild", organization: "Art Division", group: "Admins", members: 250 },
		{ id: "3", name: "Music Guild", organization: "Music Division", group: "Users", members: 300 }
	]);
	const [organizations, setOrganizations] = useState([
		{
			id: "1",
			name: "Gaming Division",
			members: 750,
			expanded: true,
			subOrganizations: [
				{ id: "1-1", name: "Gaming organizations", members: 500 },
				{ id: "1-2", name: "Esports Team", members: 250 },
			]
		},
		{
			id: "2",
			name: "Art Division",
			members: 400,
			expanded: true,
			subOrganizations: [
				{ id: "2-1", name: "Art organizations", members: 250 },
				{ id: "2-2", name: "Design Team", members: 150 },
			]
		},
		{
			id: "3",
			name: "Music Division",
			members: 300,
			expanded: true,
			subOrganizations: [
				{ id: "3-1", name: "Music organizations", members: 300 },
			]
		}
	]);

	const [guilds, setGuilds] = useState([
		{ id: "1", name: "Gaming Guild", organization: "Gaming Division", group: "Moderators", members: 500 },
		{ id: "2", name: "Art Guild", organization: "Art Division", group: "Admins", members: 250 },
		{ id: "3", name: "Music Guild", organization: "Music Division", group: "Users", members: 300 }
	]);

	const roleOptions = ["All Roles", "Admin", "Moderator", "User"];
	const groupOptions = ["All Groups", "Moderators", "Admins", "Users"];
	const organizationOptions = ["All Organizations", "Gaming Guild", "Art Guild", "Music Guild"];

	const filteredUsers = React.useMemo(() => {
		return mockUsers.filter(user => {
			const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
			const matchesGroup = selectedGroup === "All Groups" || user.group === selectedGroup;
			const matchesOrg = selectedOrg === "All Organizations" || user.organization === selectedOrg;

			return matchesSearch && matchesRole && matchesGroup && matchesOrg;
		});
	}, [mockUsers, searchTerm, selectedRole, selectedGroup, selectedOrg]);

	const { isLoading } = useAdminData(currentPage, pageSize, searchTerm);

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	const cardStyle = "bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow";

	const onDragEnd = (result: DropResult) => {
		const { source, destination } = result;

		if (!destination) return;

		const sourceId = source.droppableId;
		const destId = destination.droppableId;
    
		if (sourceId === "availableGuilds" && destId !== "availableGuilds") {
			const guildId = result.draggableId;
			const guild = availableGuilds.find(g => g.id === guildId);
			if (!guild) return;

			const destGroup = guildGroups.find(g => g.id === destId);
			if (destGroup && destGroup.guilds.some(g => g.name === guild.name)) {
				toast({
					title: "Action restricted",
					description: "This guild is already in the group.",
					variant: "destructive",
				});
				return;
			}
      
			setAvailableGuilds(prev => prev.filter(g => g.id !== guildId));
			setGuildGroups(prev => prev.map(group => {
				if (group.id === destId) {
					return { ...group, guilds: [...group.guilds, guild], expanded: true };
				}
				return group;
			}));

			const newGuild = { ...guild, id: Date.now().toString() };
			setAvailableGuilds(prev => [...prev, newGuild]);

			updateApiOnGuildMove(guildId, null, destId);
		} else if (sourceId !== "availableGuilds" && destId === "availableGuilds") {
			const guildId = result.draggableId;
			const sourceGroup = guildGroups.find(g => g.id === sourceId);
			const guild = sourceGroup?.guilds.find(g => g.id === guildId);
			if (!guild) return;

			setGuildGroups(prev => prev.map(group => {
				if (group.id === sourceId) {
					return { ...group, guilds: group.guilds.filter(g => g.id !== guildId) };
				}
				return group;
			}));

			updateApiOnGuildMove(guildId, sourceId, null);
		} else if (sourceId !== destId) {
			const guildId = result.draggableId;
			const sourceGroup = guildGroups.find(g => g.id === sourceId);
			const guild = sourceGroup?.guilds.find(g => g.id === guildId);
			if (!guild) return;

			const destGroup = guildGroups.find(g => g.id === destId);
			if (destGroup && destGroup.guilds.some(g => g.name === guild.name)) {
				toast({
					title: "Action restricted",
					description: "This guild is already in the destination group.",
					variant: "destructive",
				});
				return;
			}

			setGuildGroups(prev => prev.map(group => {
				if (group.id === sourceId) {
					return { ...group, guilds: group.guilds.filter(g => g.id !== guildId) };
				}
				if (group.id === destId) {
					return { ...group, guilds: [...group.guilds, guild], expanded: true };
				}
				return group;
			}));

			updateApiOnGuildMove(guildId, sourceId, destId);
		}
	};

	const toggleGroupExpansion = (groupId: string) => {
		setGuildGroups(guildGroups.map(group => 
			group.id === groupId ? { ...group, expanded: !group.expanded } : group
		));
	};

	const updateApiOnGuildMove = (guildId: string, sourceGroupId: string | null, destGroupId: string | null) => {
		// TODO: Implement API call to update guild's group
		console.log(`Moving guild ${guildId} from group ${sourceGroupId} to group ${destGroupId}`);
	};

	const updateApiOnGroupEdit = (groupId: string, newName: string) => {
		// TODO: Implement API call to update group name
		console.log(`Updating group ${groupId} name to ${newName}`);
		setGuildGroups(prev => prev.map(group => 
			group.id === groupId ? { ...group, name: newName } : group
		));
		setEditingGroupId(null);
		setNewGroupName("");
	};

	const updateApiOnGroupDelete = (groupId: string) => {
		// TODO: Implement API call to delete group
		console.log(`Deleting group ${groupId}`);
		setGuildGroups(prev => prev.filter(group => group.id !== groupId));
	};

	const deleteGuildFromGroup = (groupId: string, guildId: string) => {
		setGuildGroups(prev => prev.map(group => {
			if (group.id === groupId) {
				return { ...group, guilds: group.guilds.filter(g => g.id !== guildId) };
			}
			return group;
		}));
		// TODO: Implement API call to delete guild from group
		console.log(`Deleting guild ${guildId} from group ${groupId}`);
	};

	const isGuildInAnyGroup = (guildId: string) => {
		console.log('groups', guildGroups);
		return guildGroups.some(group => group.guilds.some(guild => guild.id === guildId));
	};

	const handleUserUpdate = (updatedUser: UserType) => {
		setMockUsers(prev => prev.map(user => 
			user.id === updatedUser.id ? updatedUser : user
		));
		toast({
			title: "User updated",
			description: `Successfully updated user ${updatedUser.name}`,
		});
	};

	const handleUserDelete = (userId: bigint) => {
		setMockUsers(prev => prev.filter(user => user.id !== userId));
		toast({
			title: "User deleted",
			description: "Successfully deleted user",
		});
	};

	const handleToggleActive = (user: UserType) => {
		const updatedUser = { 
			...user, 
			status: user.status === "Active" ? "Inactive" : "Active" 
		};
		handleUserUpdate(updatedUser);
	};

	const handleAddGroup = () => {
		const newGroup: Group = {
			id: Date.now().toString(),
			name: newGroupData.name,
			members: newGroupData.members,
			expanded: true,
			guilds: []
		};
		setGuildGroups(prev => [...prev, newGroup]);
		setIsAddGroupModalOpen(false);
		setNewGroupData({ name: "", members: 0 });
		// TODO: Implement API call to add new group
		console.log(`Adding new group: ${JSON.stringify(newGroup)}`);
	};

	const handleGuildUpdate = (updatedGuild: Guild) => {
		setGuilds(prev => prev.map(guild => 
			guild.id === updatedGuild.id ? updatedGuild : guild
		));
	};

	const handleGuildDelete = (guildId: string) => {
		setGuilds(prev => prev.filter(guild => guild.id !== guildId));
	};

	return (
		<motion.div 
			className="w-full min-h-screen bg-gray-50 p-6"
			variants={container}
			initial="hidden"
			animate="show"
		>
			<div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
				<h2 className="text-2xl font-bold mb-4">User Management</h2>
				<Card className="mb-6">
					<div className="p-4 flex flex-wrap gap-4 items-center">
						<div className="flex-1 min-w-[200px]">
							<Input
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
						</div>
						<Select value={selectedRole} onValueChange={setSelectedRole}>
							<SelectTrigger className="w-fit min-w-[120px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{roleOptions.map(role => (
									<SelectItem key={role} value={role}>
										{role}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={selectedGroup} onValueChange={setSelectedGroup}>
							<SelectTrigger className="w-fit min-w-[120px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{groupOptions.map(group => (
									<SelectItem key={group} value={group}>
										{group}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={selectedOrg} onValueChange={setSelectedOrg}>
							<SelectTrigger className="w-fit min-w-[150px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{organizationOptions.map(org => (
									<SelectItem key={org} value={org}>
										{org}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<UserManagementTable 
						users={filteredUsers}
						pagination={{
							currentPage: 1,
							totalPages: Math.ceil(filteredUsers.length / pageSize),
							totalItems: filteredUsers.length,
							itemsPerPage: pageSize
						}}
						isLoading={false}
						onPageChange={setCurrentPage}
						onPageSizeChange={setPageSize}
						onToggleActive={handleToggleActive}
						onDelete={handleUserDelete}
						onUpdate={handleUserUpdate}
					/>
				</Card>

				<h2 className="text-2xl font-bold mb-4">Group Management</h2>
				<DragDropContext onDragEnd={onDragEnd}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div>
              <Card className="relative p-6 h-full">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-xl font-semibold">Groups</h3>
								<Dialog open={isAddGroupModalOpen} onOpenChange={setIsAddGroupModalOpen}>
									<DialogTrigger asChild>
										<Button variant="outline" size="sm">
											<Plus className="mr-2 h-4 w-4" /> Add Group
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Add New Group</DialogTitle>
											<DialogDescription>
												Create a new group for organizing guilds.
											</DialogDescription>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid grid-cols-4 items-center gap-4">
												<label htmlFor="name" className="text-right">
													Name
												</label>
												<Input
													id="name"
													value={newGroupData.name}
													onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
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
													value={newGroupData.members}
													onChange={(e) => setNewGroupData({ ...newGroupData, members: parseInt(e.target.value) })}
													className="col-span-3"
												/>
											</div>
										</div>
										<DialogFooter>
											<Button type="submit" onClick={handleAddGroup}>Add Group</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
							{guildGroups.map(group => (
								<Droppable key={group.id} droppableId={group.id}>
									{(provided: DroppableProvided) => (
										<motion.div {...provided.droppableProps} ref={provided.innerRef} className="mb-4 p-4 bg-gray-50 rounded">
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													{editingGroupId === group.id ? (
														<div className="flex items-center gap-2">
															<Input
																value={newGroupName}
																onChange={(e) => setNewGroupName(e.target.value)}
																className="w-[150px]"
															/>
														</div>
													) : (
														<span className="font-semibold">{group.name}</span>
													)}
													<button onClick={() => toggleGroupExpansion(group.id)}>
														{group.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
													</button>
												</div>
												<div className="flex items-center gap-2">
													
                          {editingGroupId === group.id ? (
                            <>
                              <Check
                                size={18}
                                className="cursor-pointer hover:text-green-700"
                                onClick={() => updateApiOnGroupEdit(group.id, newGroupName)}
                              />
                              <X
                                size={18}
                                className="cursor-pointer hover:text-red-700"
                                onClick={() => {
                                  setEditingGroupId(null);
                                  setNewGroupName("");
                                }}
                              />
                            </>
                            ) : (
                              <>
                            <Edit size={18} className="cursor-pointer text-gray-500 hover:text-gray-700" onClick={() => {
                              setEditingGroupId(group.id);
                              setNewGroupName(group.name);
                            }} />
                            <Dialog>
                              <DialogTrigger asChild>
                                <Trash2 size={18} className="cursor-pointer text-gray-500 hover:text-gray-700" />
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Are you sure you want to delete this group?</DialogTitle>
                                  <DialogDescription>
                                    This action cannot be undone. All guilds in this group will be moved to available guilds.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                  <Button variant="destructive" onClick={() => updateApiOnGroupDelete(group.id)}>Delete</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            </>
                          )}
												</div>
											</div>
											<AnimatePresence>
												{group.expanded && (
													<motion.div
														initial={{ height: 0, opacity: 0 }}
														animate={{ height: "auto", opacity: 1 }}
														exit={{ height: 0, opacity: 0 }}
														transition={{ duration: 0.3 }}
														className="relative pl-6"
													>
														<div className="absolute left-1 top-0 bottom-6 w-[2px] bg-gray-300"></div>
														{group.guilds.map((guild, index) => (
															<Draggable key={guild.id} draggableId={guild.id} index={index}>
																{(provided: DraggableProvided) => (
																	<div
																		ref={provided.innerRef}
																		{...provided.draggableProps}
																		{...provided.dragHandleProps}
																		className="bg-gray-50 p-3 rounded-lg mb-2 cursor-move relative"
																	>
																		<div className="absolute left-[-20px] top-[50%] w-[20px] h-[2px] bg-gray-300"></div>
																		<div className="flex items-center justify-between">
																			<span>{guild.name}</span>
																			<div className="flex items-center gap-2">
																				<Badge variant="secondary">{guild.members} members</Badge>
																				<X
																					size={16}
																					className="cursor-pointer text-gray-500 hover:text-gray-700"
																					onClick={() => deleteGuildFromGroup(group.id, guild.id)}
																				/>
																			</div>
																		</div>
																	</div>
																)}
															</Draggable>
														))}
													</motion.div>
												)}
											</AnimatePresence>
											{provided.placeholder}
										</motion.div>
									)}
								</Droppable>
							))}
              </Card>
						</motion.div>

            <motion.div
            >
              <Card className="relative p-6 h-full">
                <h3 className="text-xl font-semibold mb-4">Available Guilds</h3>
                <Droppable droppableId="availableGuilds">
                  {(provided: DroppableProvided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {availableGuilds.map((guild, index) => (
                        <Draggable key={guild.id} draggableId={guild.id} index={index} isDragDisabled={isGuildInAnyGroup(guild.id)}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-gray-50 p-3 rounded-lg mb-2 ${isGuildInAnyGroup(guild.id) ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <span>{guild.name}</span>
                                </div>
                                <Badge variant="secondary">{guild.members} members</Badge>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
						</motion.div>
					</div>
				</DragDropContext>

				<OrganizationStructure 
					organizations={organizations}
					isLoading={isLoading}
          className="mb-6"
				/>

				<GuildsManagement 
					guilds={guilds}
					organizations={organizations.map(org => org.name)}
					groups={guildGroups.map(group => group.name)}
					onUpdate={handleGuildUpdate}
					onDelete={handleGuildDelete}
          className="mb-6"
				/>
			</div>
		</motion.div>
	);
};

export default AdminPanel;