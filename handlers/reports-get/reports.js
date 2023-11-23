import { getAssetGroups } from '../../database/getAssetGroups.js';
import { getAssets } from '../../database/getAssets.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export async function handler(request, response) {
    const assets = await getAssets({});
    const assetGroups = await getAssetGroups(request.session.user);
    const assetCategories = await getAssetCategories();
    response.render('reports', {
        headTitle: 'Reports',
        menuItem: 'Reports',
        assets,
        assetGroups,
        assetCategories
    });
}
export default handler;
