# Admin Panel User & Guild Management Documentation

## Entity Relationships

1. **Agency (Organization)**
   - Contains multiple guilds and users
   - Manages access permissions for its users

2. **User**
   - Three user types: Admin, Agency Partner, Client
   - Can be associated with guilds and agencies based on role

3. **Guild**
   - Can be assigned to one or more agencies
   - Access is controlled through agency relationships

## Role-Based Access Control

### Admin Role
- Has complete access to all agencies and guilds in the system
- Can create, edit, or delete any agency or guild
- Access cannot be restricted for admins
- Can assign or remove guilds and users from any agency

### Agency Partner Role
- Can only be assigned to **one agency** at a time
- By default, has access to all guilds within their assigned agency
- Access to specific guilds can be limited via restrictions
- Cannot access guilds from other agencies
- Automatically loses access to guilds when removed from their agency

### Client Role
- Can only be assigned to **one specific guild**
- Has no access to agency management features
- Cannot have multiple guild assignments
- Does not belong to any agency

## Access Management Logic

1. **Adding Users to an Agency**
   - When a user is added to an agency, they automatically gain access to all guilds in that agency
   - If the agency has no guilds yet, user access will be updated when guilds are added later
   - Agency Partners added to an agency without guilds will have no guild access until guilds are added
   
2. **Adding Guilds to an Agency**
   - When a guild is added to an agency, all agency users automatically gain access to it
   - Admin users always have access to all guilds regardless of agency assignment
   - Guild visibility for Agency Partners depends on their restriction settings
   
3. **Restricting Guild Access for Agency Partners**
   - Agency Partners can have restricted access to specific guilds within their agency
   - Restrictions are managed through the "Edit Restrictions" feature
   - An Agency Partner must have access to at least one guild from their agency (cannot remove all access)
   
4. **Removing Entities**
   - When an agency is deleted:
     - All Agency Partners lose their connection to that agency
     - If an Agency Partner has no remaining agencies, their access is completely removed
   - When a guild is deleted:
     - Cannot delete a guild assigned to a Client
     - Access to that guild is automatically removed from all Agency Partners
   - When a user is deleted:
     - Cannot delete an Agency Partner while assigned to an agency (must remove from agency first)

## Guild Assignment Logic

1. **Guild Association**
   - Guilds can be assigned to multiple agencies simultaneously
   - Guild visibility is tracked via an `agencyIds` array that stores all agencies the guild belongs to

2. **Drag-and-Drop Interface**
   - Guilds can be dragged from the Guilds Management panel to Agency structures
   - The same guild can be assigned to multiple agencies without removing it from other agencies
   - Dragging a guild from one agency to another creates a copy of the guild in the destination

## Edge Cases

1. **Empty Agency Assignments**
   - Assigning a user to an agency with no guilds → user will gain access when guilds are added later
   - Assigning to an Agency Partner no guild restrictions→ no access to any guilds on analytics pages

2. **Deletion Restrictions**
   - Cannot delete an agency with assigned users or guilds
   - Cannot delete a guild that has Client users assigned to it
   - Cannot delete an Agency Partner while assigned to an agency (must remove from agency first)

3. **Agency Partner Restrictions**
   - Cannot remove all guild access for an Agency Partner (must have at least one guild)
   - When a guild is removed from an agency, it's automatically removed from all Agency Partners' access lists

4. **Role Transitions**
   - When changing a user's role to Agency Partner, the user must be assigned to an agency
   - When a user is converted to Client, they must be assigned to a 1 specific guild
