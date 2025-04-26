import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllOwners, useGetAllGuilds, useUpdateOwnerRole, useAssignGuildToOwner, useRemoveGuildFromOwner, useToggleGuildActivityState, useGetAllAgencies, useCreateAgency, useUpdateAgency, useDeleteAgency, useAssignGuildToAgency, useRemoveGuildFromAgency, useAssignOwnerToAgency, useRemoveOwnerFromAgency, useGetGuildsForOwner, useCreateUserMutation } from "@/hooks/admin/useAdminData";
import { toast } from "@/hooks/use-toast";
import { Owner, Guild, User, Agency } from "@/types/dataTypes";
import { motion } from "framer-motion";
import { Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import GuildsManagement from "./components/GuildsManagement";
import AgencyStructure from "./components/OrganizationStructure";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import UserManagementTable from "./components/UserManagementTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { nanoid } from 'nanoid';
import { OwnerRole } from "@/hooks/admin/admin.types";
import { Power, PowerOff } from "lucide-react";

const CLONE_SUFFIX = () => nanoid(6); // Generates a unique suffix

function makeDraggableId(guildId: string) {
  return `${guildId}-${CLONE_SUFFIX()}`;
}

function baseGuildId(draggableId: string) {
  return draggableId.replace(/-[^-]+$/, '');
}

type UserGuildAccess = Record<string, string[]>;

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1
		}
	}
};

const AdminPanel = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState<string>("All Roles");
	const [selectedAgency, setSelectedAgency] = useState<string>("All Agencies");
	const [selectedUserIdForGuildView, setSelectedUserIdForGuildView] = useState<string | null>(null);
	const [userGuildAccess, setUserGuildAccess] = useState<UserGuildAccess>({});
	const [isEditingRestrictions, setIsEditingRestrictions] = useState<boolean>(false);
	const [editingGuildRestrictions, setEditingGuildRestrictions] = useState<Record<string, boolean>>({});

	const { data: owners, isLoading: isLoadingOwners } = useGetAllOwners();
	const { data: guildsData, isLoading: isLoadingGuilds } = useGetAllGuilds();
	const { data: agenciesData, isLoading: isLoadingAgencies } = useGetAllAgencies();
	const { data: guildsForOwner, isLoading: isLoadingGuildsForOwner } = useGetGuildsForOwner(selectedUserIdForGuildView);
	const removeGuildFromOwner = useRemoveGuildFromOwner();
	const updateOwnerRole = useUpdateOwnerRole();
	const assignGuildToOwner = useAssignGuildToOwner();
	const assignUserToAgency = useAssignOwnerToAgency();
	const removeOwnerFromAgency = useRemoveOwnerFromAgency();
	const toggleGuildActivityState = useToggleGuildActivityState();
	const createAgencyMutation = useCreateAgency();
	const updateAgencyMutation = useUpdateAgency();
	const deleteAgencyMutation = useDeleteAgency();
	const assignGuildToAgencyMutation = useAssignGuildToAgency();
	const removeGuildFromAgencyMutation = useRemoveGuildFromAgency();
	const createUserMutation = useCreateUserMutation();

	const [users, setUsers] = useState<User[]>([]);
	const [agencies, setAgencies] = useState<Agency[]>([]);
	const [guilds, setGuilds] = useState<Guild[]>([]);
	const isLoading = isLoadingOwners || isLoadingGuilds || isLoadingAgencies;

	const roleOptions = ["All Roles", "Admin", "AgencyPartner", "Client"];

	useEffect(() => {
		if (owners) {
			setUsers(owners as User[]);
		}
	}, [owners]);

	useEffect(() => {
		if (agenciesData) {
			setAgencies(agenciesData);
		}
	}, [agenciesData]);

	useEffect(() => {
		if (guildsData) {
			setGuilds(guildsData as Guild[]);
		}
	}, [guildsData]);

	const filteredUsers = useMemo(() => {
		return users.filter(user => {
			const matchesSearch = user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRole = selectedRole === "All Roles" || user?.role === selectedRole;
			const matchesAgency = selectedAgency === "All Agencies" ||
				(user as any).agencyId === selectedAgency ||
				user?.role === 'Admin'; // Admins are always shown regardless of agency filter

			return matchesSearch && matchesRole && matchesAgency;
		});
	}, [users, searchTerm, selectedRole, selectedAgency]);

	useEffect(() => {
		const calculateUserGuildAccess = (): UserGuildAccess => {
			const accessMap: UserGuildAccess = {};
			const allUsersWithAgencyId: User[] = [
				...users,
				...(agencies?.flatMap(a =>
					(a.owners || []).filter(Boolean).map(u => ({
						...u,
						agencyId: a.id
					}))
				) || [])
			];

			const uniqueUsers = Array.from(new Map(allUsersWithAgencyId?.map(u => [u?.id, u])).values());

			uniqueUsers.forEach(user => {
				const userAny = user as any;
				let accessibleGuildIds: string[] = [];
				switch (user.role) {
					case 'Admin':
						accessibleGuildIds = guilds.map(g => g.id);
						break;
					case 'Client':
						const clientGuildId = userAny.guildId;
						if (clientGuildId && guilds.some(g => g.id === clientGuildId)) {
							accessibleGuildIds = [clientGuildId];
						}
						break;
					case 'AgencyPartner':
						const agencyPartnerAgencyId = userAny.agencyId;
						const agency = agencies.find(a => a.id === agencyPartnerAgencyId);
						if (agency) {
							const agencyGuildIds = guilds.filter(g => g.agencyId === agency.id).map(g => g.id);
							const restrictedGuildIds = userAny.restrictedGuildIds as string[] | undefined;
							if (restrictedGuildIds && restrictedGuildIds.length > 0) {
								accessibleGuildIds = agencyGuildIds.filter(id => restrictedGuildIds.includes(id));
							} else {
								accessibleGuildIds = agencyGuildIds;
							}
						}
						break;
					default:
						accessibleGuildIds = [];
						break;
				}
				accessMap[user.id] = accessibleGuildIds;
			});
			return accessMap;
		};

		const newAccessMap = calculateUserGuildAccess();
		// setUserGuildAccess(newAccessMap);

	}, [users, agencies, guilds]);

