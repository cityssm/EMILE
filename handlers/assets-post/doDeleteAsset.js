import { deleteAsset } from '../../database/deleteAsset.js';
import { getAssets } from '../../database/getAssets.js';
export async function handler(request, response) {
    const success = deleteAsset(request.body.assetId, request.session.user);
    const assets = await getAssets({}, { includeEnergyDataStats: true });
    response.json({
        success,
        assets
    });
}
export default handler;
