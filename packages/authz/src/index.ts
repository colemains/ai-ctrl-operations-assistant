import { AuthContext } from '@ai-ctrl/contracts';

/**
 * Authorization utilities for AI CTRL platform
 */

/**
 * Check if user has access to a specific client
 */
export function canAccessClient(
  authContext: AuthContext,
  clientName: string
): boolean {
  // If no authorized clients specified, allow all
  if (authContext.authorizedClients.length === 0) {
    return true;
  }

  return authContext.authorizedClients.includes(clientName);
}

/**
 * Check if user has access to a specific discipline
 */
export function canAccessDiscipline(
  authContext: AuthContext,
  discipline: 'SMC' | 'NOC' | 'Security' | 'Engineering'
): boolean {
  return authContext.discipline === discipline;
}

/**
 * Filter array by authorized clients
 */
export function filterByAuthorizedClients<T extends { client: string }>(
  items: T[],
  authContext: AuthContext
): T[] {
  // If no authorized clients specified, return all
  if (authContext.authorizedClients.length === 0) {
    return items;
  }

  return items.filter(item =>
    authContext.authorizedClients.includes(item.client)
  );
}

/**
 * Enforce read-only access (throws if user tries to modify)
 */
export function enforceReadOnly(authContext: AuthContext): void {
  // For demo, we'll allow all modifications
  // In production, this would check user permissions
  return;
}

/**
 * Check if user is in a specific organization
 */
export function isInOrganization(
  authContext: AuthContext,
  organizationId: string
): boolean {
  return authContext.organizationId === organizationId;
}

/**
 * Get user's accessible clients
 */
export function getAccessibleClients(authContext: AuthContext): string[] {
  return authContext.authorizedClients;
}

/**
 * Validate auth context has required fields
 */
export function validateAuthContext(authContext: AuthContext): boolean {
  return !!(
    authContext.userId &&
    authContext.organizationId &&
    authContext.discipline &&
    Array.isArray(authContext.authorizedClients)
  );
}
