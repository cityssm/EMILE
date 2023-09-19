import { getAssets } from '../../database/getAssets.js';
import { updateAsset } from '../../database/updateAsset.js';
export async function handler(request, response) {
    const success = updateAsset(request.body, request.session.user);
    const assets = await getAssets({}, { includeEnergyDataStats: true });
    response.json({
        success,
        assets
    });
}
export default handler;
