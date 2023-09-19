import { getAssets } from '../../database/getAssets.js';
import { mergeAssets } from '../../database/mergeAssets.js';
export async function handler(request, response) {
    const assetId = await mergeAssets(request.body, request.session.user);
    const assets = getAssets({}, { includeEnergyDataStats: true });
    response.json({
        success: true,
        assetId,
        assets
    });
}
export default handler;
