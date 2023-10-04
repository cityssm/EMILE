import fs from 'node:fs/promises';
import path from 'node:path';
import Debug from 'debug';
import exitHook from 'exit-hook';
import papaparse from 'papaparse';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { getReportData } from '../database/getReportData.js';
import { reportCacheFolder, reportsToCache } from '../helpers/functions.reports.js';
const debug = Debug('emile:tasks:reportDataCache');
process.title = 'EMILE - reportDataCache';
const pollingIntervalMillis = 3600 * 1000 + 60000;
let terminateTask = false;
async function refreshReportDataCaches() {
    debug('Process started');
    for (const reportName of reportsToCache) {
        if (terminateTask) {
            break;
        }
        debug(`Getting report data: ${reportName} ...`);
        const data = (await getReportData(reportName)) ?? { data: [] };
        debug(`Converting ${data.data.length ?? 0} rows to CSV: ${reportName}`);
        if (data.header === undefined) {
            const csv = papaparse.unparse(data.data);
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
        else {
            const sliceSize = 50000;
            const dataWithHeader = [data.header, ...data.data];
            for (let sliceStart = 0; sliceStart < dataWithHeader.length; sliceStart += sliceSize) {
                const csv = papaparse.unparse(dataWithHeader.slice(sliceStart, sliceStart + sliceSize));
                try {
                    await (sliceStart === 0
                        ? fs.writeFile(path.join(reportCacheFolder, `${reportName}.csv`), csv)
                        : fs.appendFile(path.join(reportCacheFolder, `${reportName}.csv`), csv));
                    debug(`Report data written successfully: ${reportName}.csv`);
                }
                catch (error) {
                    debug(`Error writing report data: ${reportName}`);
                    debug(error);
                }
            }
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
