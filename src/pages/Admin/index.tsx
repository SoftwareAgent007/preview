import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllOwners, useGetAllGuilds, useUpdateOwnerRole, useAssignGuildToOwner, useRemoveGuildFromOwner, useToggleGuildActivityState, useGetAllAgencies, useCreateAgency, useUpdateAgency, useDeleteAgency, useAssignGuildToAgency, useRemoveGuildFromAgency } from "@/hooks/admin/useAdminData";
import { toast } from "@/hooks/use-toast";
import { Owner, Guild, User, Agency } from "@/types/dataTypes";
import { motion } from "framer-motion";
import { Edit, Trash2, Check, X } from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import GuildsManagement from "./components/GuildsManagement";
import AgencyStructure from "./components/OrganizationStructure";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import UserManagementTable from "./components/UserManagementTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Mock Data (Replace with actual data fetching)
const MOCK_USERS: User[] = [
	{ id: 'user-1', name: 'Alice Admin', email: 'alice@admin.com', role: 'Admin', isActive: true },
	{ id: 'user-2', name: 'Bob Partner', email: 'bob@agencya.com', role: 'AgencyPartner', isActive: true, agencyId: 'agency-1' },
	{ id: 'user-3', name: 'Charlie Client', email: 'charlie@client.com', role: 'Client', isActive: true, guildId: 'guild-1' },
	{ id: 'user-4', name: 'Diana Partner', email: 'diana@agencyb.com', role: 'AgencyPartner', isActive: true, agencyId: 'agency-2' },
	{ id: 'user-5', name: 'Ethan Client', email: 'ethan@client.com', role: 'Client', isActive: false, guildId: 'guild-3' },
	{ id: 'user-6', name: 'Fiona Free', email: 'fiona@free.com', role: 'AgencyPartner', isActive: true }, // Unassigned partner
];

const MOCK_GUILDS: Guild[] = [
	{ id: 'guild-1', name: 'Gaming Guild Alpha', agencyId: 'agency-1', isActive: true },
	{ id: 'guild-2', name: 'Art Guild Beta', agencyId: 'agency-1', isActive: true },
	{ id: 'guild-3', name: 'Music Guild Gamma', agencyId: 'agency-2', isActive: false },
	{ id: 'guild-4', name: 'Dev Guild Delta', isActive: true }, // Unassigned guild
];

