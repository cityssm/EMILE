import { getAssetGroups } from '../../database/getAssetGroups.js';
import { getAssets } from '../../database/getAssets.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export function handler(request, response) {
    const assets = getAssets();
    const assetGroups = getAssetGroups(request.session.user);
    const assetCategories = getAssetCategories();
    response.render('reports', {
        headTitle: 'Reports',
        menuItem: 'Reports',
        assets,
        assetGroups,
        assetCategories
    });
}
export default handler;