const handleUserUpdate = (updatedUser: User) => {
	updateOwnerRole.mutate({ id: updatedUser.id, payload: { role: updatedUser.role as OwnerRole, agencyId: updatedUser.agencyId}}, {
		onSuccess: () => {
			setUsers(prev => prev.map(user =>
				user.id === updatedUser.id ? updatedUser : user
			));
			setAgencies(prev => prev.map(agency => ({
				...agency,
				users: agency.owners.map(u => u.id === updatedUser.id ? updatedUser : u)
			})));
			toast({
				title: "User updated",
				description: `Successfully updated user ${updatedUser.name}`,
			});
		}
	});
};

	const handleUserDelete = async (userId: string): Promise<boolean> => {
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user) return false;

		if (user.role === 'AgencyPartner' && (user as any).agencyId) {
			const isInAgency = agencies.some(a => a.owners?.some(u => u.id === userId));
			if (isInAgency) {
				toast({
					title: "Deletion Restricted",
					description: "Cannot delete Agency Partner while assigned to an agency. Remove from agency first.",
					variant: "destructive",
				});
				return false;
			}
		}

		removeGuildFromOwner.mutate(userId, {
			onSuccess: () => {
				setUsers(prev => prev.filter(user => user.id !== userId));
				setAgencies(prev => prev.map(agency => ({
					...agency,
					users: agency.owners.filter(u => u.id !== userId)
				})));
				toast({
					title: "User deleted",
					description: "Successfully deleted user",
				});
			}
		});
		return true;
	};

	const handleToggleActive = (user: User) => {
		const updatedUser = {
			...user,
			isActive: !user.isActive
		};
		handleUserUpdate(updatedUser);
	};

	const handleAddAgency = (agencyData: { name: string, description: string }) => {
		createAgencyMutation.mutate({ name: agencyData.name, description: agencyData.description }, {
			onSuccess: (newAgency) => {
				setAgencies(prev => [...prev, newAgency]);
				toast({ title: "Agency Added", description: `Agency "${newAgency.name}" created.` });
			}
		});
	};

	const handleUpdateAgency = (updatedAgency: Agency) => {
		updateAgencyMutation.mutate({ agencyId: updatedAgency.id, payload: { name: updatedAgency.name, description: updatedAgency.description } }, {
			onSuccess: () => {
				setAgencies(prev => prev.map(agency =>
					agency.name === updatedAgency.name ? updatedAgency : agency
				));
				toast({ title: "Agency Updated", description: `Agency "${updatedAgency.name}" updated.` });
			}
		});
	};

	const handleDeleteAgency = async (agencyId: string): Promise<boolean> => {
		const agency = agencies.find(a => a.id === agencyId);
		if (!agency) return false;

		if (agency.owners.length > 0 || agency.agencyGuilds.length > 0) {
			toast({
				title: "Deletion Restricted",
				description: "Cannot delete agency with assigned users or guilds.",
				variant: "destructive",
			});
			return false;
		}

		deleteAgencyMutation.mutate(agencyId, {
			onSuccess: () => {
				setAgencies(prev => prev.filter(a => a.id !== agencyId));
				toast({ title: "Agency Deleted", description: `Agency "${agency.name}" deleted.` });
			}
		});
		return true;
	};

	const handleAssignGuildToAgency = (agencyId: string, guildId: string) => {
		assignGuildToAgencyMutation.mutate({ agencyId, guildId, userId: selectedUserIdForGuildView }, {
			onSuccess: () => {
				const guild = guilds.find(g => g.id === guildId);
				if (!guild) return;

				// No longer update the guild's agencyId in the guilds list
				// This allows the guild to exist in multiple agencies

				// Only add the guild to the target agency without removing from others
				setAgencies(prev => prev.map(agency => {
					if (agency.id === agencyId) {
						if (!agency.agencyGuilds.some(g => g.name === guild.name)) {
							return { ...agency, agencyGuilds: [...agency.agencyGuilds, { ...guild, agencyId }] };
						}
					}
					return agency;
				}));

				toast({ title: "Guild Assigned", description: `Guild "${guild.name}" assigned to agency.` });
			}
		});
	};

	const handleRemoveGuildFromAgency = (agencyId: string, guildId: string) => {
		removeGuildFromAgencyMutation.mutate({ agencyId, guildId }, {
			onSuccess: () => {
				const guild = guilds.find(g => g.id === guildId);
				if (!guild) return;

				setGuilds(prev => prev.map(g =>
					g.id === guildId ? { ...g, agencyId: undefined } : g
				));

				setAgencies(prev => prev.map(agency =>
					agency.id === agencyId
						? { ...agency, agencyGuilds: agency.agencyGuilds.filter(g => g.id !== guildId) }
						: agency
				));

				setUsers(prev => prev.map(user => {
					if (user.role === 'AgencyPartner' && (user as any).agencyId === agencyId) {
						return {
							...user,
							restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
						};
					}
					return user;
				}));
				setAgencies(prev => prev.map(agency => ({
					...agency,
					users: agency.owners.map(user => {
						if (user.role === 'AgencyPartner' && user.id === user.id) {
							return {
								...user,
								restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
							};
						}
						return user;
					})
				})));

				toast({ title: "Guild Removed", description: `Guild "${guild.name}" removed from agency.` });
			}
		});
	};

