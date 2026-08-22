import { AuthContext, AccessMode } from '@ai-ctrl/contracts';
/**
 * Check if user has access to a specific client
 * CRITICAL: Empty authorizedClients = NO access (not unrestricted)
 */
export declare function canAccessClient(authContext: AuthContext, clientId: string): boolean;
/**
 * Check if user has a specific permission
 */
export declare function hasPermission(authContext: AuthContext, permission: string): boolean;
/**
 * Enforce READ-ONLY constraint
 * Throws error if operation is a write operation
 */
export declare function enforceReadOnly(operation: string): void;
/**
 * Check access mode is allowed for user
 */
export declare function canPerformAccessMode(authContext: AuthContext, mode: AccessMode, resource: string): boolean;
/**
 * Filter data array by authorized clients
 */
export declare function filterByAuthorizedClients<T extends {
    client?: string;
    clientId?: string;
}>(authContext: AuthContext, data: T[]): T[];
/**
 * Validate auth context is properly formed
 */
export declare function validateAuthContext(authContext: AuthContext): {
    valid: boolean;
    errors: string[];
};
