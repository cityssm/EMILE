import { cleanupDatabase } from '../database/cleanupDatabase.js';
import { initializeDatabase } from '../database/initializeDatabase.js';
import { ensureEnergyDataTablesExists, refreshAggregatedEnergyDataTables, refreshEnergyDataTableViews } from '../database/manageEnergyDataTables.js';
import { backupDatabase, getConnectionWhenAvailable } from '../helpers/functions.database.js';
async function runMaintenance() {
    await backupDatabase();
    const emileDB = await getConnectionWhenAvailable();
    console.log('Ensure database is initialized.');
    await initializeDatabase(emileDB);
    console.log('Ensure all asset data tables exist.');
    const assetIds = emileDB
        .prepare('select assetId from Assets')
        .pluck()
        .all();
    console.log(`${assetIds.length} assets to check.`);
    for (const assetId of assetIds) {
        await ensureEnergyDataTablesExists(assetId, emileDB);
        refreshAggregatedEnergyDataTables(assetId, emileDB);
    }
    console.log('Refreshing energy data table views.');
    await refreshEnergyDataTableViews(emileDB);
    console.log('Cleaning up database.');
    await cleanupDatabase();
}
await runMaintenance();