const handleAssignUserToAgency = (userId: string, agencyId: string) => {
	const user = allManageableUsers.find(u => u.id === userId);
	if (!user || user.role !== 'AgencyPartner') {
		toast({ title: "Assignment Restricted", description: "Only Agency Partners can be assigned to agencies.", variant: "destructive" });
		return;
	}

	const targetAgency = agencies.find(a => a.id === agencyId);
	if (!targetAgency) return;

	assignUserToAgency.mutate({ ownerId: userId, agencyId }, {
		onSuccess: () => {
			const currentAgencyId = (user as any).agencyId;
			if (currentAgencyId && currentAgencyId !== agencyId) {
				setAgencies(prev => prev.map(agency => {
					if (agency.id === currentAgencyId) {
						return { ...agency, users: agency.owners.filter(u => u.id !== userId) };
					}
					return agency;
				}));
			}

			setUsers(prev => prev.filter(u => u.id !== userId));

			setAgencies(prev => prev.map(agency => {
				if (agency.id === agencyId) {
					if (!agency.owners.some(u => u.id === userId)) {
						return { ...agency, users: [...agency.owners, { ...user, agencyId: agencyId, restrictedGuildIds: undefined }] };
					}
				}
				return agency;
			}));

			toast({ title: "User Assigned", description: `User "${user.name}" assigned to agency "${targetAgency.name}".` });
		}
	});
};

	const handleAssignAgencyToUser = (userId: string, agencyId: string) => {
		setUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, agencyId } : u
		));
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.owners.map(u => u.id === userId ? { ...u, agencyId } : u)
		})));
	};

	const handleRemoveUserFromAgency = (userId: string, agencyId: string) => {
		const agency = agencies.find(a => a.id === agencyId);
		if (!agency) return;

		const user = agency.owners.find(u => u.id === userId);
		if (!user) return;

		removeOwnerFromAgency.mutate({ ownerId: userId }, {
			onSuccess: () => {
				setUsers(prev => {
					if (prev.some(u => u.id === userId)) {
						return prev.map(u => u.id === userId ? { ...user, agencyId: undefined, restrictedGuildIds: undefined } : u);
					}
					const updatedUsers = [...prev, { ...user, agencyId: undefined, restrictedGuildIds: undefined }];
					return updatedUsers.sort((a, b) => a.name?.localeCompare(b.name));
				});

				setAgencies(prev => prev.map(a => {
					if (a.id === agencyId) {
						return { ...a, users: a.owners?.filter(u => u.id !== userId) };
					}
					return a;
				}));

				toast({
					title: "User Removed",
					description: `Successfully removed user "${user.name}" from agency "${agency.name}".`,
				});
			}
		});
	};

	const handleAssignGuildToUser = (userId: string, guildId: string) => {
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user || user.role !== 'Client') {
			toast({ title: "Assignment Restricted", description: "Only Clients can be assigned to a specific guild.", variant: "destructive" });
			return;
		}

		setUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, guildId } : u
		));
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.owners.map(u => u.id === userId ? { ...u, guildId } : u)
		})));

		const guild = guilds.find(g => g.id === guildId);
		toast({ title: "Guild Assigned", description: `Client "${user.name}" assigned to guild "${guild?.name ?? guildId}".` });
	};

	const handleRemoveGuildFromUser = (userId: string, guildId: string) => {
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user || user.role !== 'Client') return;

		setUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, guildId: undefined } : u
		));
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.owners.map(u => u.id === userId ? { ...u, guildId: undefined } : u)
		})));

		const guild = guilds.find(g => g.id === guildId);
		toast({ title: "Guild Unassigned", description: `Guild "${guild?.name ?? guildId}" unassigned from client "${user.name}".` });
	};

	const handleRestrictUserGuilds = (userId: string, guildIds: string[]) => {
		console.warn("handleRestrictUserGuilds called, but logic is in handleSaveRestrictions");
	};

	const handleGuildUpdate = (updatedGuild: Guild) => {
		toggleGuildActivityState.mutate({ guildId: updatedGuild.id, payload: { active: updatedGuild.active }  }, {
			onSuccess: () => {
				setGuilds(prev => prev.map(guild =>
					guild.id === updatedGuild.id ? updatedGuild : guild
				));

				setAgencies(prev => prev.map(agency => ({
					...agency,
					agencyGuilds: agency.agencyGuilds.map(g => g.id === updatedGuild.id ? updatedGuild : g)
				})));
				toast({ title: "Guild Updated", description: `Guild "${updatedGuild.name}" updated.` });
			}
		});
	};

	const handleAgencyAssignment = (user: Omit<User, 'agency' | 'ownerGuilds' | 'createdAt' | 'updatedAt'>, targetAgencyId: string) => {
		if (user.role !== 'AgencyPartner') {
			updateOwnerRole.mutate({ id: user.id, payload: { role: OwnerRole.AGENCY_PARTNER } }, {
				onSuccess: () => {
					handleAssignUserToAgency(user.id, targetAgencyId);
					toast({
						title: "Role Updated & User Assigned",
						description: `User "${user.name}" role updated to Agency Partner and assigned to agency.`,
					});
				},
				onError: () => {
					toast({
						title: "Role Update Failed",
						description: `Failed to update user "${user.name}" to Agency Partner role.`,
						variant: "destructive",
					});
				}
			});
		} else {
			handleAssignUserToAgency(user.id, targetAgencyId);
		}
	};

	const handleGuildDelete = async (guildId: string): Promise<boolean> => {
		const guild = guilds.find(g => g.id === guildId);
		if (!guild) return false;

		const hasClients = allManageableUsers.some(u =>
			u.role === 'Client' && (u as any).guildId === guildId
		);

		if (hasClients) {
			toast({
				title: "Deletion Restricted",
				description: "Cannot delete guild with assigned clients.",
				variant: "destructive",
			});
			return false;
		}

		removeGuildFromAgencyMutation.mutate({ agencyId: guild.agencyId, guildId }, {
			onSuccess: () => {
				if (guild.agencyId) {
					setAgencies(prev => prev.map(agency => {
						if (agency.id === guild.agencyId) {
							return { ...agency, agencyGuilds: agency.agencyGuilds.filter(g => g.id !== guildId) };
						}
						return agency;
					}));
				}

				setUsers(prev => prev.map(user => {
					if (user.role === 'AgencyPartner' && (user as any).restrictedGuildIds) {
						return {
							...user,
							restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
						};
					}
					return user;
				}));
				setAgencies(prev => prev.map(agency => ({
					...agency,
					users: agency.owners.map(user => {
						if (user.role === 'AgencyPartner' && (user as any).restrictedGuildIds) {
							return {
								...user,
								restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
							};
						}
						return user;
					})
				})));

				setGuilds(prev => prev.filter(g => g.id !== guildId));
				toast({ title: "Guild Deleted", description: `Guild "${guild.name}" deleted.` });
			}
		});
		return true;
	};

