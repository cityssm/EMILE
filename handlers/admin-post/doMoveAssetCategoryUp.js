import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getAssetCategories } from '../../helpers/functions.cache.js';
export async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('AssetCategories', request.body.categoryId)
        : moveRecordUp('AssetCategories', request.body.categoryId);
    const assetCategories = await getAssetCategories();
    response.json({
        success,
        assetCategories
    });
}
export default handler;
