import { getAssets } from '../../database/getAssets.js';
import { updateAsset } from '../../database/updateAsset.js';
export async function handler(request, response) {
    const success = await updateAsset(request.body, request.session.user);
    const assets = await getAssets({});
    response.json({
        success,
        assets
    });
}
export default handler;
