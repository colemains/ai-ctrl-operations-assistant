import { Alert, ToolResult, AuthContext } from '@ai-ctrl/contracts';
export interface AlertFilters {
    severity?: string;
    status?: string;
    component?: string;
    client?: string;
}
export declare class AlertAdapter {
    private mockDataPath;
    constructor(mockDataPath?: string);
    getAlerts(authContext: AuthContext, filters?: AlertFilters): Promise<ToolResult<Alert[]>>;
}