const handleDragEnd = (result: DropResult) => {
	const { source, destination, draggableId, type } = result;

	if (!destination) return;

	if (source.droppableId === destination.droppableId && source.index === destination.index) return;

	const srcId = source.droppableId;
	const dstId = destination.droppableId;

	if (type === 'guild') {
		// Extract the base guild ID, handling different draggable ID formats
		const guildId = draggableId.includes('guilds-table-') 
			? draggableId.replace('guilds-table-', '')
			: draggableId.includes('agency-guilds-') 
				? draggableId.replace('agency-guilds-', '')
				: baseGuildId(draggableId);
				
		const guild = guilds.find(g => g.id === guildId);

		if (!guild) return;

		if (srcId === 'guilds-table' && dstId.startsWith('agency-guilds-')) {
			const agencyId = dstId.replace('agency-guilds-', '');
			const targetAgency = agencies.find(a => a.id === agencyId);

			// Check if guild already exists in the target agency
			const guildAlreadyExists = targetAgency?.agencyGuilds.some(g => baseGuildId(g.id) === guildId);
			if (guildAlreadyExists) {
				toast({
					title: "Guild already assigned",
					description: `This guild is already assigned to this agency`,
					variant: "destructive"
				});
				return;
			}

			// Create a copy with the new agencyId added to the agencyIds array
			const guildCopy = { 
				...guild, 
				agencyIds: [...(guild.agencyIds || []), agencyId],
				id: `${guildId}-${Date.now()}` 
			};

			setAgencies(prev => prev.map(a =>
				a.id === agencyId
					? { ...a, agencyGuilds: [...a.agencyGuilds, guildCopy] }
					: a
			));

			// Update the original guild in the guilds list to include the new agencyId
			// but KEEP the guild in the guilds list for reuse with other agencies
			setGuilds(prev => prev.map(g => 
				g.id === guildId 
					? { ...g, agencyIds: [...(g.agencyIds || []), agencyId] }
					: g
			));

			toast({
				title: "Guild assigned",
				description: `Successfully assigned guild to agency`,
			});

			handleAssignGuildToAgency(agencyId, guildId);
		} else if (srcId.startsWith('agency-guilds-') && dstId === 'guilds-table') {
			const agencyId = srcId.replace('agency-guilds-', '');
			
			// Get the actual draggable ID that might include prefixes
			const actualDraggableId = draggableId.includes('agency-guilds-') 
				? draggableId.replace('agency-guilds-', '')
				: draggableId;

			// Remove the guild from the agency's agencyGuilds list
			setAgencies(prev => prev.map(a =>
				a.id === agencyId
					? { ...a, agencyGuilds: a.agencyGuilds.filter(g => g.id !== actualDraggableId) }
					: a
			));

			// Update the original guild in the guilds list to remove this agencyId
			setGuilds(prev => prev.map(g => {
				if (g.id === guildId && g.agencyIds) {
					const updatedAgencyIds = g.agencyIds.filter(id => id !== agencyId);
					return { 
						...g, 
						agencyIds: updatedAgencyIds.length ? updatedAgencyIds : undefined 
					};
				}
				return g;
			}));

			toast({
				title: "Guild removed",
				description: `Successfully removed guild from agency`,
			});

			handleRemoveGuildFromAgency(agencyId, guildId);
		} else if (srcId.startsWith('agency-guilds-') && dstId.startsWith('agency-guilds-')) {
			const sourceAgencyId = srcId.replace('agency-guilds-', '');
			const destAgencyId = dstId.replace('agency-guilds-', '');

			if (sourceAgencyId === destAgencyId) return;

			const targetAgency = agencies.find(a => a.id === destAgencyId);
			
			// Get the actual draggable ID that might include prefixes
			const actualDraggableId = draggableId.includes('agency-guilds-') 
				? draggableId.replace('agency-guilds-', '')
				: draggableId;
				
			// Check if guild already exists in the target agency by comparing base guild IDs
			const guildAlreadyExists = targetAgency?.agencyGuilds.some(g => baseGuildId(g.id) === guildId);
			if (guildAlreadyExists) {
				toast({
					title: "Guild already assigned",
					description: `This guild is already assigned to this agency`,
					variant: "destructive"
				});
				return;
			}

			// Create a copy with the correct agencyIds for the destination agency
			const currentAgencyIds = guild.agencyIds || [];
			const guildCopy = { 
				...guild, 
				agencyIds: [...currentAgencyIds.filter(id => id !== sourceAgencyId), destAgencyId],
				id: `${guildId}-${Date.now()}` 
			};

			setAgencies(prev => prev.map(a => {
				if (a.id === sourceAgencyId) {
					return { ...a, agencyGuilds: a.agencyGuilds.filter(g => g.id !== actualDraggableId) };
				}
				if (a.id === destAgencyId) {
					return { ...a, agencyGuilds: [...a.agencyGuilds, guildCopy] };
				}
				return a;
			}));

			// Update the original guild in the guilds list to include the new agencyId
			// and remove the old one if needed
			setGuilds(prev => prev.map(g => {
				if (g.id === guildId) {
					const existingAgencyIds = g.agencyIds || [];
					const updatedAgencyIds = [...existingAgencyIds.filter(id => id !== sourceAgencyId), destAgencyId];
					return { ...g, agencyIds: [...new Set(updatedAgencyIds)] }; // Remove duplicates
				}
				return g;
			}));

			toast({
				title: "Guild moved",
				description: `Successfully moved guild between agencies`,
			});

			handleRemoveGuildFromAgency(sourceAgencyId, guildId);
			handleAssignGuildToAgency(destAgencyId, guildId);
		} else if (srcId === dstId) {
			if (srcId === 'guilds-table') {
				const newGuilds = Array.from(guilds);
				const [removed] = newGuilds.splice(source.index, 1);
				newGuilds.splice(destination.index, 0, removed);
				setGuilds(newGuilds);
			} else if (srcId.startsWith('agency-guilds-')) {
				const agencyId = srcId.replace('agency-guilds-', '');
				setAgencies(prev => prev.map(a => {
					if (a.id === agencyId) {
						const newGuilds = Array.from(a.agencyGuilds);
						const [removed] = newGuilds.splice(source.index, 1);
						newGuilds.splice(destination.index, 0, removed);
						return { ...a, agencyGuilds: newGuilds };
					}
					return a;
				}));
			}
		}
	}

	if (type === 'user') {
		const userId = draggableId.replace(/-[^-]*$/, '');
		const user = allManageableUsers.find(u => u.id === userId) as Omit<User, 'agency' | 'ownerGuilds' | 'createdAt' | 'updatedAt'>;
		if (!user) return;

		if (srcId.startsWith('agency-users-') && dstId === 'users-table') {
			const sourceAgencyId = srcId.replace('agency-users-', '');
			updateOwnerRole.mutate({ id: userId, payload: { role: OwnerRole.CLIENT } }, {
				onSuccess: () => {
					handleRemoveUserFromAgency(userId, sourceAgencyId);
				}
			});
		} else if (srcId === 'users-table' && dstId.startsWith('agency-users-')) {
			const destAgencyId = dstId.replace('agency-users-', '');
			handleAgencyAssignment(user, destAgencyId);
		} else if (srcId.startsWith('agency-users-') && dstId.startsWith('agency-users-')) {
			const sourceAgencyId = srcId.replace('agency-users-', '');
			const destAgencyId = dstId.replace('agency-users-', '');

			if (sourceAgencyId !== destAgencyId) {
				handleAgencyAssignment(user, destAgencyId);
				toast({ title: "User Moved", description: `Moved user "${user.name}" between agencies.` });
			}
		}
	}
};

	const allManageableUsers = useMemo(() => {
		const agencyUsers = agencies?.flatMap(a => 
			(a.owners || []).map(u => ({
				...u,
				agencyId: a.id
			}))
		) || [];
		
		const combined = [...(users || []), ...agencyUsers];
		const uniqueUsers = Array.from(
			new Map(combined.filter(user => user && user.id).map(user => [user.id, user])).values()
		);
		
		return uniqueUsers.sort((a, b) => {
			if (!a.name && !b.name) return 0;
			if (!a.name) return 1;
			if (!b.name) return -1;
			return a.name.localeCompare(b.name);
		});
	}, [users, agencies]);

	const getAvailableGuildsForUser = useCallback((userId: string | null): Guild[] => {
		if (!userId) return [];
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user) return [];
		if (user.role === 'ADMIN') return guilds;
		if (user.role === 'CLIENT') return guildsForOwner || [];
		if (user.role === 'AGENCY_PARTNER') {
			const agencyId = user.agencyId;
			if (!agencyId) return [];
			const agency = agencies.find(a => a.id === user.agencyId);
			if (!agency) return [];
			console.log('agency.agencyGuilds',agency.agencyGuilds);
			return agency.agencyGuilds || [];
		}
		return [];
	}, [allManageableUsers, agencies, guilds]);

	const availableGuildsForSelectedUser = useMemo(
		() => getAvailableGuildsForUser(selectedUserIdForGuildView),
		[selectedUserIdForGuildView, getAvailableGuildsForUser]
	);


	const handleStartEditingRestrictions = (userId: string) => {
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user || user.role !== 'AgencyPartner') return;

		const partnerAgencyId = (user as any).agencyId;
		const agency = agencies.find(a => a.id === partnerAgencyId);
		if (!agency) return;

		const agencyGuilds = guilds.filter(g => g.agencyId === agency.id);
		const currentRestrictions = (user as any).restrictedGuildIds as string[] | undefined;

		const initialSelection: Record<string, boolean> = {};
		agencyGuilds.forEach(guild => {
			const hasAccess = !currentRestrictions || currentRestrictions.length === 0 || currentRestrictions.includes(guild.id);
			initialSelection[guild.id] = hasAccess;
		});

		setEditingGuildRestrictions(initialSelection);
		setIsEditingRestrictions(true);
	};

	const handleCancelEditingRestrictions = () => {
		setIsEditingRestrictions(false);
		setEditingGuildRestrictions({});
	};

	const handleSaveRestrictions = () => {
		if (!selectedUserIdForGuildView || !selectedUser) return;

		const selectedGuildIds = Object.entries(editingGuildRestrictions)
			.filter(([_, isSelected]) => isSelected)
			.map(([guildId, _]) => guildId);

		if (selectedUser.role === 'AgencyPartner' && guildsForEditingPartner.length > 0 && selectedGuildIds.length === 0) {
			toast({
				title: "Cannot Remove All Guild Access",
				description: "An Agency Partner must have access to at least one guild from their assigned agency.",
				variant: "destructive",
			});
			return;
		}

		let userFoundAndUpdated = false;

		setUsers(prev => {
			const userIndex = prev.findIndex(u => u.id === selectedUserIdForGuildView && u.role === 'AgencyPartner');
			if (userIndex !== -1) {
				userFoundAndUpdated = true;
				const updatedUsers = [...prev];
				updatedUsers[userIndex] = { ...updatedUsers[userIndex], restrictedGuildIds: selectedGuildIds };
				return updatedUsers;
			}
			return prev;
		});

		if (!userFoundAndUpdated) {
			setAgencies(prev => prev.map(agency => {
				const userIndex = agency.owners.findIndex(u => u.id === selectedUserIdForGuildView && u.role === 'AgencyPartner');
				if (userIndex !== -1) {
					userFoundAndUpdated = true;
					const updatedUsers = [
						...agency.owners.slice(0, userIndex),
						{ ...agency.owners[userIndex], restrictedGuildIds: selectedGuildIds },
						...agency.owners.slice(userIndex + 1),
					];
					return { ...agency, users: updatedUsers };
				}
				return agency;
			}));
		}

		if (userFoundAndUpdated) {
			toast({
				title: "Restrictions updated",
				description: "User guild access restrictions saved successfully.",
			});
			setIsEditingRestrictions(false);
			setEditingGuildRestrictions({});
		} else {
			console.error("handleSaveRestrictions: Failed to find Agency Partner to update:", selectedUserIdForGuildView);
			toast({
				title: "Update Failed",
				description: "Could not find the specified Agency Partner to update restrictions.",
				variant: "destructive",
			});
		}
	};

	const handleCheckboxChange = (guildId: string, checked: boolean | 'indeterminate') => {
		setEditingGuildRestrictions(prev => ({
			...prev,
			[guildId]: !!checked && checked !== 'indeterminate'
		}));
	};

	const handleToggleGuildAccess = (guildId: string, isAccessible: boolean) => {
		if (!selectedUserIdForGuildView) return;
		if (isAccessible) {
			assignGuildToOwner.mutate({ id: selectedUserIdForGuildView, payload: { guildId } }, {
				onSuccess: () => {
					toast({
						title: "Guild Access Granted",
						description: "Guild access has been granted to the user.",
					});
				},
				onError: () => {
					toast({
						title: "Error",
						description: "Failed to grant guild access.",
						variant: "destructive",
					});
				}
			});
		} else {
			removeGuildFromOwner.mutate({ ownerId: selectedUserIdForGuildView, guildId }, {
				onSuccess: () => {
					toast({
						title: "Guild Access Revoked",
						description: "Guild access has been revoked from the user.",
					});
				},
				onError: () => {
					toast({
						title: "Error",
						description: "Failed to revoke guild access.",
						variant: "destructive",
					});
				}
			});
		}
	};

	const selectedUser = useMemo(() => {
		return allManageableUsers.find(u => u.id === selectedUserIdForGuildView);
	}, [selectedUserIdForGuildView, allManageableUsers]);

	const guildsForEditingPartner = useMemo(() => {
		if (!selectedUser || selectedUser.role !== 'AgencyPartner') return [];
		const partnerAgencyId = selectedUser.agencyId;
		return guilds.filter(g => g.agencyId === partnerAgencyId);
	}, [selectedUser, guilds]);

	const handleCreateUser = async (userData: {
		email: string;
		name: string;
		role: OwnerRole;
		password: string;
		agencyId?: string;
		guildId?: string;
	}) => {
		createUserMutation.mutate({ payload: userData }, {
			onSuccess: (newUser) => {
				// Add the new user to the local state
				setUsers(prev => [newUser, ...prev]);
				
				// If the user is assigned to an agency, update that agency's users list
				if (userData.agencyId) {
					setAgencies(prev => prev.map(agency => {
						if (agency.id === userData.agencyId) {
							return { 
								...agency, 
								owners: [...agency.owners, newUser] 
							};
						}
						return agency;
					}));
				}
				
				toast({
					title: "User created",
					description: `Successfully created user "${userData.name}"`,
				});
			}
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
			</div>
		);
	}

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<motion.div
				className="w-full min-h-screen bg-gray-50 p-6"
				variants={container}
				initial="hidden"
				animate="show"
			>
				<div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
					<Card className="mb-6 p-5">
						<h2 className="text-2xl font-bold mb-4">User Management</h2>
						<div className="py-4 flex flex-wrap gap-4 items-center">
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
							<Select value={selectedAgency} onValueChange={setSelectedAgency}>
								<SelectTrigger className="w-fit min-w-[150px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="All Agencies">All Agencies</SelectItem>
									{agencies?.map(agency => (
										<SelectItem key={agency.id} value={agency.id}>
											{agency.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<UserManagementTable
							users={filteredUsers}
							agencies={agencies}
							guilds={guilds}
							pagination={{
								currentPage: 1,
								totalPages: 1,
								itemsPerPage: filteredUsers.length,
								totalItems: filteredUsers.length
							}}
							isLoading={isLoading}
							onPageChange={() => {}}
							onPageSizeChange={() => {}}
							onToggleActive={handleToggleActive}
							onDelete={handleUserDelete}
							onUpdate={handleUserUpdate}
							onAssignAgency={handleAssignAgencyToUser}
							onRemoveAgency={handleRemoveUserFromAgency}
							onAssignGuild={handleAssignGuildToUser}
							onRemoveGuild={handleRemoveGuildFromUser}
							onRestrictGuilds={handleRestrictUserGuilds}
							onCreateUser={handleCreateUser}
							onReorderUsers={() => {}}
						/>
					</Card>

					<Card className="mb-6 p-0">
						<CardHeader>
							<h2 className="text-2xl font-bold mb-4">User Guild Access</h2>
							<CardTitle>View & Manage Guild Access</CardTitle>
							<CardDescription>Select a user to see which guilds they can access. Agency Partner access can be restricted.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
								<Label htmlFor="user-guild-select" className="font-medium whitespace-nowrap shrink-0">Select User:</Label>
								<Select
									value={selectedUserIdForGuildView ?? ""}
									onValueChange={(value) => {
										setSelectedUserIdForGuildView(value || null);
										if (isEditingRestrictions) {
											handleCancelEditingRestrictions();
										}
									}}
								>
									<SelectTrigger id="user-guild-select" className="w-full sm:max-w-xs">
										<SelectValue placeholder="Select a user..." />
									</SelectTrigger>
									<SelectContent>
										{allManageableUsers.map(user => (
											<SelectItem key={user.id} value={user.id}>
												{user.name} <span className="text-xs text-muted-foreground ml-1">({user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')})</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Separator className="my-4" />


							{!selectedUserIdForGuildView || !selectedUser ? (
								<p className="text-sm text-muted-foreground pt-2">Select a user to see their available guilds.</p>
							) : isEditingRestrictions && selectedUser.role === 'AgencyPartner' ? (
								<div className="p-4 border rounded-md bg-muted/30 space-y-3">
									<p className="text-sm font-medium">Select guilds <span className="font-semibold">{selectedUser.name}</span> can access:</p>
									<div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t border-b py-3 my-2">
										{guildsForEditingPartner.length > 0 ? (
											guildsForEditingPartner.map(guild => (
												<div key={guild.id} className="flex items-center space-x-3 ml-1">
													<Checkbox
														id={`restrict-${guild.id}`}
														checked={editingGuildRestrictions[guild.id] ?? false}
														onCheckedChange={(checked) => handleCheckboxChange(guild.id, checked)}
														aria-label={`Allow access to ${guild.name}`}
													/>
													<Label htmlFor={`restrict-${guild.id}`} className="font-normal text-sm cursor-pointer flex-grow">
														{guild.name}
													</Label>
												</div>
											))
										) : (
											<p className="text-sm text-muted-foreground italic px-1">This partner's agency has no guilds assigned.</p>
										)}
									</div>
									<div className="flex justify-end gap-2 pt-2">
										<Button variant="ghost" size="sm" onClick={handleCancelEditingRestrictions}>Cancel</Button>
										<Button size="sm" onClick={handleSaveRestrictions} disabled={guildsForEditingPartner.length === 0}>
											<Check className="h-4 w-4 mr-1.5" />
											Save Restrictions
										</Button>
									</div>
								</div>
							) : (
								<div className="pt-2 space-y-3">
									<div className="flex justify-between items-center mb-2 min-h-[32px]">
										<h4 className="font-medium text-base">
											{selectedUser.role === 'Client' ? 'Assigned Guild:' : 'Accessible Guilds:'}
										</h4>
										{selectedUser?.role === 'AgencyPartner' && guildsForEditingPartner.length > 0 && (
											<Button variant="outline" size="sm" onClick={() => handleStartEditingRestrictions(selectedUser.id)}>
												<Edit className="h-3.5 w-3.5 mr-1.5" />
												Edit Restrictions
											</Button>
										)}
									</div>
									{(() => {
										if (isLoadingGuildsForOwner) {
											return <p className="text-sm text-muted-foreground">Loading guilds...</p>;
										}
										
										switch (selectedUser.role) {
											case 'ADMIN':
												return <p className="text-sm text-muted-foreground italic">Admins have access to all guilds (cannot be restricted).</p>;
											case 'CLIENT':
												return guildsForOwner?.length || 0 > 0 ? (
													<Badge variant="outline">{guildsForOwner[0]?.name}</Badge>
												) : (
													<p className="text-sm text-muted-foreground italic">Client is not assigned to any guild.</p>
												);
											case 'AGENCY_PARTNER':
												return guildsForOwner?.length || 0 > 0 ? (
													<div className="flex flex-wrap gap-2">
														{availableGuildsForSelectedUser.map(guild => {
															const isAccessible = guildsForOwner?.some(g => g.id === guild.id);
															return (
																<Badge 
																	key={guild.id} 
																	variant={isAccessible ? "secondary" : "outline"}
																	className={isAccessible ? "" : "text-muted-foreground opacity-70"}
																>
																	{guild.name}
																	<Button
																		variant="ghost"
																		size="sm"
																		className="ml-2 p-0 h-4 w-4"
																		onClick={() => handleToggleGuildAccess(guild.id, !isAccessible)}
																		aria-label={isAccessible ? `Revoke access to ${guild.name}` : `Grant access to ${guild.name}`}
																	>
																		{isAccessible ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
																	</Button>
																</Badge>
															);
														})}
													</div>
												) : (
													<p className="text-sm text-muted-foreground">No guilds currently accessible based on agency assignment and restrictions.</p>
												);
											default:
												return <p className="text-sm text-muted-foreground">No guilds available or assigned to this user.</p>;
										}
									})()}
								</div>
							)}
						</CardContent>
					</Card>

					<AgencyStructure
						agencies={agencies}
						guilds={guilds}
						users={users}
						isLoading={isLoading}
						className="mb-6"
						onAddAgency={handleAddAgency}
						onUpdateAgency={handleUpdateAgency}
						onDeleteAgency={handleDeleteAgency}
						onAssignGuild={handleAssignGuildToAgency}
						onRemoveGuild={handleRemoveGuildFromAgency}
						onAssignUser={handleAssignUserToAgency}
						onRemoveUser={handleRemoveUserFromAgency}
					/>

					<GuildsManagement
						guilds={guilds}
						agencies={agencies}
						onUpdate={handleGuildUpdate}
						onDelete={handleGuildDelete}
						onAssignToAgency={handleAssignGuildToAgency}
						onRemoveFromAgency={handleRemoveGuildFromAgency}
						className="mb-6"
					/>
				</div>
			</motion.div>
		</DragDropContext>
	);
};

export default AdminPanel;