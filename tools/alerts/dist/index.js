"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertAdapter = void 0;
const authz_1 = require("@ai-ctrl/authz");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class AlertAdapter {
    constructor(mockDataPath) {
        this.mockDataPath = mockDataPath || path_1.default.join(__dirname, '../../../data/mock/alerts.json');
    }
    async getAlerts(authContext, filters) {
        (0, authz_1.enforceReadOnly)('query_alerts');
        try {
            const rawData = await promises_1.default.readFile(this.mockDataPath, 'utf-8');
            let alerts = JSON.parse(rawData);
            // Filter by authorized clients
            alerts = (0, authz_1.filterByAuthorizedClients)(authContext, alerts);
            // Apply filters
            if (filters?.severity) {
                alerts = alerts.filter(a => a.severity === filters.severity);
            }
            if (filters?.status) {
                alerts = alerts.filter(a => a.status === filters.status);
            }
            if (filters?.component) {
                alerts = alerts.filter(a => a.component === filters.component);
            }
            if (filters?.client) {
                alerts = alerts.filter(a => a.client === filters.client);
            }
            return {
                success: true,
                data: alerts,
                citations: ['Alert System Mock Data'],
                auditLog: {
                    action: 'query_alerts',
                    resource: 'alerts',
                    timestamp: new Date().toISOString(),
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error reading alerts',
            };
        }
    }
}
exports.AlertAdapter = AlertAdapter;
