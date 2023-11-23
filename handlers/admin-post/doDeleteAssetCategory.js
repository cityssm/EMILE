import { deleteAssetCategory } from '../../database/deleteAssetCategory.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export async function handler(request, response) {
    const success = deleteAssetCategory(request.body.categoryId, request.session.user);
    const assetCategories = await getAssetCategories();
    response.json({
        success,
        assetCategories
    });
}
export default handler;
