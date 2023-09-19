import { getAssetGroups } from '../../database/getAssetGroups.js';
import { getAssets } from '../../database/getAssets.js';
import { getEnergyDataStatistics } from '../../database/getEnergyDataStatistics.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export async function handler(request, response) {
    const assets = await getAssets({});
    const assetGroups = getAssetGroups(request.session.user);
    const assetCategories = getAssetCategories();
    const energyDataStatistics = await getEnergyDataStatistics();
    response.render('dashboard', {
        headTitle: 'Dashboard',
        menuItem: 'Dashboard',
        assets,
        assetGroups,
        assetCategories,
        energyDataStatistics
    });
}
export default handler;
