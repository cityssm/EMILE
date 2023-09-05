import { deleteAssetCategory } from '../../database/deleteAssetCategory.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export function handler(request, response) {
    const success = deleteAssetCategory(request.body.categoryId, request.session.user);
    const assetCategories = getAssetCategories();
    response.json({
        success,
        assetCategories
    });
}
export default handler;
