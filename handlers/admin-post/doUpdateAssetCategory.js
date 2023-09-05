import { updateAssetCategory } from '../../database/updateAssetCategory.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export function handler(request, response) {
    const categoryId = updateAssetCategory({
        categoryId: request.body.categoryId,
        category: request.body.category,
        fontAwesomeIconClasses: `${request.body['fontAwesomeIconClass-style']} fa-${request.body['fontAwesomeIconClass-className']}`
    }, request.session.user);
    const assetCategories = getAssetCategories();
    response.json({
        success: true,
        categoryId,
        assetCategories
    });
}
export default handler;
