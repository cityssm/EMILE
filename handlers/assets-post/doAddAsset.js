import { addAsset } from '../../database/addAsset.js';
import { getAssets } from '../../database/getAssets.js';
export async function handler(request, response) {
    const assetId = addAsset(request.body, request.session.user);
    const assets = await getAssets({}, { includeEnergyDataStats: true });
    response.json({
        success: true,
        assetId,
        assets
    });
}
export default handler;
