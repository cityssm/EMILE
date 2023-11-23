import { deleteAsset } from '../../database/deleteAsset.js';
import { getAssets } from '../../database/getAssets.js';
export async function handler(request, response) {
    const success = await deleteAsset(request.body.assetId, request.session.user);
    const assets = await getAssets({});
    response.json({
        success,
        assets
    });
}
export default handler;
