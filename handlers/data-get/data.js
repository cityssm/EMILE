import { getAssets } from '../../database/getAssets.js';
import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
import { getParserClasses } from '../../parsers/parserHelpers.js';
export function handler(request, response) {
    const pendingFiles = getPendingEnergyDataFiles();
    const processedFiles = getProcessedEnergyDataFiles('');
    const assets = getAssets();
    const parserClasses = getParserClasses();
    response.render('data', {
        headTitle: 'Data',
        pendingFiles,
        processedFiles,
        assets,
        parserClasses
    });
}
export default handler;
