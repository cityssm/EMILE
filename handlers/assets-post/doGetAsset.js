import { getAsset } from '../../database/getAsset.js';
export function handler(request, response) {
    const asset = getAsset(request.body.assetId);
    response.json({
        success: asset !== undefined,
        asset
    });
}
export default handler;
