import { addAssetCategory } from '../../database/addAssetCategory.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export async function handler(request, response) {
    const categoryId = await addAssetCategory({
        category: request.body.category,
        fontAwesomeIconClasses: `${request.body['fontAwesomeIconClass-style']} fa-${request.body['fontAwesomeIconClass-className']}`
    }, request.session.user);
    const assetCategories = await getAssetCategories();
    response.json({
        success: true,
        categoryId,
        assetCategories
    });
}
export default handler;
