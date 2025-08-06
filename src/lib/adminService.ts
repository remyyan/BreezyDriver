// Admin service for managing admin permissions and utilities

// Simple admin check - in production, this should be more robust
const ADMIN_EMAILS = [
  'remyan.yc@gmail.com',
  // Add other admin emails here
];

export const isUserAdmin = (userEmail: string | null | undefined): boolean => {
  return userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
};

export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};

// Admin action types for logging
export type AdminAction = 
  | 'location_edited'
  | 'location_deleted'
  | 'review_edited'
  | 'review_deleted'
  | 'location_approved'
  | 'location_rejected';

export interface AdminLog {
  id?: string;
  action: AdminAction;
  adminUserId: string;
  adminEmail: string;
  targetId: string; // ID of the location/review that was modified
  targetType: 'location' | 'review';
  details?: string;
  timestamp: Date;
}

// Note: In a production app, you might want to:
// 1. Store admin roles in the database
// 2. Implement more granular permissions
// 3. Add admin action logging
// 4. Add audit trails
// 5. Implement role-based access control (RBAC)
