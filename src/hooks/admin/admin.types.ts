// Note: These types are derived from the admin.service.ts usage and provided DTOs.
// Address potential discrepancies with your actual Prisma schema.

// --- Enums ---

export enum OwnerRole {
  ADMIN = 'ADMIN',
  AGENCY_PARTNER = 'AGENCY_PARTNER',
  CLIENT = 'CLIENT',
  // Add other roles if they exist
}

// --- Core Entities ---

export interface Agency {
  id: string;
  name: string;
  description?: string | null; // Added based on DTOs
  // Add other agency fields if needed
}

export interface Guild {
  id: string;
  name: string;
  active: boolean;
  // Add other guild fields if needed
}

export interface OwnerGuild {
  guildId: string;
  assignedAt: string; // Assuming ISO date string
  guild: Guild;
}

export interface Owner {
  id: string;
  email: string;
  name: string;
  role: OwnerRole;
  createdAt: string; // Assuming ISO date string
  updatedAt: string; // Assuming ISO date string
  agencyId?: string | null;
  agency?: Agency | null;
  ownerGuilds?: OwnerGuild[];
}

// --- Payload/DTO Types ---

// Owner/User related
export interface UpdateOwnerRolePayload {
  role: OwnerRole;
  agencyId?: string; // Optional, but might be required depending on role change logic
}

export interface RegisterDto {
  email: string;
  password: string; // Note: Password shouldn't typically be part of the Owner interface returned by API
  name?: string;
  agencyId?: string; // UUID string
  role?: OwnerRole; // Use the enum
}

// Guild related
export interface AssignGuildPayload { // For assigning guild to OWNER
  guildId: string;
}

export interface ToggleGuildStatePayload {
  active: boolean;
}

// Agency related
export interface CreateAgencyDto {
  name: string;
  description?: string;
}

export interface UpdateAgencyDto {
  name?: string;
  description?: string;
}

export interface AssignAgencyGuildDto { // For assigning guild to AGENCY
  guildId: string;
}


// --- Response Types ---

export interface SuccessResponse {
  success: boolean;
  message?: string; // Optional message often included
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}