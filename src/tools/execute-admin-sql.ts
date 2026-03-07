import { z } from "zod";
import { ConnectorManager } from "../connectors/manager.js";
import { ConnectorRegistry } from "../connectors/interface.js";
import { createToolSuccessResponse, createToolErrorResponse } from "../utils/response-formatter.js";
import { getEffectiveSourceId, trackToolRequest } from "../utils/tool-handler-helpers.js";
import { buildDSNFromSource } from "../config/toml-loader.js";
import { SafeURL } from "../utils/safe-url.js";

// Schema for execute_admin_sql tool is structurally identical to execute_sql
export const executeAdminSqlSchema = {
    sql: z.string().describe("Administrative SQL to execute (e.g., CREATE DATABASE)"),
};

/**
 * Create an execute_admin_sql tool handler for a specific source.
 * This connects to the system/admin database rather than the configured database.
 */
export function createExecuteAdminSqlToolHandler(sourceId?: string) {
    return async (args: any, extra: any) => {
        const { sql } = args as { sql: string };
        const startTime = Date.now();
        const effectiveSourceId = getEffectiveSourceId(sourceId);
        let success = true;
        let errorMessage: string | undefined;
        let result: any;

        try {
            const sourceConfig = ConnectorManager.getSourceConfig(effectiveSourceId);
            if (!sourceConfig) {
                throw new Error(`Source configuration not found for ${effectiveSourceId}`);
            }

            // Clone config to override database for admin connection
            const adminConfig = { ...sourceConfig };

            switch (adminConfig.type) {
                case "postgres":
                    adminConfig.database = "postgres";
                    break;
                case "mysql":
                case "mariadb":
                    adminConfig.database = "sys";
                    break;
                case "sqlserver":
                    adminConfig.database = "master";
                    break;
                default:
                    throw new Error(`Admin SQL execution not supported for database type: ${adminConfig.type}`);
            }

            let actualDSN = adminConfig.dsn;
            if (actualDSN) {
                try {
                    const url = new SafeURL(actualDSN);
                    if (adminConfig.type === "postgres") {
                        url.pathname = "/postgres";
                    } else if (adminConfig.type === "mysql" || adminConfig.type === "mariadb") {
                        url.pathname = "/sys";
                    } else if (adminConfig.type === "sqlserver") {
                        url.pathname = "/master"; // Note: sqlserver DSNs vary
                    }
                    actualDSN = url.toString();
                } catch (e) {
                    // Fallback if parsing fails
                    actualDSN = buildDSNFromSource(adminConfig);
                }
            } else {
                actualDSN = buildDSNFromSource(adminConfig);
            }

            const connectorPrototype = ConnectorRegistry.getConnectorForDSN(actualDSN);
            if (!connectorPrototype) {
                throw new Error(`No connector found for admin DSN: ${actualDSN}`);
            }

            const adminConnector = connectorPrototype.clone();

            // Connect to the admin db
            await adminConnector.connect(actualDSN, undefined, { queryTimeoutSeconds: sourceConfig.query_timeout });

            try {
                result = await adminConnector.executeSQL(sql, { maxRows: 1000 });
            } finally {
                await adminConnector.disconnect();
            }

            const responseData = {
                rows: result.rows,
                count: result.rowCount,
                source_id: effectiveSourceId,
            };

            return createToolSuccessResponse(responseData);
        } catch (error) {
            success = false;
            errorMessage = (error as Error).message;
            return createToolErrorResponse(errorMessage, "EXECUTION_ERROR");
        } finally {
            trackToolRequest(
                {
                    sourceId: effectiveSourceId,
                    toolName: effectiveSourceId === "default" ? "execute_admin_sql" : `execute_admin_sql_${effectiveSourceId}`,
                    sql,
                },
                startTime,
                extra,
                success,
                errorMessage
            );
        }
    };
}
