import { getAssets } from '../../database/getAssets.js';
import { getPendingEnergyDataFiles, getProcessedEnergyDataFiles } from '../../database/getEnergyDataFiles.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { getParserClassesAndConfigurations } from '../../parsers/parserHelpers.js';
export async function handler(request, response) {
    const pendingFiles = await getPendingEnergyDataFiles();
    const processedFiles = await getProcessedEnergyDataFiles('');
    const assets = await getAssets({});
    const parserClassesAndConfigurations = getParserClassesAndConfigurations();
    const greenButtonSubscriptions = getConfigProperty('subscriptions.greenButton');
    response.render('data', {
        headTitle: 'Data Sources',
        menuItem: 'Data Sources',
        pendingFiles,
        processedFiles,
        assets,
        parserClassesAndConfigurations,
        greenButtonSubscriptions
    });
}
export default handler;
