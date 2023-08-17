import { getAssetGroups } from '../../database/getAssetGroups.js';
import { getAssets } from '../../database/getAssets.js';
import { getAssetAliasTypes, getAssetCategories } from '../../helpers/functions.cache.js';
export function handler(request, response) {
    const assets = getAssets();
    const assetGroups = getAssetGroups(request.session.user);
    const assetCategories = getAssetCategories();
    const assetAliasTypes = request.session.user?.canUpdate ?? false ? getAssetAliasTypes() : [];
    response.render('assets', {
        headTitle: 'Assets',
        assets,
        assetGroups,
        assetCategories,
        assetAliasTypes
    });
}
export default handler;
