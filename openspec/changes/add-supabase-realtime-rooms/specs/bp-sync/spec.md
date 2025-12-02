## ADDED Requirements

### Requirement: Real-time BP Synchronization
The system SHALL implement real-time synchronization of BP (Ban/Pick) status.

#### Scenario: BP Update Real-time Sync
- **WHEN** a room owner modifies hero selection status
- **THEN** all users in the room SHALL immediately see the update
- **AND** the interface SHALL display sync status indicator
- **AND** updates SHALL include selected heroes, search filters, classification modes, etc.

#### Scenario: Join Room BP State Load
- **WHEN** a user joins an existing room
- **THEN** the system SHALL immediately load current BP status
- **AND** SHALL display all hero selections set by the room creator
- **AND** SHALL apply the same search and classification settings

#### Scenario: Conflict Resolution
- **WHEN** multiple room owners attempt to edit simultaneously (exception case)
- **THEN** the system SHALL adopt last-write-wins strategy
- **AND** SHALL log conflicts for debugging
- **AND** SHALL notify users that a sync conflict occurred

### Requirement: Permission Control
The system SHALL strictly control BP editing permissions.

#### Scenario: Owner Edit Permission
- **WHEN** a room owner operates within a room
- **THEN** they SHALL be able to modify all hero selection status
- **AND** SHALL be able to change search and classification settings
- **AND** SHALL be able to reset all selections

#### Scenario: Participant Read-only Access
- **WHEN** a regular participant views a room
- **THEN** they SHALL be able to view all BP status
- **AND** SHALL be able to use search and classification functions
- **BUT** SHALL NOT be able to modify any hero selection status
- **AND** edit controls SHALL display as disabled

#### Scenario: Permission UI Indication
- **WHEN** a user enters a room
- **THEN** the interface SHALL clearly display the user's permission level
- **AND** room owners SHALL see "Edit Mode" indicator
- **AND** participants SHALL see "View Mode" indicator

### Requirement: Offline Fallback
The system SHALL provide reasonable user experience during network interruptions.

#### Scenario: Network Disconnection
- **WHEN** a user's network connection is interrupted
- **THEN** the system SHALL display offline status indicator
- **AND** SHALL cache the last known BP status
- **AND** SHALL allow users to continue viewing but not editing

#### Scenario: Network Reconnection
- **WHEN** network connection is restored
- **THEN** the system SHALL automatically reconnect to the room
- **AND** SHALL synchronize the latest BP status
- **AND** SHALL apply conflict resolution strategy if conflicts exist

### Requirement: Data Persistence
The system SHALL ensure reliable persistence of BP data.

#### Scenario: Auto-save
- **WHEN** any BP status changes
- **THEN** the system SHALL immediately save to Supabase database
- **AND** SHALL display save success confirmation
- **AND** SHALL provide retry mechanism on failure

#### Scenario: Room Export/Import
- **WHEN** a room owner needs to backup or share BP configuration
- **THEN** they SHALL be able to export current BP status as JSON format
- **AND** SHALL be able to import previously exported configurations
- **AND** SHALL validate data format and prompt for conflicts during import