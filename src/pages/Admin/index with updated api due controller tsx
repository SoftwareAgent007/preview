// copy of component which set up due api
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllOwners, useGetAllGuilds, useUpdateOwnerRole, useAssignGuildToOwner, useRemoveGuildFromOwner, useToggleGuildActivityState } from "@/hooks/admin/useAdminData";
import { toast } from "@/hooks/use-toast";
import { Owner, Guild, User } from "@/types/dataTypes";
import { motion } from "framer-motion";
import { Edit, Trash2, Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import GuildsManagement from "./components/GuildsManagement";
import AgencyStructure from "./components/OrganizationStructure";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DragDropContext } from "react-beautiful-dnd";
import UserManagementTable from "./components/UserManagementTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Define the type for the user-guild access mapping
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
	const { data: guilds, isLoading: isLoadingGuilds } = useGetAllGuilds();
	const updateOwnerRole = useUpdateOwnerRole();
	const assignGuildToOwner = useAssignGuildToOwner();
	const removeGuildFromOwner = useRemoveGuildFromOwner();
	const toggleGuildActivityState = useToggleGuildActivityState();

	const [mockUsers, setMockUsers] = useState<User[]>(MOCK_USERS);
	const [agencies, setAgencies] = useState<Agency[]>(MOCK_AGENCIES);
	const [guilds, setGuilds] = useState<Guild[]>(MOCK_GUILDS);

	const roleOptions = ["All Roles", "Admin", "AgencyPartner", "Client"];

	const filteredUsers = React.useMemo(() => {
		return mockUsers.filter(user => {
			const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
			const matchesAgency = selectedAgency === "All Agencies" || 
				(user as any).agencyId === selectedAgency ||
				user.role === 'Admin';

			return matchesSearch && matchesRole && matchesAgency;
		});
	}, [mockUsers, searchTerm, selectedRole, selectedAgency]);

	const { isLoading } = useAdminData();

	// --- Recalculate User Guild Access whenever dependencies change ---
	useEffect(() => {
		const calculateUserGuildAccess = (): UserGuildAccess => {
			const accessMap: UserGuildAccess = {};

			// Combine users, ensuring agency users have agencyId attached
			const allUsersWithAgencyId = [
				...mockUsers, // Include base users (might have agencyId if defined there)
				...agencies.flatMap(a => // Get users from agencies
					a.users.map(u => ({ // Map each user within the agency
						...u,
						agencyId: a.id // Explicitly add the agencyId from the agency object
					}))
				)
			];

			// Ensure uniqueness - users from agencies list will overwrite those from mockUsers if IDs match
			const uniqueUsers = Array.from(new Map(allUsersWithAgencyId.map(u => [u.id, u])).values());

			uniqueUsers.forEach(user => {
				// Cast user to 'any' temporarily to access potentially added agencyId/guildId/restrictedGuildIds
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
						} else {
						}
						break;
					case 'AgencyPartner':
						const agencyPartnerAgencyId = userAny.agencyId; // Use the potentially added agencyId
						const agency = agencies.find(a => a.id === agencyPartnerAgencyId);
						if (agency) {
							const agencyGuildIds = guilds.filter(g => g.agencyId === agency.id).map(g => g.id);
							const restrictedGuildIds = userAny.restrictedGuildIds as string[] | undefined;
							if (restrictedGuildIds && restrictedGuildIds.length > 0) {
								// Filter agency guilds by the restricted list
								accessibleGuildIds = agencyGuildIds.filter(id => restrictedGuildIds.includes(id));
							} else {
								// Access to all guilds assigned to the agency
								accessibleGuildIds = agencyGuildIds;
							}
						} else {
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

	}, [mockUsers, agencies, guilds]); // Recalculate when users, agencies, or guilds change

	// User Management Handlers
	const handleUserUpdate = (updatedUser: User) => {
		setMockUsers(prev => prev.map(user => 
			user.id === updatedUser.id ? updatedUser : user
		));
		toast({
			title: "User updated",
			description: `Successfully updated user ${updatedUser.name}`,
		});
	};

	const handleUserDelete = async (userId: string) => {
		const user = mockUsers.find(u => u.id === userId);
		if (!user) return false;

		if (user.role === 'AgencyPartner') {
			const hasAgency = agencies.some(a => a.users.some(u => u.id === userId));
			if (hasAgency) {
				return false;
			}
		}

		setMockUsers(prev => prev.filter(user => user.id !== userId));
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
	const handleAddAgency = (agency: Omit<Agency, 'id'>) => {
		const newAgency: Agency = {
			...agency,
			id: Date.now().toString()
		};
		setAgencies(prev => [...prev, newAgency]);
	};

	const handleUpdateAgency = (updatedAgency: Agency) => {
		setAgencies(prev => prev.map(agency =>
			agency.id === updatedAgency.id ? updatedAgency : agency
		));
	};

	const handleDeleteAgency = async (agencyId: string) => {
		const agency = agencies.find(a => a.id === agencyId);
		if (!agency) return false;

		if (agency.users.length > 0 || agency.guilds.length > 0) {
			return false;
		}

		// Clear agencyId and restrictedGuildIds from agency partners
		setMockUsers(prev => prev.map(user => {
			if (user.role === 'AgencyPartner' && (user as any).agencyId === agencyId) {
				return {
					...user,
					agencyId: undefined,
					restrictedGuildIds: undefined
				};
			}
			return user;
		}));

		setAgencies(prev => prev.filter(a => a.id !== agencyId));
		return true;
	};

	const handleAssignGuildToAgency = (agencyId: string, guildId: string) => {
		const guild = guilds.find(g => g.id === guildId);
		if (!guild) return;

		// Update guild's agency
		setGuilds(prev => prev.map(g =>
			g.id === guildId ? { ...g, agencyId } : g
		));

		// Update agency's guilds
		setAgencies(prev => prev.map(agency =>
			agency.id === agencyId
				? { ...agency, guilds: [...agency.guilds, { ...guild, agencyId }] }
				: agency
		));

		// Update all agency partners' guild access
		setMockUsers(prev => prev.map(user => {
			if (user.role === 'AgencyPartner' && (user as any).agencyId === agencyId) {
				return {
					...user,
					restrictedGuildIds: (user as any).restrictedGuildIds || []
				};
			}
			return user;
		}));
	};

	const handleRemoveGuildFromAgency = (agencyId: string, guildId: string) => {
		// Remove guild's agency reference
		setGuilds(prev => prev.map(g =>
			g.id === guildId ? { ...g, agencyId: undefined } : g
		));

		// Remove guild from agency
		setAgencies(prev => prev.map(agency =>
			agency.id === agencyId
				? { ...agency, guilds: agency.guilds.filter(g => g.id !== guildId) }
				: agency
		));

		// Remove guild from all agency partners' restricted lists
		setMockUsers(prev => prev.map(user => {
			if (user.role === 'AgencyPartner' && (user as any).agencyId === agencyId) {
				return {
					...user,
					restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
				};
			}
			return user;
		}));
	};

	const handleAssignUserToAgency = (userId: string, agencyId: string) => {
		const user = mockUsers.find(u => u.id === userId);
		if (!user) return;

		// If the user is an agency partner and already has an agency, remove them from the old agency first
		if (user.role === 'AgencyPartner' && (user as any).agencyId) {
			const oldAgencyId = (user as any).agencyId;
			setAgencies(prev => prev.map(agency => {
				if (agency.id === oldAgencyId) {
					return { ...agency, users: agency.users.filter(u => u.id !== userId) };
				}
				return agency;
			}));
		}

		// Remove user from the user pool
		setMockUsers(prev => prev.filter(u => u.id !== userId));

		// Add user to agency
		setAgencies(prev => prev.map(agency =>
			agency.id === agencyId
				? { ...agency, users: [...agency.users, user] }
				: agency
		));
	};

	const handleAssignAgencyToUser = (userId: string, agencyId: string) => {
		setMockUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, agencyId } : u
		));
	};

	const handleRemoveUserFromAgency = (userId: string, agencyId: string) => {
		const agency = agencies.find(a => a.id === agencyId);
		if (!agency) return;

		const user = agency.users.find(u => u.id === userId);
		if (!user) return;

		// Add user back to the user pool without agency reference
		setMockUsers(prev => {
			const updatedUsers = [...prev, { ...user, agencyId: undefined, restrictedGuildIds: undefined }];
			return updatedUsers.sort((a, b) => a.name.localeCompare(b.name));
		});

		// Remove user from agency
		setAgencies(prev => prev.map(agency =>
			agency.id === agencyId
				? { ...agency, users: agency.users.filter(u => u.id !== userId) }
				: agency
		));

		toast({
			title: "User removed",
			description: `Successfully removed user from agency`,
		});
	};

	const handleAssignGuildToUser = (userId: string, guildId: string) => {
		const user = mockUsers.find(u => u.id === userId);
		if (!user) return;

		if (user.role === 'Client') {
			setMockUsers(prev => prev.map(u =>
				u.id === userId ? { ...u, guildId } : u
			));
		}
	};

	const handleRemoveGuildFromUser = (userId: string, guildId: string) => {
		const user = mockUsers.find(u => u.id === userId);
		if (!user) return;

		if (user.role === 'Client') {
			setMockUsers(prev => prev.map(u =>
				u.id === userId ? { ...u, guildId: undefined } : u
			));
		}
	};

	const handleRestrictUserGuilds = (userId: string, guildIds: string[]) => {
		const user = mockUsers.find(u => u.id === userId);
		if (!user || user.role !== 'AgencyPartner') return;

		setMockUsers(prev => prev.map(u =>
			u.id === userId ? { ...u, restrictedGuildIds: guildIds } : u
		));
	};

	// Guild Management Handlers
	const handleGuildUpdate = (updatedGuild: Guild) => {
		setGuilds(prev => prev.map(guild => 
			guild.id === updatedGuild.id ? updatedGuild : guild
		));

		// Update guild in agencies
		setAgencies(prev => prev.map(agency =>
			agency.id === updatedGuild.agencyId
				? {
						...agency,
						guilds: agency.guilds.map(g =>
							g.id === updatedGuild.id ? updatedGuild : g
						)
					}
				: agency
		));
	};

	const handleGuildDelete = async (guildId: string) => {
		const guild = guilds.find(g => g.id === guildId);
		if (!guild) return false;

		// Check if any client is using this guild
		const hasClients = mockUsers.some(u => 
			u.role === 'Client' && (u as any).guildId === guildId
		);

		if (hasClients) {
			return false;
		}

		// Remove guild from agencies
		setAgencies(prev => prev.map(agency => ({
			...agency,
			guilds: agency.guilds.filter(g => g.id !== guildId)
		})));

		// Remove guild from restricted lists
		setMockUsers(prev => prev.map(user => {
			if (user.role === 'AgencyPartner') {
				return {
					...user,
					restrictedGuildIds: ((user as any).restrictedGuildIds || []).filter((id: string) => id !== guildId)
				};
			}
			return user;
		}));

		setGuilds(prev => prev.filter(g => g.id !== guildId));
		return true;
	};

	const handleUserStatusChange = async (userId: string) => {
		setMockUsers(prev => prev.map(user => 
			user.id === userId ? { ...user, isActive: !user.isActive } : user
		));
		toast({
			title: "Success",
			description: "User status updated successfully"
		});
	};

	const handleEditUser = (user: User) => {
		// TODO: Implement edit functionality
	};

	const handleDeleteUser = (userId: string) => {
		setMockUsers(prev => prev.filter(user => user.id !== userId));
		toast({
			title: "Success",
			description: "User deleted successfully"
		});
	};

	const handleDragEnd = (result: any) => {
		if (!result.destination) {
			return;
		}

		const { source, destination, draggableId, type } = result;

		// Handle user drag and drop
		if (type === 'user') {
			const [userId, userName] = draggableId.split('-');

			// If dragging from agency to users table
			if (source.droppableId.startsWith('agency-users-') && destination.droppableId === 'users-table') {
				const sourceAgencyId = source.droppableId.replace('agency-users-', '');

				setMockUsers(prev => {
					const agency = agencies.find(a => a.id === sourceAgencyId);
					if (!agency) {
						return prev;
					}
				
					const user = agency.users.find(u => `${u.id}-${u.name}` === draggableId);
					if (!user) {
						return prev;
					}
				
					const updatedUsers = [...prev, { ...user, agencyId: undefined, restrictedGuildIds: undefined }];
					return updatedUsers.sort((a, b) => a.name.localeCompare(b.name));
				});
				
				setAgencies(prev => prev.map(agency => {
					if (agency.id === sourceAgencyId) {
						return { ...agency, users: agency.users.filter(u => `${u.id}-${u.name}` !== draggableId) };
					}
					return agency;
				}));
				return;
			}

			// If dragging from users table to an agency
			if (source.droppableId === 'users-table' && destination.droppableId.startsWith('agency-users-')) {
				const user = mockUsers.find(u => `${u.id}-${u.name}` === draggableId);
				if (!user) {
					return;
				}

				// Don't allow dragging admins
				if (user.role === 'Admin') {
					console.log('admin user', user);
					toast({
						title: "Action restricted",
						description: "Admin users cannot be assigned to agencies",
						variant: "destructive"
					});
					return;
				}

				// Don't allow dragging clients
				if (user.role === 'Client') {
					console.log('client user', user);
					toast({
						title: "Action restricted",
						description: "Client users cannot be assigned to agencies",
						variant: "destructive"
					});
					return;
				}

				const agencyId = destination.droppableId.replace('agency-users-', '');

				// If user is already in an agency, remove them first
				const currentAgency = agencies.find(a => a.users.some(u => `${u.id}-${u.name}` === draggableId));
				if (currentAgency) {
					handleRemoveUserFromAgency(userId, currentAgency.id);
				}

				// Assign user to the new agency
				handleAssignUserToAgency(userId, agencyId);
				
				toast({
					title: "User assigned",
					description: `Successfully assigned user to agency`,
				});
			}

			// If dragging between agencies
			if (source.droppableId.startsWith('agency-users-') && destination.droppableId.startsWith('agency-users-')) {
				const sourceAgencyId = source.droppableId.replace('agency-users-', '');
				const destAgencyId = destination.droppableId.replace('agency-users-', '');
				
				const sourceAgency = agencies.find(a => a.id === sourceAgencyId);
				const destAgency = agencies.find(a => a.id === destAgencyId);
				
				if (!sourceAgency || !destAgency) {
					return;
				}

				// Remove from source agency
				handleRemoveUserFromAgency(userId, sourceAgencyId);
				
				// Add to destination agency
				handleAssignUserToAgency(userId, destAgencyId);

				toast({
					title: "User moved",
					description: `Successfully moved user between agencies`,
				});
			}
		}

		// Handle guild drag and drop
		if (type === 'guild') {
			const [guildId, guildName] = draggableId.split('-');

			// If dragging from guilds table to an agency
			if (source.droppableId === 'guilds-table' && destination.droppableId.startsWith('agency-guilds-')) {
				const guild = guilds.find(g => `${g.id}-${g.name}` === draggableId);
				if (!guild) {
					return;
				}

				const agencyId = destination.droppableId.replace('agency-guilds-', '');

				// If guild is already in an agency, remove it first
				if (guild.agencyId) {
					handleRemoveGuildFromAgency(guildId, guild.agencyId);
				}

				// Assign guild to the new agency
				handleAssignGuildToAgency(agencyId, guildId);
				
				toast({
					title: "Guild assigned",
					description: `Successfully assigned guild to agency`,
				});
			}

			// If dragging between agencies
			if (source.droppableId.startsWith('agency-guilds-') && destination.droppableId.startsWith('agency-guilds-')) {
				const sourceAgencyId = source.droppableId.replace('agency-guilds-', '');
				const destAgencyId = destination.droppableId.replace('agency-guilds-', '');
				
				const sourceAgency = agencies.find(a => a.id === sourceAgencyId);
				const destAgency = agencies.find(a => a.id === destAgencyId);
				
				if (!sourceAgency || !destAgency) {
					return;
				}

				// Remove from source agency
				handleRemoveGuildFromAgency(guildId, sourceAgencyId);
				
				// Add to destination agency
				handleAssignGuildToAgency(destAgencyId, guildId);

				toast({
					title: "Guild moved",
					description: `Successfully moved guild between agencies`,
				});
			}
		}
	};

	// Helper function to get available guilds for a user - NOW USES THE STATE
	const getAvailableGuildsForUser = React.useCallback((userId: string | null): Guild[] => {
		if (!userId) return [];
		const accessibleGuildIds = userGuildAccess[userId] || [];
		// Filter the main guilds list based on the IDs from the access map
		return guilds.filter(guild => accessibleGuildIds.includes(guild.id));
	}, [userGuildAccess, guilds]); // Dependency is now the access map and guilds list

	const availableGuilds = React.useMemo(
		() => getAvailableGuildsForUser(selectedUserIdForGuildView),
		[selectedUserIdForGuildView, getAvailableGuildsForUser]
	);

	// Combine users from mockUsers and agencies, ensuring agency users have agencyId
	const allManageableUsers = React.useMemo(() => {
		const agencyUsers = agencies.flatMap(a =>
			a.users.map(u => ({
				...u,
				agencyId: a.id // Add agencyId from the parent agency
			}))
		);
		// Filter out duplicates if a user exists in both lists (shouldn't happen with current logic, but good practice)
		const combined = [...mockUsers, ...agencyUsers];
		const uniqueUsers = Array.from(new Map(combined.map(user => [user.id, user])).values());
		return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
	}, [mockUsers, agencies]);


	// --- Restriction Editing Handlers ---
	const handleStartEditingRestrictions = (userId: string) => {
		const user = allManageableUsers.find(u => u.id === userId);
		if (!user || user.role !== 'AgencyPartner') return;

		const partnerAgencyId = (user as any).agencyId;
		const agency = agencies.find(a => a.id === partnerAgencyId);
		if (!agency) return; // Should not happen if agencyId is set

		// Get all guilds belonging to this partner's agency
		const agencyGuilds = guilds.filter(g => g.agencyId === agency.id);
		const currentRestrictions = (user as any).restrictedGuildIds as string[] | undefined;

		const initialSelection: Record<string, boolean> = {};
		agencyGuilds.forEach(guild => {
			// If restrictions exist, check if this guild is included.
			// If NO restrictions exist (undefined or empty array), the user has access to ALL agency guilds, so check it.
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

		// Get the list of guild IDs where the checkbox is checked
		const selectedGuildIds = Object.entries(editingGuildRestrictions)
			.filter(([_, isSelected]) => isSelected)
			.map(([guildId, _]) => guildId);

		// Prevent Agency Partner from having zero guilds selected if their agency has guilds assigned
		// `guildsForEditingPartner` holds the list of guilds belonging to this partner's agency.
		if (selectedUser.role === 'AgencyPartner' && guildsForEditingPartner.length > 0 && selectedGuildIds.length === 0) {
			toast({
				title: "Cannot Remove All Guild Access",
				description: "An Agency Partner must have access to at least one guild from their assigned agency.",
				variant: "destructive", // Use destructive variant for errors
			});
			return; // Stop the save operation
		}

		// Find the user (can be in mockUsers or inside an agency.users) and update
		let userFoundAndUpdated = false;

		// Try updating in top-level mockUsers first
		setMockUsers(prev => {
			const userIndex = prev.findIndex(u => u.id === selectedUserIdForGuildView && u.role === 'AgencyPartner');
			if (userIndex !== -1) {
				userFoundAndUpdated = true;
				const updatedUsers = [...prev];
				updatedUsers[userIndex] = { ...updatedUsers[userIndex], restrictedGuildIds: selectedGuildIds };
				return updatedUsers;
			}
			return prev; // No change if not found here
		});

		// If not found/updated in mockUsers, check within agencies
		if (!userFoundAndUpdated) {
			setAgencies(prev => prev.map(agency => {
				const userIndex = agency.users.findIndex(u => u.id === selectedUserIdForGuildView && u.role === 'AgencyPartner');
				if (userIndex !== -1) {
					userFoundAndUpdated = true; // Mark as found and updated
					const updatedUsers = [
						...agency.users.slice(0, userIndex),
						{ ...agency.users[userIndex], restrictedGuildIds: selectedGuildIds },
						...agency.users.slice(userIndex + 1),
					];
					return { ...agency, users: updatedUsers };
				}
				return agency; // No change needed for this agency
			}));
		}

		// Only show success toast and reset state if the user was actually found and updated
		if (userFoundAndUpdated) {
			toast({
				title: "Restrictions updated",
				description: "User guild access restrictions saved successfully.",
			});
			setIsEditingRestrictions(false);
			setEditingGuildRestrictions({});
		} else {
			// This might happen if the selected user somehow disappeared between selection and save,
			// or if the selected user wasn't an Agency Partner (though the check above should prevent saving).
			console.error("handleSaveRestrictions: Failed to find Agency Partner to update:", selectedUserIdForGuildView);
			toast({
				title: "Update Failed",
				description: "Could not find the specified Agency Partner to update restrictions.",
				variant: "destructive",
			});
			// Consider if you want to reset the editing state even on failure
			// setIsEditingRestrictions(false);
			// setEditingGuildRestrictions({});
		}
	};

	const handleCheckboxChange = (guildId: string, checked: boolean | 'indeterminate') => {
		setEditingGuildRestrictions(prev => ({
			...prev,
			[guildId]: !!checked && checked !== 'indeterminate' // Store true only if checked, not indeterminate
		}));
	};
	// -------------------------------------

	// Find the currently selected user object
	const selectedUser = React.useMemo(() => {
		return allManageableUsers.find(u => u.id === selectedUserIdForGuildView);
	}, [selectedUserIdForGuildView, allManageableUsers]);

	// Get all guilds for the selected AgencyPartner's agency (used for editing)
	const guildsForEditingPartner = React.useMemo(() => {
		if (!selectedUser || selectedUser.role !== 'AgencyPartner') return [];
		const partnerAgencyId = (selectedUser as any).agencyId;
		return guilds.filter(g => g.agencyId === partnerAgencyId);
	}, [selectedUser, guilds, agencies]);

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
						/>
					</Card>

					{/* User Guild Access Section */}
					<Card className="mb-6 p-0">
						<CardHeader>
							<h2 className="text-2xl font-bold mb-4">User Guild Access</h2>
							<CardTitle>View & Manage Guild Access</CardTitle> {/* Slightly updated title */}
							<CardDescription>Select a user to see which guilds they can access. Agency Partner access can be restricted.</CardDescription> {/* Added description */}
						</CardHeader>
						<CardContent>
							{/* User Selection */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
								<Label htmlFor="user-guild-select" className="font-medium whitespace-nowrap shrink-0">Select User:</Label>
								<Select
									value={selectedUserIdForGuildView ?? ""}
									onValueChange={(value) => {
										setSelectedUserIdForGuildView(value || null);
										// Reset editing state when user changes
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
												{user.name} <span className="text-xs text-muted-foreground ml-1">({user.role})</span> {/* Use theme color */}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Separator className="my-4" />

							{/* Guild Access Display/Edit Area */}
							{!selectedUserIdForGuildView || !selectedUser ? (
								<p className="text-sm text-muted-foreground pt-2">Select a user to see their available guilds.</p>
							) : isEditingRestrictions && selectedUser.role === 'AgencyPartner' ? (
								// --- Editing Restrictions UI ---
								<div className="p-4 border rounded-md bg-muted/30 space-y-3"> {/* Use theme color */}
									<p className="text-sm font-medium">Select guilds <span className="font-semibold">{selectedUser.name}</span> can access:</p>
									<div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-t border-b py-3 my-2"> {/* Increased max-height */}
										{guildsForEditingPartner.length > 0 ? (
											guildsForEditingPartner.map(guild => (
												<div key={guild.id} className="flex items-center space-x-3 ml-1"> {/* Indent slightly */}
													<Checkbox
														id={`restrict-${guild.id}`}
														checked={editingGuildRestrictions[guild.id] ?? false}
														onCheckedChange={(checked: boolean) => handleCheckboxChange(guild.id, checked)}
														aria-label={`Allow access to ${guild.name}`}
													/>
													<Label htmlFor={`restrict-${guild.id}`} className="font-normal text-sm cursor-pointer flex-grow"> {/* Added flex-grow */}
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
								// --- Display View ---
								<div className="pt-2 space-y-30">
									<div className="flex justify-between items-center mb-2 min-h-[32px]"> {/* Ensure min-height for alignment */}
										<h4 className="font-medium text-base">
											{selectedUser.role === 'Client' ? 'Assigned Guild:' : 'Accessible Guilds:'}
										</h4>
										{selectedUser?.role === 'AgencyPartner' && availableGuilds.length > 0 && (
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
												return availableGuilds.length > 0 ? (
													<Badge variant="outline">{availableGuilds[0].name}</Badge>
												) : (
													<p className="text-sm text-muted-foreground italic">Client is not assigned to any guild.</p>
												);
											case 'AgencyPartner':
												return availableGuilds.length > 0 ? (
													<div className="flex flex-wrap gap-2">
														{availableGuilds.map(guild => (
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

					{/* Agency Management Section */}
					<h2 className="text-2xl font-bold mb-4 mt-8">Agency Management</h2> {/* Added margin-top */}
					<AgencyStructure 
						agencies={agencies}
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

					{/* Guilds Management Section */}
					<h2 className="text-2xl font-bold mb-4 mt-8">Guilds Management</h2> {/* Added margin-top */}
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