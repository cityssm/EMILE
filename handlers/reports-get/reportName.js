import fs from 'node:fs/promises';
import path from 'node:path';
import papaparse from 'papaparse';
import { getReportData } from '../../database/getReportData.js';
import { reportCacheFolder, reportsToCache } from '../../helpers/functions.reports.js';
import { hasActiveSession } from '../../helpers/functions.session.js';
export async function handler(request, response) {
    const reportName = request.params.reportName;
    let csv = '';
    if (reportsToCache.includes(reportName)) {
        try {
            csv = (await fs.readFile(path.join(reportCacheFolder, `${reportName}.csv`)));
        }
        catch {
        }
    }
    if ((csv ?? '') === '') {
        const rows = await getReportData(reportName, request.query);
        if (rows === undefined) {
            response.status(404).json({
                success: false,
                message: 'Report Not Found'
            });
            return;
        }
        csv =
            rows.header === undefined
                ? papaparse.unparse(rows.data)
                : papaparse.unparse([rows.header, ...rows.data]);
    }
    const disposition = hasActiveSession(request) ? 'attachment' : 'inline';
    response.setHeader('Content-Disposition', `${disposition}; filename=${reportName}-${Date.now().toString()}.csv`);
    response.setHeader('Content-Type', 'text/csv');
    response.send(csv);
}
export default handler;
