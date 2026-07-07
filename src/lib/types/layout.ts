/**
 * Gameplay Layout Types
 * 
 * Comprehensive type definitions for the layout access control system.
 */

/**
 * Component position and size (normalized 0.0-1.0)
 */
export interface ComponentTransform {
  x: number; // 0.0-1.0 normalized horizontal position
  y: number; // 0.0-1.0 normalized vertical position
  width: number; // 0.0-1.0 normalized width
  height: number; // 0.0-1.0 normalized height
}

/**
 * Single editable component configuration
 */
export interface EditableComponent {
  id: string;
  type: 'button' | 'display' | 'indicator' | 'status';
  position: ComponentTransform;
  properties?: Record<string, unknown>;
}

/**
 * Complete layout configuration
 * Serialized from HUD Studio editor state
 */
export interface LayoutConfig {
  components: Record<string, EditableComponent>;
  version: string; // Semantic version (e.g., "1.0.0")
  metadata?: {
    createdAt: string; // ISO timestamp
    createdBy?: string; // User ID or name
  };
}

/**
 * User's private layout record from database
 */
export interface UserLayout {
  id: string;
  userId: string;
  layoutJson: LayoutConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Global layout record (active version)
 */
export interface GlobalLayout {
  id: string;
  version: number;
  layoutJson: LayoutConfig;
  publishedBy: string;
  publishedAt: string;
  changeNotes?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Global layout history record (archived version)
 */
export interface GlobalLayoutHistory {
  id: string;
  layoutId?: string;
  version: number;
  layoutJson: LayoutConfig;
  publishedBy: string;
  publishedAt: string;
  changeNotes?: string;
  archivedAt: string;
  archivedBy?: string;
}

/**
 * Layout status for UI display
 * Resolved layout with metadata
 */
export interface LayoutStatus {
  source: 'private' | 'global' | 'default';
  layout: LayoutConfig;
  metadata: {
    version?: number;
    versionLabel?: string; // e.g., "v2.4"
    lastUpdated: string;
    publishedBy?: string;
  };
}

/**
 * User role
 */
export type UserRole = 'player' | 'admin' | 'platform_designer';

/**
 * User profile with role
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarId?: string;
  level: number;
  prestigeScore: number;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response types
 */

export interface GetActiveLayoutResponse {
  source: 'private' | 'global' | 'default';
  layout: LayoutConfig;
  metadata: {
    version?: number;
    versionLabel?: string;
    lastUpdated: string;
    publishedBy?: string;
  };
}

export interface PostUserLayoutRequest {
  layout: LayoutConfig;
}

export interface PostUserLayoutResponse {
  success: boolean;
  layoutId: string;
  message?: string;
}

export interface DeleteUserLayoutResponse {
  success: boolean;
  message?: string;
}

export interface PostGlobalLayoutRequest {
  layout: LayoutConfig;
  changeNotes?: string;
}

export interface PostGlobalLayoutResponse {
  success: boolean;
  version: number;
  layoutId: string;
  message?: string;
}

export interface GlobalLayoutVersionInfo {
  id: string;
  version: number;
  versionLabel: string;
  publishedBy: string;
  publishedAt: string;
  changeNotes?: string;
}

export interface GetGlobalHistoryResponse {
  versions: GlobalLayoutVersionInfo[];
}

export interface PostGlobalRestoreRequest {
  versionId: string;
  changeNotes?: string;
}

export interface PostGlobalRestoreResponse {
  success: boolean;
  newVersion: number;
  message?: string;
}

/**
 * Error response
 */
export interface ApiError {
  error: string;
  status: number;
  details?: Record<string, unknown>;
}