const MOCK_AGENCIES: Agency[] = [
	{
		id: 'agency-1',
		name: 'Creative Agency A',
		users: MOCK_USERS.filter(u => u.agencyId === 'agency-1'),
		guilds: MOCK_GUILDS.filter(g => g.agencyId === 'agency-1'),
	},
	{
		id: 'agency-2',
		name: 'Marketing Agency B',
		users: MOCK_USERS.filter(u => u.agencyId === 'agency-2'),
		guilds: MOCK_GUILDS.filter(g => g.agencyId === 'agency-2'),
	},
];


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

	// const { data: owners, isLoading: isLoadingOwners } = useGetAllOwners();
	// const { data: guildsData, isLoading: isLoadingGuilds } = useGetAllGuilds();
	// const { data: agenciesData, isLoading: isLoadingAgencies } = useGetAllAgencies();
	// const updateOwnerRole = useUpdateOwnerRole();
	// const assignGuildToOwner = useAssignGuildToOwner();
	// const removeGuildFromOwner = useRemoveGuildFromOwner();
	// const toggleGuildActivityState = useToggleGuildActivityState();
	// const createAgencyMutation = useCreateAgency();
	// const updateAgencyMutation = useUpdateAgency();
	// const deleteAgencyMutation = useDeleteAgency();
	// const assignGuildToAgencyMutation = useAssignGuildToAgency();
	// const removeGuildFromAgencyMutation = useRemoveGuildFromAgency();

	// Use mock data for now
	const [mockUsers, setMockUsers] = useState<User[]>(MOCK_USERS);
	const [agencies, setAgencies] = useState<Agency[]>(MOCK_AGENCIES);
	const [guilds, setGuilds] = useState<Guild[]>(MOCK_GUILDS);
	const isLoading = false; // Set to false when using mock data

	const roleOptions = ["All Roles", "Admin", "AgencyPartner", "Client"];

	const filteredUsers = React.useMemo(() => {
		return mockUsers.filter(user => {
			const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
			const matchesAgency = selectedAgency === "All Agencies" ||
				(user as any).agencyId === selectedAgency ||
				user.role === 'Admin'; // Admins are always shown regardless of agency filter

			return matchesSearch && matchesRole && matchesAgency;
		});
	}, [mockUsers, searchTerm, selectedRole, selectedAgency]);

	// Recalculate User Guild Access whenever dependencies change
	useEffect(() => {
		const calculateUserGuildAccess = (): UserGuildAccess => {
			const accessMap: UserGuildAccess = {};

			const allUsersWithAgencyId = [
				...mockUsers,
				...agencies.flatMap(a =>
					a.users.map(u => ({
						...u,
						agencyId: a.id
					}))
				)
			];

			const uniqueUsers = Array.from(new Map(allUsersWithAgencyId.map(u => [u.id, u])).values());

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
		setUserGuildAccess(newAccessMap);

	}, [mockUsers, agencies, guilds]);

	// User Management Handlers
	const handleUserUpdate = (updatedUser: User) => {
		setMockUsers(prev => prev.map(user =>
			user.id === updatedUser.id ? updatedUser : user
		));
		// Also update user if they are within an agency
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.users.map(u => u.id === updatedUser.id ? updatedUser : u)
		})));
		toast({
			title: "User updated",
			description: `Successfully updated user ${updatedUser.name}`,
		});
	};

	const handleUserDelete = async (userId: string): Promise<boolean> => {
		const user = allManageableUsers.find(u => u.id === userId); // Check combined list
		if (!user) return false;

		// Prevent deleting AgencyPartner if they are still assigned to an agency
		if (user.role === 'AgencyPartner' && (user as any).agencyId) {
			const isInAgency = agencies.some(a => a.users.some(u => u.id === userId));
			if (isInAgency) {
				toast({
					title: "Deletion Restricted",
					description: "Cannot delete Agency Partner while assigned to an agency. Remove from agency first.",
					variant: "destructive",
				});
				return false;
			}
		}

		// Remove from top-level list
		setMockUsers(prev => prev.filter(user => user.id !== userId));
		// Remove from any agency list
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.users.filter(u => u.id !== userId)
		})));

		toast({
			title: "User deleted",
			description: "Successfully deleted user",
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

	// Agency Management Handlers
	const handleAddAgency = (agencyData: Omit<Agency, 'id' | 'users' | 'guilds'>) => {
		const newAgency: Agency = {
			...agencyData,
			id: `agency-${Date.now()}`, // Simple unique ID generation
			users: [],
			guilds: []
		};
		setAgencies(prev => [...prev, newAgency]);
		toast({ title: "Agency Added", description: `Agency "${newAgency.name}" created.` });
	};

	const handleUpdateAgency = (updatedAgency: Agency) => {
		setAgencies(prev => prev.map(agency =>
			agency.id === updatedAgency.id ? updatedAgency : agency
		));
		toast({ title: "Agency Updated", description: `Agency "${updatedAgency.name}" updated.` });
	};

	const handleDeleteAgency = async (agencyId: string): Promise<boolean> => {
		const agency = agencies.find(a => a.id === agencyId);
		if (!agency) return false;

		if (agency.users.length > 0 || agency.guilds.length > 0) {
			toast({
				title: "Deletion Restricted",
				description: "Cannot delete agency with assigned users or guilds.",
				variant: "destructive",
			});
			return false;
		}

		setAgencies(prev => prev.filter(a => a.id !== agencyId));
		toast({ title: "Agency Deleted", description: `Agency "${agency.name}" deleted.` });
		return true;
	};

	const handleAssignGuildToAgency = (agencyId: string, guildId: string) => {
		const guild = guilds.find(g => g.id === guildId);
		if (!guild) return;

		// Update guild's agencyId
		setGuilds(prev => prev.map(g =>
			g.id === guildId ? { ...g, agencyId } : g
		));

		// Update agency's guilds list (add) and remove from others
		setAgencies(prev => prev.map(agency => {
			if (agency.id === agencyId) {
				// Add to target agency if not already present
				if (!agency.guilds.some(g => g.id === guildId)) {
					return { ...agency, guilds: [...agency.guilds, { ...guild, agencyId }] };
				}
			} else {
				// Remove from other agencies
				return { ...agency, guilds: agency.guilds.filter(g => g.id !== guildId) };
			}
			return agency;
		}));

		toast({ title: "Guild Assigned", description: `Guild "${guild.name}" assigned to agency.` });
	};

	const handleRemoveGuildFromAgency = (agencyId: string, guildId: string) => {
		const guild = guilds.find(g => g.id === guildId);
		if (!guild) return;

		// Remove guild's agencyId reference
		setGuilds(prev => prev.map(g =>
			g.id === guildId ? { ...g, agencyId: undefined } : g
		));

		// Remove guild from the specific agency's list
		setAgencies(prev => prev.map(agency =>
			agency.id === agencyId
				? { ...agency, guilds: agency.guilds.filter(g => g.id !== guildId) }
				: agency
		));

		// Also remove guild from any agency partner's restricted list within that agency
		setMockUsers(prev => prev.map(user => {
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
			users: agency.users.map(user => {
				if (user.role === 'AgencyPartner' && user.id === user.id) { // Check user within the agency
					return {
						...user,
						restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
					};
				}
				return user;
			})
		})));


		toast({ title: "Guild Removed", description: `Guild "${guild.name}" removed from agency.` });
	};

	const handleAssignUserToAgency = (userId: string, agencyId: string) => {
		const user = allManageableUsers.find(u => u.id === userId); // Find from combined list
		if (!user || user.role === 'Admin' || user.role === 'Client') {
			toast({ title: "Assignment Restricted", description: "Only Agency Partners can be assigned to agencies.", variant: "destructive" });
			return;
		}

		const targetAgency = agencies.find(a => a.id === agencyId);
		if (!targetAgency) return;

		// Remove user from their current agency, if any
		const currentAgencyId = (user as any).agencyId;
		if (currentAgencyId && currentAgencyId !== agencyId) {
			setAgencies(prev => prev.map(agency => {
				if (agency.id === currentAgencyId) {
					return { ...agency, users: agency.users.filter(u => u.id !== userId) };
				}
				return agency;
			}));
		}

		// Remove user from the top-level mockUsers list (they now belong *in* the agency)
		setMockUsers(prev => prev.filter(u => u.id !== userId));

		// Add user to the target agency's user list (if not already there)
		setAgencies(prev => prev.map(agency => {
			if (agency.id === agencyId) {
				if (!agency.users.some(u => u.id === userId)) {
					// Add agencyId and reset restrictions when assigning
					return { ...agency, users: [...agency.users, { ...user, agencyId: agencyId, restrictedGuildIds: undefined }] };
				}
			}
			return agency;
		}));

		toast({ title: "User Assigned", description: `User "${user.name}" assigned to agency "${targetAgency.name}".` });
	};

	const handleAssignAgencyToUser = (userId: string, agencyId: string) => {
		// This function seems redundant if handleAssignUserToAgency moves the user *into* the agency object.
		// If the model keeps users separate and just links via agencyId, this would be used.
		// For the current model (moving user into agency.users), this might not be needed.
		// Let's keep the logic from the prompt for now, but it might need adjustment based on the final data structure.
		setMockUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, agencyId } : u
		));
		// If the user is also in an agency's list, update it there too.
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.users.map(u => u.id === userId ? { ...u, agencyId } : u)
		})));
	};

	const handleRemoveUserFromAgency = (userId: string, agencyId: string) => {
		const agency = agencies.find(a => a.id === agencyId);
		if (!agency) return;

		const user = agency.users.find(u => u.id === userId);
		if (!user) return; // User not found in this agency's list

		// Add user back to the top-level mockUsers list, removing agency-specific fields
		setMockUsers(prev => {
			// Avoid adding duplicates if user somehow exists in both places
			if (prev.some(u => u.id === userId)) {
				return prev.map(u => u.id === userId ? { ...user, agencyId: undefined, restrictedGuildIds: undefined } : u);
			}
			const updatedUsers = [...prev, { ...user, agencyId: undefined, restrictedGuildIds: undefined }];
			return updatedUsers.sort((a, b) => a.name.localeCompare(b.name));
		});

		// Remove user from the agency's user list
		setAgencies(prev => prev.map(a => {
			if (a.id === agencyId) {
				return { ...a, users: a.users.filter(u => u.id !== userId) };
			}
			return a;
		}));

		toast({
			title: "User Removed",
			description: `Successfully removed user "${user.name}" from agency "${agency.name}".`,
		});
	};


	const handleAssignGuildToUser = (userId: string, guildId: string) => {
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user || user.role !== 'Client') {
			toast({ title: "Assignment Restricted", description: "Only Clients can be assigned to a specific guild.", variant: "destructive" });
			return;
		}

		// Update in top-level list
		setMockUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, guildId } : u
		));
		// Update in agency list (though clients shouldn't be in agencies)
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.users.map(u => u.id === userId ? { ...u, guildId } : u)
		})));

		const guild = guilds.find(g => g.id === guildId);
		toast({ title: "Guild Assigned", description: `Client "${user.name}" assigned to guild "${guild?.name ?? guildId}".` });
	};

	const handleRemoveGuildFromUser = (userId: string, guildId: string) => {
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user || user.role !== 'Client') return; // Should only apply to clients

		// Update in top-level list
		setMockUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, guildId: undefined } : u
		));
		// Update in agency list
		setAgencies(prev => prev.map(agency => ({
			...agency,
			users: agency.users.map(u => u.id === userId ? { ...u, guildId: undefined } : u)
		})));

		const guild = guilds.find(g => g.id === guildId);
		toast({ title: "Guild Unassigned", description: `Guild "${guild?.name ?? guildId}" unassigned from client "${user.name}".` });
	};

	const handleRestrictUserGuilds = (userId: string, guildIds: string[]) => {
		// This function is now handled by handleSaveRestrictions
		// Kept here to satisfy the prop requirement for UserManagementTable if needed, but logic moved.
		console.warn("handleRestrictUserGuilds called, but logic is in handleSaveRestrictions");
	};

	// Guild Management Handlers
	const handleGuildUpdate = (updatedGuild: Guild) => {
		setGuilds(prev => prev.map(guild =>
			guild.id === updatedGuild.id ? updatedGuild : guild
		));

		// Update guild within any agency it might belong to
		setAgencies(prev => prev.map(agency => ({
			...agency,
			guilds: agency.guilds.map(g => g.id === updatedGuild.id ? updatedGuild : g)
		})));
		toast({ title: "Guild Updated", description: `Guild "${updatedGuild.name}" updated.` });
	};

	const handleGuildDelete = async (guildId: string): Promise<boolean> => {
		const guild = guilds.find(g => g.id === guildId);
		if (!guild) return false;

		// Check if any client is assigned to this guild
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

		// Remove guild from its agency, if any
		if (guild.agencyId) {
			setAgencies(prev => prev.map(agency => {
				if (agency.id === guild.agencyId) {
					return { ...agency, guilds: agency.guilds.filter(g => g.id !== guildId) };
				}
				return agency;
			}));
		}

		// Remove guild from any agency partner's restricted list
		setMockUsers(prev => prev.map(user => {
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
			users: agency.users.map(user => {
				if (user.role === 'AgencyPartner' && (user as any).restrictedGuildIds) {
					return {
						...user,
						restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
					};
				}
				return user;
			})
		})));


		// Remove guild from the main list
		setGuilds(prev => prev.filter(g => g.id !== guildId));
		toast({ title: "Guild Deleted", description: `Guild "${guild.name}" deleted.` });
		return true;
	};

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) {
			return;
		}

		const { source, destination, draggableId, type } = result;
		const sourceDroppableId = source.droppableId;
		const destDroppableId = destination.droppableId;

		// --- User Drag and Drop ---
		if (type === 'user') {
			const userId = draggableId.split('-')[0]; // Extract ID
			const user = allManageableUsers.find(u => u.id === userId);
			if (!user) return;

			// Dragging from Agency Users -> Users Table (Remove from Agency)
			if (sourceDroppableId.startsWith('agency-users-') && destDroppableId === 'users-table') {
				const sourceAgencyId = sourceDroppableId.replace('agency-users-', '');
				handleRemoveUserFromAgency(userId, sourceAgencyId);
			}
			// Dragging from Users Table -> Agency Users (Assign to Agency)
			else if (sourceDroppableId === 'users-table' && destDroppableId.startsWith('agency-users-')) {
				const destAgencyId = destDroppableId.replace('agency-users-', '');
				handleAssignUserToAgency(userId, destAgencyId);
			}
			// Dragging between Agency Users -> Agency Users (Move between Agencies)
			else if (sourceDroppableId.startsWith('agency-users-') && destDroppableId.startsWith('agency-users-')) {
				const sourceAgencyId = sourceDroppableId.replace('agency-users-', '');
				const destAgencyId = destDroppableId.replace('agency-users-', '');
				if (sourceAgencyId !== destAgencyId) {
					// Note: handleAssignUserToAgency already includes logic to remove from the old agency implicitly
					handleAssignUserToAgency(userId, destAgencyId);
					toast({ title: "User Moved", description: `Moved user "${user.name}" between agencies.` });
				}
			}
		}

		// --- Guild Drag and Drop ---
		if (type === 'guild') {
			const guildId = draggableId.split('-')[0]; // Extract ID
			const guild = guilds.find(g => g.id === guildId);
			if (!guild) return;

			// Dragging from Agency Guilds -> Guilds Table (Remove from Agency)
			if (sourceDroppableId.startsWith('agency-guilds-') && destDroppableId === 'guilds-table') {
				const sourceAgencyId = sourceDroppableId.replace('agency-guilds-', '');
				handleRemoveGuildFromAgency(sourceAgencyId, guildId);
			}
			// Dragging from Guilds Table -> Agency Guilds (Assign to Agency)
			else if (sourceDroppableId === 'guilds-table' && destDroppableId.startsWith('agency-guilds-')) {
				const destAgencyId = destDroppableId.replace('agency-guilds-', '');
				handleAssignGuildToAgency(destAgencyId, guildId);
			}
			// Dragging between Agency Guilds -> Agency Guilds (Move between Agencies)
			else if (sourceDroppableId.startsWith('agency-guilds-') && destDroppableId.startsWith('agency-guilds-')) {
				const sourceAgencyId = sourceDroppableId.replace('agency-guilds-', '');
				const destAgencyId = destDroppableId.replace('agency-guilds-', '');
				if (sourceAgencyId !== destAgencyId) {
					// Assigning to new agency implicitly handles removal from old one via setGuilds update
					handleAssignGuildToAgency(destAgencyId, guildId);
					toast({ title: "Guild Moved", description: `Moved guild "${guild.name}" between agencies.` });
				}
			}
		}
	};


	const getAvailableGuildsForUser = useCallback((userId: string | null): Guild[] => {
		if (!userId) return [];
		const accessibleGuildIds = userGuildAccess[userId] || [];
		return guilds.filter(guild => accessibleGuildIds.includes(guild.id));
	}, [userGuildAccess, guilds]);

	const availableGuildsForSelectedUser = useMemo(
		() => getAvailableGuildsForUser(selectedUserIdForGuildView),
		[selectedUserIdForGuildView, getAvailableGuildsForUser]
	);

	const allManageableUsers = useMemo(() => {
		const agencyUsers = agencies.flatMap(a =>
			a.users.map(u => ({
				...u,
				agencyId: a.id // Ensure agencyId is present
			}))
		);
		const combined = [...mockUsers, ...agencyUsers];
		const uniqueUsers = Array.from(new Map(combined.map(user => [user.id, user])).values());
		return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
	}, [mockUsers, agencies]);


	// Restriction Editing Handlers
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

		// Update in top-level mockUsers
		setMockUsers(prev => {
			const userIndex = prev.findIndex(u => u.id === selectedUserIdForGuildView && u.role === 'AgencyPartner');
			if (userIndex !== -1) {
				userFoundAndUpdated = true;
				const updatedUsers = [...prev];
				updatedUsers[userIndex] = { ...updatedUsers[userIndex], restrictedGuildIds: selectedGuildIds };
				return updatedUsers;
			}
			return prev;
		});

		// Update within agencies
		if (!userFoundAndUpdated) {
			setAgencies(prev => prev.map(agency => {
				const userIndex = agency.users.findIndex(u => u.id === selectedUserIdForGuildView && u.role === 'AgencyPartner');
				if (userIndex !== -1) {
					userFoundAndUpdated = true;
					const updatedUsers = [
						...agency.users.slice(0, userIndex),
						{ ...agency.users[userIndex], restrictedGuildIds: selectedGuildIds },
						...agency.users.slice(userIndex + 1),
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

	const selectedUser = useMemo(() => {
		return allManageableUsers.find(u => u.id === selectedUserIdForGuildView);
	}, [selectedUserIdForGuildView, allManageableUsers]);

	const guildsForEditingPartner = useMemo(() => {
		if (!selectedUser || selectedUser.role !== 'AgencyPartner') return [];
		const partnerAgencyId = (selectedUser as any).agencyId;
		return guilds.filter(g => g.agencyId === partnerAgencyId);
	}, [selectedUser, guilds]);

	if (isLoading) {
		return <div>Loading...</div>;
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
									{agencies.map(agency => (
										<SelectItem key={agency.id} value={agency.id}>
											{agency.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<UserManagementTable
							users={filteredUsers} // Pass the filtered list of top-level users
							agencies={agencies} // Pass agencies to allow selecting target agency
							guilds={guilds} // Pass guilds for client assignment
							pagination={{ // Basic pagination, adjust as needed
								currentPage: 1,
								totalPages: 1,
								itemsPerPage: filteredUsers.length,
								totalItems: filteredUsers.length
							}}
							isLoading={isLoading}
							onPageChange={() => {}} // Implement pagination logic if needed
							onPageSizeChange={() => {}} // Implement page size logic if needed
							onToggleActive={handleToggleActive}
							onDelete={handleUserDelete}
							onUpdate={handleUserUpdate}
							onAssignAgency={handleAssignAgencyToUser} // Use the correct handler
							onRemoveAgency={handleRemoveUserFromAgency} // Use the correct handler
							onAssignGuild={handleAssignGuildToUser}
							onRemoveGuild={handleRemoveGuildFromUser}
							onRestrictGuilds={handleRestrictUserGuilds} // Keep prop, logic moved
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
												{user.name} <span className="text-xs text-muted-foreground ml-1">({user.role})</span>
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
								<div className="pt-2 space-y-30">
									<div className="flex justify-between items-center mb-2 min-h-[32px]">
										<h4 className="font-medium text-base">
											{selectedUser.role === 'Client' ? 'Assigned Guild:' : 'Accessible Guilds:'}
										</h4>
										{selectedUser?.role === 'AgencyPartner' && guildsForEditingPartner.length > 0 && ( // Only show edit if partner has guilds in their agency
											<Button variant="outline" size="sm" onClick={() => handleStartEditingRestrictions(selectedUser.id)}>
												<Edit className="h-3.5 w-3.5 mr-1.5" />
												Edit Restrictions
											</Button>
										)}
									</div>
									{(() => {
										switch (selectedUser.role) {
											case 'Admin':
												return <p className="text-sm text-muted-foreground italic">Admins have access to all guilds (cannot be restricted).</p>;
											case 'Client':
												return availableGuildsForSelectedUser.length > 0 ? (
													<Badge variant="outline">{availableGuildsForSelectedUser[0].name}</Badge>
												) : (
													<p className="text-sm text-muted-foreground italic">Client is not assigned to any guild.</p>
												);
											case 'AgencyPartner':
												return availableGuildsForSelectedUser.length > 0 ? (
													<div className="flex flex-wrap gap-2">
														{availableGuildsForSelectedUser.map(guild => (
															<Badge key={guild.id} variant="secondary">{guild.name}</Badge>
														))}
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

					<h2 className="text-2xl font-bold mb-4 mt-8">Agency Management</h2>
					<AgencyStructure
						agencies={agencies}
						guilds={guilds} // Pass all guilds for assignment dropdowns
						users={mockUsers} // Pass unassigned users for assignment dropdowns
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

					<h2 className="text-2xl font-bold mb-4 mt-8">Guilds Management</h2>
					<GuildsManagement
						guilds={guilds} // Pass all guilds
						agencies={agencies} // Pass agencies for assignment dropdowns
						onUpdate={handleGuildUpdate}
						onDelete={handleGuildDelete}
						onAssignToAgency={handleAssignGuildToAgency} // Pass handler
						onRemoveFromAgency={handleRemoveGuildFromAgency} // Pass handler
						className="mb-6"
					/>
				</div>
			</motion.div>
		</DragDropContext>
	);
};

export default AdminPanel;