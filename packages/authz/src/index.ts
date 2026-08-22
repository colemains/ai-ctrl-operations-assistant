import { AuthContext, AccessMode } from '@ai-ctrl/contracts';

/**
 * Check if user has access to a specific client
 * CRITICAL: Empty authorizedClients = NO access (not unrestricted)
 */
export function canAccessClient(authContext: AuthContext, clientId: string): boolean {
  // Empty authorizedClients array means NO client access
  if (!authContext.authorizedClients || authContext.authorizedClients.length === 0) {
    return false;
  }
  
  // Check if user has access to specific client or wildcard
  return authContext.authorizedClients.includes(clientId) || 
         authContext.authorizedClients.includes('*');
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(authContext: AuthContext, permission: string): boolean {
  if (!authContext.permissions || authContext.permissions.length === 0) {
    return false;
  }
  
  return authContext.permissions.includes(permission) || 
         authContext.permissions.includes('*');
}

/**
 * Enforce READ-ONLY constraint
 * Throws error if operation is a write operation
 */
export function enforceReadOnly(operation: string): void {
  const readOnlyOps = ['read', 'query', 'search', 'list', 'get', 'view', 'fetch', 'retrieve'];
  const writeOps = ['write', 'update', 'delete', 'create', 'modify', 'execute', 'restart', 'deploy', 'merge', 'rotate'];
  
  const normalizedOp = operation.toLowerCase();
  
  // Check if operation contains any write keywords
  if (writeOps.some(op => normalizedOp.includes(op))) {
    throw new Error(
      `OPERATION DENIED: '${operation}' is a write operation. ` +
      `This system is READ-ONLY. Only query/read operations are allowed.`
    );
  }
}

/**
 * Check access mode is allowed for user
 */
export function canPerformAccessMode(
  authContext: AuthContext,
  mode: AccessMode,
  resource: string
): boolean {
  // READ is always allowed if user has the permission
  if (mode === 'read') {
    return hasPermission(authContext, `${resource}:read`);
  }
  
  // WRITE operations are NEVER allowed (READ-ONLY system)
  if (mode === 'write' || mode === 'delete') {
    return false;
  }
  
  // ADMIN requires explicit permission
  if (mode === 'admin') {
    return hasPermission(authContext, `${resource}:admin`) || 
           hasPermission(authContext, 'admin');
  }
  
  return false;
}

/**
 * Filter data array by authorized clients
 */
export function filterByAuthorizedClients<T extends { client?: string; clientId?: string }>(
  authContext: AuthContext,
  data: T[]
): T[] {
  return data.filter(item => {
    const clientId = item.clientId || item.client;
    if (!clientId) return false;
    return canAccessClient(authContext, clientId);
  });
}

/**
 * Validate auth context is properly formed
 */
export function validateAuthContext(authContext: AuthContext): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!authContext.userId) {
    errors.push('Missing userId');
  }
  
  if (!authContext.email) {
    errors.push('Missing email');
  }
  
  if (!authContext.role) {
    errors.push('Missing role');
  }
  
  if (!authContext.discipline) {
    errors.push('Missing discipline');
  }
  
  if (!Array.isArray(authContext.authorizedClients)) {
    errors.push('authorizedClients must be an array');
  }
  
  if (!Array.isArray(authContext.permissions)) {
    errors.push('permissions must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}