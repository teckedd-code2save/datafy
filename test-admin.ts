import { loadTomlConfig } from './src/config/toml-loader.js';
import { ConnectorManager } from './src/connectors/manager.js';
import { initializeToolRegistry } from './src/tools/registry.js';
import { createExecuteAdminSqlToolHandler } from './src/tools/execute-admin-sql.js';
import { resolve } from 'path';
import "./src/connectors/postgres/index.js";

async function runTest() {
    const configPath = resolve(process.cwd(), 'dbhub.toml');
    const config = loadTomlConfig(configPath);

    initializeToolRegistry(config);

    const manager = new ConnectorManager();
    await manager.connectWithSources(config.sources);

    console.log("Sources connected. Testing execute_admin_sql...");

    const handler = createExecuteAdminSqlToolHandler('ride_sharing');

    try {
        console.log("Executing DROP DATABASE IF EXISTS...");
        const dropRes = await handler({ sql: "DROP DATABASE IF EXISTS test_db_admin;" }, {});
        console.log(dropRes);

        console.log("Executing CREATE DATABASE...");
        const createRes = await handler({ sql: "CREATE DATABASE test_db_admin;" }, {});
        console.log(createRes);

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await manager.disconnect();
    }
}

runTest().catch(console.error);
