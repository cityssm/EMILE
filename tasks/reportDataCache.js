import fs from 'node:fs/promises';
import path from 'node:path';
import Debug from 'debug';
import exitHook from 'exit-hook';
import papaparse from 'papaparse';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { getReportData } from '../database/getReportData.js';
import { reportCacheFolder, reportsToCache } from '../helpers/functions.reports.js';
const debug = Debug('emile:tasks:reportDataCache');
const pollingIntervalMillis = 3600 * 1000 + 60000;
let terminateTask = false;
async function refreshReportDataCaches() {
    debug('Process started');
    for (const reportName of reportsToCache) {
        if (terminateTask) {
            break;
        }
        debug(`Getting report data: ${reportName} ...`);
        const data = await getReportData(reportName) ?? [];
        debug(`Converting ${data.length ?? 0} rows to CSV: ${reportName}`);
        const csv = papaparse.unparse(data);
        debug(`Writing report data: ${reportName} ...`);
        try {
            await fs.writeFile(path.join(reportCacheFolder, `${reportName}.csv`), csv);
            debug(`Report data written successfully: ${reportName}.csv`);
        }
        catch (error) {
            debug(`Error writing report data: ${reportName}`);
            debug(error);
        }
    }
}
await refreshReportDataCaches().catch((error) => {
    debug('Error running task.');
    debug(error);
});
const intervalID = setIntervalAsync(refreshReportDataCaches, pollingIntervalMillis);
exitHook(() => {
    terminateTask = true;
    try {
        void clearIntervalAsync(intervalID);
    }
    catch {
        debug('Error exiting task.');
    }
});
