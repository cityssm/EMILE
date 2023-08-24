import { getAssets } from '../../database/getAssets.js';
import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
import { getParserClassesAndConfigurations } from '../../parsers/parserHelpers.js';
export function handler(request, response) {
    const pendingFiles = getPendingEnergyDataFiles();
    const processedFiles = getProcessedEnergyDataFiles('');
    const assets = getAssets();
    const parserClassesAndConfigurations = getParserClassesAndConfigurations();
    response.render('data', {
        headTitle: 'Data',
        pendingFiles,
        processedFiles,
        assets,
        parserClassesAndConfigurations
    });
}
export default handler;
