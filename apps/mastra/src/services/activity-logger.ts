interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

class ActivityLogger {
  private logs: ActivityLog[] = [];
  private maxLogs = 1000;

  log(
    userId: string,
    userName: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any> = {},
    metadata?: { ipAddress?: string; userAgent?: string }
  ): void {
    const log: ActivityLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    };

    this.logs.unshift(log);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console log for debugging
    console.log(
      `[ACTIVITY] ${log.timestamp} | ${userName} (${userId}) | ${action} | ${resource}:${resourceId}`,
      details
    );
  }

  // Get logs for a user
  getUserLogs(userId: string, limit = 50): ActivityLog[] {
    return this.logs.filter((log) => log.userId === userId).slice(0, limit);
  }

  // Get logs for a resource
  getResourceLogs(resource: string, resourceId: string, limit = 50): ActivityLog[] {
    return this.logs
      .filter((log) => log.resource === resource && log.resourceId === resourceId)
      .slice(0, limit);
  }

  // Get all recent logs
  getRecentLogs(limit = 100): ActivityLog[] {
    return this.logs.slice(0, limit);
  }

  // Get logs by action type
  getLogsByAction(action: string, limit = 50): ActivityLog[] {
    return this.logs.filter((log) => log.action === action).slice(0, limit);
  }

  // Search logs
  searchLogs(query: string, limit = 50): ActivityLog[] {
    const lowerQuery = query.toLowerCase();
    return this.logs
      .filter(
        (log) =>
          log.action.toLowerCase().includes(lowerQuery) ||
          log.resource.toLowerCase().includes(lowerQuery) ||
          log.resourceId.toLowerCase().includes(lowerQuery) ||
          log.userName.toLowerCase().includes(lowerQuery) ||
          JSON.stringify(log.details).toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }
}

export const activityLogger = new ActivityLogger();
