import { addAsset } from '../../database/addAsset.js';
import { getAssets } from '../../database/getAssets.js';
export function handler(request, response) {
    const assetId = addAsset(request.body, request.session.user);
    const assets = getAssets();
    response.json({
        success: true,
        assetId,
        assets
    });
}
export default handler;
