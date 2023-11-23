import { getAsset } from '../../database/getAsset.js';
export async function handler(request, response) {
    const asset = await getAsset(request.body.assetId);
    response.json({
        success: asset !== undefined,
        asset
    });
}
export default handler;
