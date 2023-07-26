import { getAssetCategories } from '../../database/getAssetCategories.js';
import { getAssetGroups } from '../../database/getAssetGroups.js';
import { getAssets } from '../../database/getAssets.js';
export function handler(request, response) {
    const assets = getAssets();
    const assetGroups = getAssetGroups(request.session.user);
    const assetCategories = getAssetCategories();
    response.render('assets', {
        headTitle: 'Assets',
        assets,
        assetGroups,
        assetCategories
    });
}
export default handler;
