import { getAssets } from '../../database/getAssets.js';
import { getFailedEnergyDataFiles, getPendingEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
import { getParserClasses } from '../../parsers/parserHelpers.js';
export function handler(request, response) {
    const pendingFiles = getPendingEnergyDataFiles();
    const failedFiles = getFailedEnergyDataFiles();
    const assets = getAssets();
    const parserClasses = getParserClasses();
    response.render('data', {
        headTitle: 'Data',
        pendingFiles,
        failedFiles,
        assets,
        parserClasses
    });
}
export default handler;
