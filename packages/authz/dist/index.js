"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessClient = canAccessClient;
exports.hasPermission = hasPermission;
exports.enforceReadOnly = enforceReadOnly;
exports.canPerformAccessMode = canPerformAccessMode;
exports.filterByAuthorizedClients = filterByAuthorizedClients;
exports.validateAuthContext = validateAuthContext;
/**
 * Check if user has access to a specific client
 * CRITICAL: Empty authorizedClients = NO access (not unrestricted)
 */
function canAccessClient(authContext, clientId) {
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
function hasPermission(authContext, permission) {
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
function enforceReadOnly(operation) {
    const readOnlyOps = ['read', 'query', 'search', 'list', 'get', 'view', 'fetch', 'retrieve'];
    const writeOps = ['write', 'update', 'delete', 'create', 'modify', 'execute', 'restart', 'deploy', 'merge', 'rotate'];
    const normalizedOp = operation.toLowerCase();
    // Check if operation contains any write keywords
    if (writeOps.some(op => normalizedOp.includes(op))) {
        throw new Error(`OPERATION DENIED: '${operation}' is a write operation. ` +
            `This system is READ-ONLY. Only query/read operations are allowed.`);
    }
}
/**
 * Check access mode is allowed for user
 */
function canPerformAccessMode(authContext, mode, resource) {
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
function filterByAuthorizedClients(authContext, data) {
    return data.filter(item => {
        const clientId = item.clientId || item.client;
        if (!clientId)
            return false;
        return canAccessClient(authContext, clientId);
    });
}
/**
 * Validate auth context is properly formed
 */
function validateAuthContext(authContext) {
    const errors = [];
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
